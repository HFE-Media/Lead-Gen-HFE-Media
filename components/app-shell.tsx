"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Menu, PhoneCall, PlayCircle, Search, Settings, Users, X } from "lucide-react";
import { LogoBadge } from "@/components/logo-badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search-terms", label: "Search Terms", icon: Search },
  { href: "/run-search", label: "Run Search", icon: PlayCircle },
  { href: "/leads", label: "Leads CRM", icon: Users },
  { href: "/call-tracker", label: "Call Tracker", icon: PhoneCall },
  { href: "/already-searched", label: "Already Searched", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children
}: {
  children: ReactNode;
}) {
  const currentPath = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1520px] items-start gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6">
      <aside className="panel sticky top-6 hidden w-64 shrink-0 self-start p-5 lg:block">
        <div className="space-y-6">
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
        <div className="mt-6 rounded-3xl border border-gold/20 bg-gold/10 p-4">
          <p className="font-display text-lg text-white">Premium lead capture</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            South Africa focused Google Places filtering for businesses with no website footprint.
          </p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-4 sm:space-y-6">
        <div className="sticky top-3 z-30 space-y-3 lg:hidden">
          <div className="panel flex items-center justify-between p-3">
            <LogoBadge compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-white transition hover:border-gold"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {mobileMenuOpen ? (
            <div className="panel p-3">
              <nav className="space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = currentPath === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
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
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
