import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = { redirectOnUnauthenticated?: boolean; redirectPath?: string };
type PreviewRole = "admin" | "user";

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => utils.auth.me.setData(undefined, null) });
  const previewRole = import.meta.env.DEV && typeof window !== "undefined" ? ((new URLSearchParams(window.location.search).get("preview") || window.localStorage.getItem("collatx-preview-role")) as PreviewRole | null) : null;
  const previewUser = useMemo(() => previewRole ? { id: previewRole === "admin" ? 9001 : 9002, openId: `dev-preview-${previewRole}`, name: previewRole === "admin" ? "Preview Admin" : "Preview Customer", email: `${previewRole}@example.com`, loginMethod: "preview", role: previewRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null, [previewRole]);

  const logout = useCallback(async () => {
    if (previewUser) {
      window.localStorage.removeItem("collatx-preview-role");
      window.location.href = "/";
      return;
    }
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return;
      throw error;
    } finally {
      try { sessionStorage.removeItem("manus-cookie"); } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, previewUser, utils]);

  const state = useMemo(() => {
    if (previewUser) return { user: previewUser, loading: false, error: null, isAuthenticated: true };
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(meQuery.data));
    return { user: meQuery.data ?? null, loading: meQuery.isLoading || logoutMutation.isPending, error: meQuery.error ?? logoutMutation.error ?? null, isAuthenticated: Boolean(meQuery.data) };
  }, [logoutMutation.error, logoutMutation.isPending, meQuery.data, meQuery.error, meQuery.isLoading, previewUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || previewUser) return;
    if (meQuery.isLoading || logoutMutation.isPending || state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath; else startLogin();
  }, [logoutMutation.isPending, meQuery.isLoading, previewUser, redirectOnUnauthenticated, redirectPath, state.user]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
