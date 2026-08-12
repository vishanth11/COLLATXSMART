import { ArrowUpRight, Inbox, TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";

export function WorkspacePageHeader({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: ReactNode }) {
  return <div className="workspace-page-header"><div><span className="workspace-eyebrow">{eyebrow || "Workspace"}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{action && <div className="workspace-page-header__action">{action}</div>}</div>;
}

export function StatCard({ label, value, detail, tone = "neutral", trend }: { label: string; value: string; detail?: string; tone?: "orange" | "green" | "blue" | "neutral"; trend?: "up" | "down" }) {
  return <article className={`stat-card stat-card--${tone}`}><span className="stat-card__label">{label}</span><strong>{value}</strong>{detail && <span className="stat-card__detail">{trend === "up" ? <TrendingUp size={14} /> : trend === "down" ? <TrendingDown size={14} /> : null}{detail}</span>}<span className="stat-card__orb" /></article>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll("_", " ");
  const tone = normalized.includes("approved") || normalized.includes("active") || normalized.includes("paid") || normalized.includes("completed") ? "success" : normalized.includes("reject") || normalized.includes("overdue") ? "danger" : normalized.includes("review") || normalized.includes("pending") || normalized.includes("required") ? "warning" : "neutral";
  return <span className={`status-badge status-badge--${tone}`}>{normalized}</span>;
}

export function EmptyState({ title = "Nothing here yet.", body = "New records will appear here when they are available.", action }: { title?: string; body?: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state__icon"><Inbox size={20} /></div><h3>{title}</h3><p>{body}</p>{action && <div>{action}</div>}</div>;
}

export function ViewLink({ children = "View details" }: { children?: ReactNode }) {
  return <button className="table-view-link" type="button">{children} <ArrowUpRight size={14} /></button>;
}
