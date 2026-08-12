import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  addDocument: vi.fn(async (input: any) => ({ id: 4, ...input })),
  createLoanApplication: vi.fn(async (input: any) => ({ id: 12, ...input })),
  getAdminCollectionData: vi.fn(async () => []),
  getAdminCollateral: vi.fn(async () => []),
  getAdminCustomers: vi.fn(async () => []),
  getAdminDocuments: vi.fn(async () => []),
  getAdminLoans: vi.fn(async () => []),
  getAdminSummary: vi.fn(async () => ({ summary: { totalApplications: 0, activeLoans: 0, outstanding: 0, collection: 0 }, distribution: [], trend: [], applications: [] })),
  getCustomerDashboard: vi.fn(async () => ({ loan: null, totalPaid: 0, schedule: [] })),
  getCustomerDocuments: vi.fn(async () => []),
  getCustomerLoan: vi.fn(async () => null),
  getCustomerPayments: vi.fn(async () => []),
  getCustomerProfile: vi.fn(async () => ({ name: "Test", email: "test@example.com" })),
  getDb: vi.fn(async () => null),
  listLoanApplications: vi.fn(async () => []),
  updateCustomerProfile: vi.fn(async (_userId: number, input: any) => input),
  updateLoanApplicationStatus: vi.fn(async (id: number, status: string) => ({ id, status })),
}));
const storageMock = vi.hoisted(() => ({ storagePut: vi.fn(async () => ({ key: "customer-1/test.txt", url: "/manus-storage/customer-1/test.txt" })) }));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMock);

import { appRouter } from "./routers";

function contextFor(role: "user" | "admin" | null): TrpcContext {
  return {
    user: role ? { id: role === "admin" ? 2 : 1, openId: `${role}-procedure-test`, name: role === "admin" ? "Admin" : "Customer", email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const application = { fullName: "Test Applicant", mobile: "9876543210", email: "applicant@example.com", address: "Coimbatore", occupation: "Designer", monthlyIncome: 45000, loanType: "personal", requiredAmount: 150000, purpose: "Home repairs", repaymentFrequency: "monthly", preferredDuration: 12, collateralType: "none" };

describe("loan management procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a public application without requiring authentication", async () => {
    const result = await appRouter.createCaller(contextFor(null)).loanApplications.create(application);
    expect(result.success).toBe(true);
    expect(result.applicationNumber).toMatch(/^CXS-/);
    expect(dbMocks.createLoanApplication).toHaveBeenCalledWith(expect.objectContaining({ fullName: application.fullName, status: "submitted" }));
  });

  it("allows admins to update an application decision", async () => {
    const result = await appRouter.createCaller(contextFor("admin")).admin.applications.setStatus({ id: 12, status: "approved" });
    expect(result).toMatchObject({ id: 12, status: "approved" });
    expect(dbMocks.updateLoanApplicationStatus).toHaveBeenCalledWith(12, "approved", undefined);
  });

  it("updates only the authenticated customer's profile", async () => {
    const profile = { name: "Updated Customer", email: "updated@example.com", phone: "9876543210", address: "Gandhipuram", occupation: "Consultant", monthlyIncome: 62000 };
    const result = await appRouter.createCaller(contextFor("user")).customer.profileUpdate(profile);
    expect(result).toEqual(profile);
    expect(dbMocks.updateCustomerProfile).toHaveBeenCalledWith(1, profile);
  });

  it("stores uploaded document metadata after sending bytes to managed storage", async () => {
    const result = await appRouter.createCaller(contextFor("user")).documents.upload({ fileName: "salary-proof.txt", mimeType: "text/plain", contentBase64: Buffer.from("safe test content").toString("base64") });
    expect(result).toMatchObject({ id: 4, fileName: "salary-proof.txt", url: "/manus-storage/customer-1/test.txt" });
    expect(storageMock.storagePut).toHaveBeenCalled();
    expect(dbMocks.addDocument).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, fileName: "salary-proof.txt" }));
  });
});
