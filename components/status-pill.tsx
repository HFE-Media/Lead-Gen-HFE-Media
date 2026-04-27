import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: "pending" | "searched" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]",
        status === "searched"
          ? "border-gold/30 bg-gold/10 text-lightGold"
          : "border-border bg-white/5 text-muted"
      )}
    >
      {status}
    </span>
  );
}
