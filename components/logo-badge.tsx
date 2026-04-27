import Image from "next/image";
import logoImage from "@/logo.png";

export function LogoBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3 text-center">
      <div
        className={
          compact
            ? "brand-shell relative mx-auto h-16 w-36 overflow-hidden rounded-[28px] border border-gold/10 px-3 py-2"
            : "brand-shell relative mx-auto h-28 w-48 overflow-hidden rounded-[32px] border border-gold/10 px-4 py-3"
        }
      >
        <Image
          src={logoImage}
          alt="HFE Media"
          fill
          className="brand-logo object-contain object-center"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
      </div>
      <div
        className={
          compact ? "hidden" : "mx-auto w-full rounded-2xl border border-gold/10 bg-gold/5 px-3 py-2.5 backdrop-blur-sm"
        }
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-lightGold">Lead Intelligence Suite</p>
      </div>
    </div>
  );
}
