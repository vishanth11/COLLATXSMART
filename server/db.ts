import { connectMongo } from "./mongo";
import { nextSequence } from "./models/counter";
import { User, type UserDoc } from "./models/User";
import { CustomerProfile } from "./models/CustomerProfile";
import { LoanApplication } from "./models/LoanApplication";
import { Loan } from "./models/Loan";
import { Payment } from "./models/Payment";
import { DocumentModel } from "./models/DocumentModel";
import { Collateral } from "./models/Collateral";
import { ENV } from "./_core/env";

export type InsertUser = Partial<UserDoc> & { openId: string };

/**
 * Ensures the Mongo connection is established. Returns `true` if connected,
 * `false` if MONGODB_URI isn't configured (callers fall back to safe defaults,
 * matching the previous MySQL behaviour of "no DATABASE_URL -> no-op").
 */
export async function getDb() {
  const conn = await connectMongo();
  return conn ? true : false;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  if (!(await getDb())) return;

  const update: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach((field) => {
    if (user[field] !== undefined) update[field] = user[field] ?? null;
  });
  if (user.lastSignedIn !== undefined) update.lastSignedIn = user.lastSignedIn;
  else update.lastSignedIn = new Date();
  if (user.role !== undefined) update.role = user.role;
  else if (user.openId === ENV.ownerOpenId) update.role = "admin";

  const existing = await User.findOne({ openId: user.openId }).lean();
  if (existing) {
    await User.updateOne({ openId: user.openId }, { $set: update });
  } else {
    const id = await nextSequence("User");
    await User.create({ id, openId: user.openId, role: "user", ...update });
  }
}

export async function getUserByOpenId(openId: string) {
  if (!(await getDb())) return undefined;
  const result = await User.findOne({ openId }).lean();
  return result || undefined;
}

// ---------------------------------------------------------------------------
// Loan applications
// ---------------------------------------------------------------------------

export async function createLoanApplication(input: Record<string, any>) {
  if (!(await getDb())) return { id: 0, ...input };
  const id = await nextSequence("LoanApplication");
  const created = await LoanApplication.create({ id, ...input });
  return { id: created.id, applicationNumber: created.applicationNumber };
}

export async function listLoanApplications() {
  if (!(await getDb())) return [];
  return LoanApplication.find().sort({ createdAt: -1 }).lean();
}

export async function updateLoanApplicationStatus(
  id: number,
  status: "under_review" | "approved" | "rejected" | "documents_required",
  adminNote?: string,
) {
  if (!(await getDb())) return { id, status, adminNote };
  await LoanApplication.updateOne({ id }, { $set: { status, adminNote: adminNote || null } });

  if (status === "approved") {
    const application = await LoanApplication.findOne({ id }).lean();
    if (application && application.userId) {
      const existingLoan = await Loan.findOne({ applicationId: id }).lean();
      if (!existingLoan) {
        const principal = application.requiredAmount;
        const term = application.preferredDuration || 12;
        const installment = Math.ceil(principal / term);
        const loanId = await nextSequence("Loan");
        await Loan.create({
          id: loanId,
          applicationId: id,
          userId: application.userId,
          loanNumber: `CXS-${new Date().getFullYear()}-${String(id).padStart(5, "0")}`,
          loanType: application.loanType,
          principalAmount: principal,
          interestRate: 6,
          termMonths: term,
          repaymentFrequency: application.repaymentFrequency,
          installmentAmount: installment,
          outstanding: principal,
          status: "approved",
          approvedAt: new Date(),
          nextDueDate: new Date(Date.now() + 30 * 86400000),
        });
      }
    }
  }
  return { id, status, adminNote };
}

// ---------------------------------------------------------------------------
// Collateral
// ---------------------------------------------------------------------------

export async function createCollateral(input: {
  applicationId: number;
  userId?: number | null;
  type: string;
  details?: string | null;
  estimatedValue?: number | null;
  referenceNumber?: string | null;
  status?: "pending" | "verified" | "rejected" | "released";
}) {
  if (!(await getDb())) return { id: 0, ...input };
  const id = await nextSequence("Collateral");
  const created = await Collateral.create({ id, status: "pending", ...input });
  return created.toObject();
}

// ---------------------------------------------------------------------------
// Admin aggregate views
// ---------------------------------------------------------------------------

