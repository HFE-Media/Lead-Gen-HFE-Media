import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, ListChecks, PlayCircle, Search, Settings, Users } from "lucide-react";
import { LogoBadge } from "@/components/logo-badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search-terms", label: "Search Terms", icon: Search },
  { href: "/run-search", label: "Run Search", icon: PlayCircle },
  { href: "/leads", label: "Leads CRM", icon: Users },
  { href: "/already-searched", label: "Already Searched", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  currentPath
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-6 md:px-6">
      <aside className="panel hidden w-72 shrink-0 flex-col justify-between p-5 lg:flex">
        <div className="space-y-8">
          <LogoBadge />
          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = currentPath === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-gold/30 bg-gold/10 text-white"
                      : "border-transparent text-muted hover:border-border hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-lightGold" : "text-gold")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-3xl border border-gold/20 bg-gold/10 p-4">
          <p className="font-display text-lg text-white">Premium lead capture</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            South Africa focused Google Places filtering for businesses with no website footprint.
          </p>
        </div>
      </aside>
      <main className="flex-1 space-y-6">
        <div className="panel flex items-center justify-between p-4 lg:hidden">
          <LogoBadge compact />
        </div>
        <div className="panel overflow-x-auto p-2 lg:hidden">
          <div className="flex min-w-max gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = currentPath === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-gold/30 bg-gold/10 text-white"
                      : "border-transparent text-muted hover:border-border hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-lightGold" : "text-gold")} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
