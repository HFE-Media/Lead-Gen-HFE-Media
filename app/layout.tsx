import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "HFE Media Lead Engine",
  description: "Premium SaaS dashboard for no-website lead generation with Google Places and Supabase."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get("x-pathname") ?? "/";

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppShell currentPath={pathname}>{children}</AppShell>
      </body>
    </html>
  );
}
