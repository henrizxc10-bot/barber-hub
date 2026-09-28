import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="container-page pt-14 pb-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
      <div className="gold-rule mt-4" />
      {description && <p className="mt-5 max-w-2xl text-muted-foreground">{description}</p>}
    </div>
  );
}
