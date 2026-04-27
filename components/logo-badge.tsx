import Image from "next/image";
import logoImage from "@/logo.png";

export function LogoBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-2 text-center">
      <div
        className={
          compact ? "relative mx-auto h-16 w-36 overflow-hidden" : "relative mx-auto h-28 w-48 overflow-hidden"
        }
      >
        <Image
          src={logoImage}
          alt="HFE Media"
          fill
          className="object-contain object-top"
          priority
        />
      </div>
      <div className={compact ? "hidden" : "mx-auto w-full rounded-2xl border border-gold/15 bg-gold/5 px-3 py-2"}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-lightGold">Lead Intelligence Suite</p>
      </div>
    </div>
  );
}
