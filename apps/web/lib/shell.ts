import { buildHeaderLinks, fallbackTheme, themeToCssVariables } from "@scaffold/contracts";
import type { HeaderLink, Page, SiteConfig } from "@scaffold/contracts";
import { getPages, getSiteConfig, resolveHomePage } from "./strapi";
import { slugify } from "./slug";

export interface SiteShellData {
  siteConfig: SiteConfig;
  pages: Page[];
  homePage: Page | null;
  headerLinks: HeaderLink[];
  themeVariables: Record<string, string>;
}

export async function getSiteShellData(preview = false): Promise<SiteShellData> {
  const fallbackSiteConfig: SiteConfig = {
    id: 0,
    siteMode: "MULTI_PAGE",
    defaultTheme: fallbackTheme,
    seoDefaultTitle: null,
    seoDefaultDescription: null,
    homepage: null,
    publishedAt: null,
  };

  const [siteConfig, pages] = await Promise.all([
    getSiteConfig(preview).catch(() => fallbackSiteConfig),
    getPages(preview).catch(() => []),
  ]);
  const homePage = resolveHomePage({ pages, siteConfig });

  return {
    siteConfig,
    pages,
    homePage,
    headerLinks: buildHeaderLinks({
      siteMode: siteConfig.siteMode,
      pages,
      homePage,
      toAnchor: slugify,
    }),
    themeVariables: themeToCssVariables(siteConfig.defaultTheme || fallbackTheme),
  };
}
