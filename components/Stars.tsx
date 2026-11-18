import { Star } from "lucide-react";

export default function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={`${className} ${n <= value ? "fill-gold text-gold" : "text-latte"}`} />
      ))}
    </div>
  );
}