export async function getAdminSummary() {
  if (!(await getDb())) {
    return { summary: { totalApplications: 0, activeLoans: 0, outstanding: 0, collection: 0 }, distribution: [], trend: [], applications: [] };
  }

  const totalApplications = await LoanApplication.countDocuments();
  const activeLoans = await Loan.countDocuments({ status: { $in: ["approved", "disbursed", "active", "overdue"] } });

  const outstandingAgg = await Loan.aggregate([{ $group: { _id: null, total: { $sum: "$outstanding" } } }]);
  const outstanding = outstandingAgg[0]?.total || 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const collectionAgg = await Payment.aggregate([
    { $match: { paidAt: { $gte: startOfMonth, $lt: startOfNextMonth } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const collection = collectionAgg[0]?.total || 0;

  const distributionAgg = await LoanApplication.aggregate([
    { $group: { _id: "$loanType", value: { $sum: 1 } } },
  ]);
  const distribution = distributionAgg.map((d) => ({ name: d._id, value: d.value }));

  const allPayments = await Payment.find().sort({ paidAt: -1 }).limit(60).lean();
  const trendMap = new Map<string, number>();
  allPayments.forEach((payment) => {
    const key = new Date(payment.paidAt).toLocaleDateString("en-IN", { month: "short" });
    trendMap.set(key, (trendMap.get(key) || 0) + Number(payment.amount || 0));
  });
  const trend = Array.from(trendMap.entries()).reverse().map(([month, amount]) => ({ month, amount }));

  return {
    summary: { totalApplications, activeLoans, outstanding, collection },
    distribution,
    trend,
    applications: await listLoanApplications(),
  };
}

export async function getAdminCollectionData() {
  if (!(await getDb())) return [];
  return Payment.find().sort({ paidAt: -1 }).limit(100).lean();
}

export async function getAdminLoans() {
  if (!(await getDb())) return [];
  return Loan.find().sort({ createdAt: -1 }).lean();
}

export async function getAdminCustomers() {
  if (!(await getDb())) return [];
  const users = await User.find().sort({ createdAt: -1 }).lean();
  const profiles = await CustomerProfile.find().lean();
  const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  return users.map((u) => {
    const profile = profileByUserId.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      phone: profile?.phone ?? null,
      occupation: profile?.occupation ?? null,
      monthlyIncome: profile?.monthlyIncome ?? null,
    };
  });
}

export async function getAdminCollateral() {
  if (!(await getDb())) return [];
  return Collateral.find().sort({ createdAt: -1 }).lean();
}

export async function getAdminDocuments() {
  if (!(await getDb())) return [];
  return DocumentModel.find().sort({ createdAt: -1 }).lean();
}

// ---------------------------------------------------------------------------
// Customer views
// ---------------------------------------------------------------------------

export async function getCustomerDashboard(userId: number) {
  if (!(await getDb())) return { loan: null, totalPaid: 0, schedule: [] };
  const loan = await Loan.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!loan) return { loan: null, totalPaid: 0, schedule: [] };

  const paidRows = await Payment.find({ userId, loanId: loan.id }).sort({ paidAt: -1 }).lean();
  const totalPaid = paidRows.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const schedule = Array.from({ length: Math.min(loan.termMonths || 0, 6) }, (_, index) => ({
    installmentNumber: index + 1,
    dueDate: new Date((loan.nextDueDate ? new Date(loan.nextDueDate) : new Date()).getTime() + index * 30 * 86400000),
    amount: loan.installmentAmount,
    status: index < paidRows.length ? "paid" : "pending",
  }));
  return { loan: { ...loan, nextDueAmount: loan.installmentAmount }, totalPaid, schedule };
}

export async function getCustomerLoan(userId: number) {
  if (!(await getDb())) return null;
  const loan = await Loan.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!loan) return null;
  const installmentsPaid = await Payment.countDocuments({ loanId: loan.id, userId });
  const totalInstallments = loan.termMonths || 0;
  return {
    ...loan,
    nextDueAmount: loan.installmentAmount,
    installmentsPaid,
    totalInstallments,
    progress: totalInstallments ? Math.round((installmentsPaid / totalInstallments) * 100) : 0,
  };
}

export async function getCustomerPayments(userId: number) {
  if (!(await getDb())) return [];
  return Payment.find({ userId }).sort({ paidAt: -1 }).lean();
}

export async function getCustomerDocuments(userId: number) {
  if (!(await getDb())) return [];
  return DocumentModel.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getCustomerProfile(userId: number) {
  if (!(await getDb())) return null;
  const user = await User.findOne({ id: userId }).lean();
  if (!user) return null;
  const profile = await CustomerProfile.findOne({ userId }).lean();
  return {
    name: user.name,
    email: user.email,
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    occupation: profile?.occupation ?? null,
    monthlyIncome: profile?.monthlyIncome ?? null,
  };
}

export async function updateCustomerProfile(
  userId: number,
  input: { name: string; email: string; phone: string; address: string; occupation: string; monthlyIncome: number },
) {
  if (!(await getDb())) return input;
  await User.updateOne({ id: userId }, { $set: { name: input.name, email: input.email } });

  const existing = await CustomerProfile.findOne({ userId }).lean();
  const fields = { phone: input.phone, address: input.address, occupation: input.occupation, monthlyIncome: input.monthlyIncome };
  if (existing) {
    await CustomerProfile.updateOne({ userId }, { $set: fields });
  } else {
    const id = await nextSequence("CustomerProfile");
    await CustomerProfile.create({ id, userId, ...fields });
  }
  return input;
}

export async function addDocument(input: Record<string, any>) {
  if (!(await getDb())) return { id: 0, ...input };
  const id = await nextSequence("Document");
  const created = await DocumentModel.create({ id, ...input });
  return created.toObject();
}
