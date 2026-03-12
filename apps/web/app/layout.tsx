import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteShellData } from "@/lib/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Scaffold",
  description: "Strapi driven website scaffold",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preview = (await draftMode()).isEnabled;
  const shell = await getSiteShellData(preview);

  return (
    <html lang="en" style={shell.themeVariables as React.CSSProperties}>
      <body>
        <SiteHeader links={shell.headerLinks} />
        <main>{children}</main>
        <SiteFooter
          links={shell.headerLinks}
          title={shell.siteConfig.seoDefaultTitle || "Generic Business"}
          description={
            shell.siteConfig.seoDefaultDescription ||
            "A modern, service-oriented business focused on quality, trust, and customer success."
          }
        />
      </body>
    </html>
  );
}
