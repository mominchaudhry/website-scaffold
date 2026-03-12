import { buildHeaderLinks } from "@scaffold/contracts";
import { describe, expect, it } from "vitest";
import { slugify } from "../lib/slug";

describe("buildHeaderLinks", () => {
  it("builds page links for multi page mode", () => {
    const links = buildHeaderLinks({
      siteMode: "MULTI_PAGE",
      toAnchor: slugify,
      homePage: null,
      pages: [
        {
          id: 1,
          title: "Home",
          slug: "home",
          showInHeader: true,
          isHome: true,
          sections: [],
          publishedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Pricing",
          slug: "pricing",
          showInHeader: true,
          isHome: false,
          sections: [],
          publishedAt: new Date().toISOString(),
        },
      ],
    });

    expect(links).toEqual([
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
    ]);
  });

  it("builds section links for SPA mode", () => {
    const links = buildHeaderLinks({
      siteMode: "SPA",
      toAnchor: slugify,
      pages: [],
      homePage: {
        id: 1,
        title: "Home",
        slug: "home",
        showInHeader: true,
        isHome: true,
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 1,
            __component: "sections.hero",
            heading: "Hero",
            showInHeader: true,
            navLabel: "Intro",
          },
        ],
      },
    });

    expect(links).toEqual([
      { label: "Home", href: "#home" },
      { label: "Intro", href: "#intro" },
    ]);
  });
});
