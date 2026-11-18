import { inr } from "@/lib/sales";
import { fmtDay } from "@/lib/dates";

type Point = { day: string; booked: number; collected: number };

/** Daily sales as an SVG bar chart: wide bar = orders placed, gold bar = verified payments. */
export default function SalesChart({ data }: { data: Point[] }) {
  const W = 720, H = 250, L = 56, T = 12, B = 30;
  const max = Math.max(1, ...data.map((d) => d.booked));
  const slot = (W - L) / data.length;
  const bw = Math.max(1, slot * 0.72);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const labelAt = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])];
  const total = data.reduce((s, d) => s + d.collected, 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily sales chart" className="h-auto w-full">
      <desc>{`Orders placed and verified payments for each day. Verified payments in this period: ${inr(total)}.`}</desc>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={L} x2={W} y1={y(max * t)} y2={y(max * t)} className="stroke-latte" />
          <text x={L - 8} y={y(max * t) + 4} textAnchor="end" className="fill-roast text-[11px]">
            {inr(Math.round(max * t))}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = L + i * slot + (slot - bw) / 2;
        return (
          <g key={d.day}>
            <title>{`${fmtDay(d.day)}: orders ${inr(d.booked)}, verified payments ${inr(d.collected)}`}</title>
            <rect x={x} y={y(d.booked)} width={bw} height={H - B - y(d.booked)} className="fill-latte" />
            <rect x={x + bw * 0.2} y={y(d.collected)} width={bw * 0.6} height={H - B - y(d.collected)} className="fill-gold" />
          </g>
        );
      })}
      {labelAt.map((i) => (
        <text key={i} x={L + i * slot + slot / 2} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-roast text-[11px]">
          {fmtDay(data[i].day)}
        </text>
      ))}
    </svg>
  );
}
