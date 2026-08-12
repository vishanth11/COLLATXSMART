import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin" | null): TrpcContext {
  return {
    user: role ? { id: role === "admin" ? 2 : 1, openId: `${role}-test`, name: role === "admin" ? "Admin" : "Customer", email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("loan workspace access control", () => {
  it("rejects unauthenticated customer dashboard access", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.customer.dashboard()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a customer from admin dashboard access", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an admin to enter the admin dashboard procedure", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    const result = await caller.admin.dashboard();
    expect(result.summary).toMatchObject({ totalApplications: expect.any(Number), activeLoans: expect.any(Number) });
  });
});
