import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search-terms", label: "Queue" },
  { href: "/search-terms/generator", label: "Generator" }
];

export function SearchTermsNav({ currentPath }: { currentPath: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const active = currentPath === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center rounded-2xl border px-4 py-2 text-sm transition",
              active
                ? "border-gold/30 bg-gold/10 text-white"
                : "border-border bg-card text-muted hover:border-gold hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
