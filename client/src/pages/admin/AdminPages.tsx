import { BarChart3, Check, CircleDollarSign, FileCheck2, FileText, HandCoins, MoreHorizontal, PieChart as PieIcon, ShieldAlert, Users, X } from "lucide-react";
import { Link } from "wouter";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { EmptyState, StatCard, StatusBadge, ViewLink, WorkspacePageHeader } from "@/components/WorkspaceUI";
import { PreviewAdmin } from "../PreviewWorkspace";

const money = (value?: number | string) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value?: string | Date | null) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const chartColors = ["#ff5a1f", "#143d36", "#b8a98a", "#6d6b65", "#eeceb5", "#1d2724"];

export function AdminDashboard() {
  const { t } = useLanguage();
  const { data, isLoading } = trpc.admin.dashboard.useQuery();
  const isPreview = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "admin";
  if (isPreview) return <PreviewAdmin />;
  if (isLoading) return <AdminLoading />;
  const summary = data?.summary;
  return <div><WorkspacePageHeader eyebrow="CollatXSmart / Operations" title={t("admin.heading")} body={t("admin.body")} action={<Link href="/admin/requests" className="button button--orange">{t("admin.viewRequests")} <ShieldAlert size={16} /></Link>} /><div className="stats-grid"><StatCard label={t("admin.totalApplications")} value={String(summary?.totalApplications || 0)} detail="All time" tone="orange" /><StatCard label={t("admin.activeLoans")} value={String(summary?.activeLoans || 0)} detail="Across all products" tone="blue" /><StatCard label={t("admin.outstanding")} value={money(summary?.outstanding)} detail="Principal outstanding" tone="neutral" /><StatCard label={t("admin.collection")} value={money(summary?.collection)} detail="Recorded this month" tone="green" /></div><div className="chart-grid"><section className="workspace-panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">Portfolio</span><h2>{t("admin.loanMix")}</h2></div><PieIcon size={20} /></div>{data?.distribution?.length ? <div className="chart-layout"><ResponsiveContainer width="54%" height={230}><PieChart><Pie data={data.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={84} paddingAngle={4}>{data.distribution.map((_: any, index: number) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d2", background: "#fffdf7" }} /></PieChart></ResponsiveContainer><div className="chart-legend">{data.distribution.map((item: any, index: number) => <div key={item.name}><span style={{ background: chartColors[index % chartColors.length] }} /><span>{t(`loan.${item.name}`)}</span><strong>{item.value}</strong></div>)}</div></div> : <EmptyState title="No applications yet" body="The distribution chart will populate as applications come in." />}</section><section className="workspace-panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">Cash flow</span><h2>{t("admin.collectionTrend")}</h2></div><BarChart3 size={20} /></div>{data?.trend?.length ? <ResponsiveContainer width="100%" height={250}><LineChart data={data.trend} margin={{ top: 12, right: 14, left: -12, bottom: 0 }}><XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8880" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 12, fill: "#8a8880" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d2", background: "#fffdf7" }} /><Line type="monotone" dataKey="amount" stroke="#ff5a1f" strokeWidth={3} dot={{ r: 4, fill: "#ff5a1f" }} /></LineChart></ResponsiveContainer> : <EmptyState title="No collection trend yet" body="Recorded payments will create the monthly trend line." />}</section></div><section className="workspace-panel review-panel"><div className="panel-heading"><div><span className="panel-kicker">Needs attention</span><h2>{t("admin.reviewQueue")}</h2><p>{t("admin.reviewQueueBody")}</p></div><Link href="/admin/requests" className="text-link">{t("common.viewAll")} <MoreHorizontal size={16} /></Link></div><ApplicationTable rows={(data?.applications || []).slice(0, 4)} compact /></section></div>;
}

export function AdminRequests() {
  const { t } = useLanguage();
  const { data, isLoading, refetch } = trpc.admin.applications.list.useQuery();
  const mutation = trpc.admin.applications.setStatus.useMutation({ onSuccess: () => refetch() });
  return <div><WorkspacePageHeader eyebrow={t("dashboard.requests")} title="Loan requests" body="Review incoming applications and move them through the next stage." />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><ApplicationTable rows={data || []} onAction={(id, status) => mutation.mutate({ id, status })} /></section>}</div>;
}

export function AdminLoans() {
  const { t } = useLanguage(); const { data, isLoading } = trpc.admin.loans.useQuery();
  return <div><WorkspacePageHeader eyebrow={t("dashboard.loans")} title="Active loans" body={t("admin.loansBody")} />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Loan number</th><th>Type</th><th>Principal</th><th>Outstanding</th><th>Next due</th><th>Status</th><th /></tr></thead><tbody>{data?.length ? data.map((loan: any) => <tr key={loan.id}><td><strong>{loan.loanNumber}</strong></td><td>{t(`loan.${loan.loanType}`)}</td><td>{money(loan.principalAmount)}</td><td>{money(loan.outstanding)}</td><td>{date(loan.nextDueDate)}</td><td><StatusBadge status={loan.status} /></td><td><ViewLink /></td></tr>) : <tr><td colSpan={7}><EmptyState /></td></tr>}</tbody></table></div></section>}</div>;
}

export function AdminCustomers() {
  const { t } = useLanguage(); const { data, isLoading } = trpc.admin.customers.useQuery();
  return <div><WorkspacePageHeader eyebrow={t("dashboard.customers")} title="Customers" body={t("admin.customersBody")} />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Occupation</th><th>Income</th><th>Joined</th><th /></tr></thead><tbody>{data?.length ? data.map((customer: any) => <tr key={customer.id}><td><div className="table-person"><span className="avatar avatar--small">{(customer.name || "U").slice(0, 1).toUpperCase()}</span><strong>{customer.name || "Unnamed customer"}</strong></div></td><td>{customer.email || "—"}</td><td>{customer.phone || "—"}</td><td>{customer.occupation || "—"}</td><td>{money(customer.monthlyIncome)}</td><td>{date(customer.createdAt)}</td><td><ViewLink /></td></tr>) : <tr><td colSpan={7}><EmptyState /></td></tr>}</tbody></table></div></section>}</div>;
}

export function AdminPayments() {
  const { t } = useLanguage(); const { data, isLoading } = trpc.admin.payments.useQuery();
  return <div><WorkspacePageHeader eyebrow={t("dashboard.payments")} title="Payments" body={t("admin.paymentsBody")} action={<button className="button button--orange"><CircleDollarSign size={16} /> Record payment</button>} />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Loan</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data?.length ? data.map((payment: any) => <tr key={payment.id}><td>{date(payment.paidAt)}</td><td>#{payment.loanId}</td><td>{payment.method}</td><td>{payment.reference || "—"}</td><td>{money(payment.amount)}</td><td><StatusBadge status={payment.status} /></td></tr>) : <tr><td colSpan={6}><EmptyState /></td></tr>}</tbody></table></div></section>}</div>;
}

export function AdminCollateral() {
  const { t } = useLanguage(); const { data, isLoading } = trpc.admin.collateral.useQuery();
  return <div><WorkspacePageHeader eyebrow={t("dashboard.collateral")} title="Collateral" body={t("admin.collateralBody")} />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Type</th><th>Application</th><th>Reference</th><th>Estimated value</th><th>Added</th><th>Status</th></tr></thead><tbody>{data?.length ? data.map((item: any) => <tr key={item.id}><td><div className="table-person"><span className="data-icon"><HandCoins size={15} /></span><strong>{item.type}</strong></div></td><td>#{item.applicationId}</td><td>{item.referenceNumber || "—"}</td><td>{money(item.estimatedValue)}</td><td>{date(item.createdAt)}</td><td><StatusBadge status={item.status} /></td></tr>) : <tr><td colSpan={6}><EmptyState /></td></tr>}</tbody></table></div></section>}</div>;
}

export function AdminDocuments() {
  const { t } = useLanguage(); const { data, isLoading } = trpc.admin.documents.useQuery();
  return <div><WorkspacePageHeader eyebrow={t("dashboard.documents")} title="Documents" body={t("admin.documentsBody")} />{isLoading ? <AdminLoading /> : <section className="workspace-panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Document</th><th>Customer</th><th>Type</th><th>Uploaded</th><th>Status</th><th /></tr></thead><tbody>{data?.length ? data.map((item: any) => <tr key={item.id}><td><div className="table-person"><span className="data-icon"><FileText size={15} /></span><strong>{item.fileName}</strong></div></td><td>#{item.userId}</td><td>{item.documentType}</td><td>{date(item.createdAt)}</td><td><StatusBadge status={item.verificationStatus} /></td><td><a className="table-view-link" href={item.url} target="_blank" rel="noreferrer">Open <FileCheck2 size={14} /></a></td></tr>) : <tr><td colSpan={6}><EmptyState /></td></tr>}</tbody></table></div></section>}</div>;
}

function ApplicationTable({ rows, onAction, compact = false }: { rows: any[]; onAction?: (id: number, status: "under_review" | "approved" | "rejected" | "documents_required") => void; compact?: boolean }) {
  const { t } = useLanguage();
  if (!rows.length) return <EmptyState title="No loan requests" body="New applications will appear here when customers submit them." />;
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Application</th><th>Customer</th><th>Type</th><th>Amount</th><th>Submitted</th><th>Status</th>{!compact && <th>Decision</th>}</tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.applicationNumber}</strong></td><td>{item.fullName}</td><td>{t(`loan.${item.loanType}`)}</td><td>{money(item.requiredAmount)}</td><td>{date(item.createdAt)}</td><td><StatusBadge status={item.status} /></td>{!compact && <td><div className="row-actions"><button className="icon-button icon-button--success" onClick={() => onAction?.(item.id, "approved")} aria-label="Approve"><Check size={15} /></button><button className="icon-button icon-button--danger" onClick={() => onAction?.(item.id, "rejected")} aria-label="Reject"><X size={15} /></button></div></td>}</tr>)}</tbody></table></div>;
}
function AdminLoading() { return <div className="loading-block loading-block--large"><span /><span /><span /><span /></div>; }
