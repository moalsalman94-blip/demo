import { BRAND } from "@/lib/brand";

export function Logo({ sub }: { sub?: string }) {
  return (
    <span className="logo">
      <span className="logo-mark">{BRAND.mark}</span>
      <span>
        {BRAND.name}
        {sub && <span style={{ display: "block", fontSize: 11.5, fontWeight: 500, opacity: 0.6 }}>{sub}</span>}
      </span>
    </span>
  );
}
