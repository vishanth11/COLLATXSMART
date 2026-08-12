import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addDocument, createCollateral, createLoanApplication, getAdminCollectionData, getAdminCollateral, getAdminCustomers, getAdminDocuments, getAdminLoans, getAdminSummary, getCustomerDashboard, getCustomerDocuments, getCustomerLoan, getCustomerPayments, getCustomerProfile, listLoanApplications, updateCustomerProfile, updateLoanApplicationStatus } from "./db";
import { storagePut } from "./storage";

const applicationInput = z.object({
  fullName: z.string().min(2), mobile: z.string().min(8), email: z.string().email(), address: z.string().min(3), occupation: z.string().min(2), monthlyIncome: z.number().int().nonnegative(), loanType: z.string().min(2), requiredAmount: z.number().int().positive(), purpose: z.string().min(3), repaymentFrequency: z.string().min(2), preferredDuration: z.number().int().positive(), collateralType: z.string().min(2), collateralDetails: z.string().optional(), estimatedValue: z.number().int().nonnegative().optional(), referenceNumber: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  loanApplications: router({
    create: publicProcedure.input(applicationInput).mutation(async ({ input, ctx }) => {
      const applicationNumber = `CXS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const created = await createLoanApplication({ ...input, userId: ctx.user?.id || null, applicationNumber, status: "submitted" });
      if (input.collateralType !== "none") await createCollateral({ applicationId: created.id, userId: ctx.user?.id || null, type: input.collateralType, details: input.collateralDetails || null, estimatedValue: input.estimatedValue || null, referenceNumber: input.referenceNumber || null, status: "pending" });
      return { success: true, applicationNumber };
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => getAdminSummary()),
    applications: router({
      list: adminProcedure.query(() => listLoanApplications()),
      setStatus: adminProcedure.input(z.object({ id: z.number().int(), status: z.enum(["under_review", "approved", "rejected", "documents_required"]), adminNote: z.string().optional() })).mutation(({ input }) => updateLoanApplicationStatus(input.id, input.status, input.adminNote)),
    }),
    loans: adminProcedure.query(() => getAdminLoans()),
    customers: adminProcedure.query(() => getAdminCustomers()),
    payments: adminProcedure.query(() => getAdminCollectionData()),
    collateral: adminProcedure.query(() => getAdminCollateral()),
    documents: adminProcedure.query(() => getAdminDocuments()),
  }),
  customer: router({
    dashboard: protectedProcedure.query(({ ctx }) => getCustomerDashboard(ctx.user.id)),
    loan: protectedProcedure.query(({ ctx }) => getCustomerLoan(ctx.user.id)),
    payments: protectedProcedure.query(({ ctx }) => getCustomerPayments(ctx.user.id)),
    documents: protectedProcedure.query(({ ctx }) => getCustomerDocuments(ctx.user.id)),
    profile: protectedProcedure.query(({ ctx }) => getCustomerProfile(ctx.user.id)),
    profileUpdate: protectedProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(8), address: z.string().min(3), occupation: z.string().min(2), monthlyIncome: z.number().int().nonnegative() })).mutation(({ ctx, input }) => updateCustomerProfile(ctx.user.id, input)),
  }),
  documents: router({
    upload: protectedProcedure.input(z.object({ fileName: z.string().min(1), mimeType: z.string().min(1), contentBase64: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const bytes = Buffer.from(input.contentBase64, "base64");
      if (bytes.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Please upload a file smaller than 8 MB." });
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const result = await storagePut(`customer-${ctx.user.id}/${Date.now()}-${safeName}`, bytes, input.mimeType);
      return addDocument({ userId: ctx.user.id, loanId: null, fileName: input.fileName, documentType: "loan document", mimeType: input.mimeType, fileKey: result.key, url: result.url, verificationStatus: "pending" });
    }),
  }),
});

export type AppRouter = typeof appRouter;
