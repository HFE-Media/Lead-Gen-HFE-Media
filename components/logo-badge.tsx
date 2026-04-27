import Image from "next/image";
import logoImage from "@/logo.png";

export function LogoBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3 text-center">
      <div
        className={
          compact
            ? "relative mx-auto h-12 w-28 overflow-hidden"
            : "relative mx-auto h-20 w-32 overflow-hidden"
        }
      >
        <Image
          src={logoImage}
          alt="HFE Media"
          fill
          className="brand-logo object-contain object-center"
          priority
        />
      </div>
      <div
        className={
          compact ? "hidden" : "mx-auto w-full rounded-2xl border border-gold/10 bg-gold/5 px-3 py-2"
        }
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-lightGold">Lead Intelligence Suite</p>
      </div>
    </div>
  );
}
