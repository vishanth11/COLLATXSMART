import { ArrowUpRight } from "lucide-react";

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark--compact" : ""}`}>
      <span className="brand-mark__symbol"><ArrowUpRight size={17} strokeWidth={2.4} /></span>
      <span className="brand-mark__wordmark">CollatX<span>Smart</span></span>
    </div>
  );
}
