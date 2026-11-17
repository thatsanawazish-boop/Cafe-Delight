import type { ReactNode } from "react";

/** One row of a printed-menu style list: label ........ value */
export default function Leader({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span>{label}</span>
      <span aria-hidden className="min-w-6 flex-1 -translate-y-1 border-b-2 border-dotted border-current opacity-30" />
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
