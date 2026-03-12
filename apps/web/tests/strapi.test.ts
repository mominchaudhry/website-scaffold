import { afterEach, describe, expect, it, vi } from "vitest";
import { getPages, getSiteConfig } from "../lib/strapi";

function okResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data }),
  } as Response;
}

describe("getSiteConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to latest populated theme when site config has no defaultTheme relation", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        okResponse({
          id: 1,
          siteMode: "SPA",
          seoDefaultTitle: "Momin Enterprises",
          seoDefaultDescription: "Classified mission.",
        })
      )
      .mockResolvedValueOnce(
        okResponse([
          {
            id: 11,
            name: "Incomplete Theme",
            slug: "incomplete",
            colors: null,
            typography: null,
            spacing: null,
            radius: null,
            shadow: null,
          },
          {
            id: 12,
            name: "Active Theme",
            slug: "active-theme",
            colors: {
              background: "#0b1220",
              surface: "#101a2d",
              text: "#eef2ff",
              mutedText: "#c5d2e6",
              primary: "#2f9e69",
              secondary: "#f2c94c",
              border: "#2a3d59",
            },
            typography: {
              fontFamilyBase: "'Source Sans 3', sans-serif",
              fontFamilyHeading: "'Space Grotesk', sans-serif",
              baseSize: "16px",
              headingWeight: 700,
              bodyWeight: 400,
            },
            spacing: {
              sectionY: "4rem",
              containerX: "1.25rem",
              gap: "1.5rem",
            },
            radius: {
              small: "0.375rem",
              medium: "0.75rem",
              large: "1.25rem",
            },
            shadow: {
              card: "0 8px 24px rgba(0, 0, 0, 0.2)",
              elevated: "0 16px 40px rgba(0, 0, 0, 0.32)",
            },
          },
        ])
      );

    const siteConfig = await getSiteConfig(false);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(siteConfig.defaultTheme?.name).toBe("Active Theme");
    expect(siteConfig.defaultTheme?.colors.primary).toBe("#2f9e69");
  });
});

describe("getPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests nested section payloads and maps CTA links/items", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      okResponse([
        {
          id: 2,
          title: "Home",
          slug: "home",
          showInHeader: true,
          headerLabel: "Home",
          isHome: true,
          seoTitle: "Momin Enterprises",
          seoDescription: "Classified mission.",
          sections: [
            {
              id: 10,
              __component: "sections.hero",
              heading: "Momin Enterprises",
              primaryAction: {
                id: 1,
                label: "See Admission",
                href: "#admission",
                target: "_self",
              },
              secondaryAction: {
                id: 2,
                label: "Contact Us",
                href: "#contact",
                target: "_self",
              },
            },
            {
              id: 11,
              __component: "sections.cta",
              heading: "Admission",
              action: {
                id: 3,
                label: "Request Admission Details",
                href: "mailto:admission@mominenterprises.example",
                target: "_self",
              },
            },
            {
              id: 12,
              __component: "sections.feature-grid",
              heading: "Team",
              columns: "3",
              items: [
                {
                  id: 4,
                  title: "Operations Lead",
                  description: "Coordinates mission logistics.",
                },
              ],
            },
          ],
        },
      ])
    );

    const pages = await getPages(false);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = decodeURIComponent(String(fetchMock.mock.calls[0]?.[0] ?? ""));
    expect(requestUrl).toContain("populate[sections][on][sections.hero][populate][primaryAction]=*");
    expect(requestUrl).toContain("populate[sections][on][sections.cta][populate][action]=*");
    expect(requestUrl).toContain("populate[sections][on][sections.feature-grid][populate][items]=*");

    expect(pages).toHaveLength(1);
    expect(pages[0]?.sections[0]).toMatchObject({
      __component: "sections.hero",
      primaryAction: {
        label: "See Admission",
        href: "#admission",
      },
      secondaryAction: {
        label: "Contact Us",
        href: "#contact",
      },
    });
    expect(pages[0]?.sections[1]).toMatchObject({
      __component: "sections.cta",
      action: {
        label: "Request Admission Details",
      },
    });
    expect(pages[0]?.sections[2]).toMatchObject({
      __component: "sections.feature-grid",
      items: [{ title: "Operations Lead" }],
    });
  });
});
