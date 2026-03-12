import type { HeaderLink, Page, SiteMode } from "./site";

export function buildHeaderLinks(options: {
  siteMode: SiteMode;
  pages: Page[];
  homePage: Page | null;
  toAnchor: (raw: string) => string;
}): HeaderLink[] {
  const { siteMode, pages, homePage, toAnchor } = options;

  if (siteMode === "MULTI_PAGE") {
    return pages
      .filter((page) => page.showInHeader)
      .map((page) => ({
        label: page.headerLabel?.trim() || page.title,
        href: page.isHome ? "/" : `/${page.slug}`,
      }));
  }

  if (!homePage) {
    return [];
  }

  const links = homePage.sections
    .filter((section) => section.showInHeader)
    .map((section, index) => {
      const fallback = `${section.__component}-${index + 1}`;
      const anchorSource = section.anchorId || section.navLabel || fallback;
      return {
        label: section.navLabel?.trim() || `Section ${index + 1}`,
        href: `#${toAnchor(anchorSource)}`,
      };
    });

  const homeLink = {
    label: homePage.headerLabel?.trim() || homePage.title || "Home",
    href: "#home",
  };

  const allLinks = [homeLink, ...links];
  const deduped = allLinks.filter((link, index) => allLinks.findIndex((item) => item.href === link.href) === index);

  return deduped;
}
