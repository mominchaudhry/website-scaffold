import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteShellData } from "@/lib/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Business",
  description: "Welcome to our website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preview = (await draftMode()).isEnabled;
  const shell = await getSiteShellData(preview);
  const { siteConfig } = shell;

  return (
    <html lang="en" style={shell.themeVariables as React.CSSProperties}>
      <head>
        <title>{siteConfig.seoDefaultTitle || siteConfig.siteName}</title>
        <meta
          name="description"
          content={siteConfig.seoDefaultDescription || `Welcome to ${siteConfig.siteName}`}
        />
      </head>
      <body>
        <SiteHeader links={shell.headerLinks} siteName={siteConfig.siteName} />
        <main>{children}</main>
        <SiteFooter
          links={shell.headerLinks}
          siteName={siteConfig.siteName}
          tagline={siteConfig.footerTagline || siteConfig.seoDefaultDescription || null}
          contactEmail={siteConfig.contactEmail || null}
          contactPhone={siteConfig.contactPhone || null}
        />
      </body>
    </html>
  );
}
