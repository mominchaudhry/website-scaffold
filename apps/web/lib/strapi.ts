import type { Page, SiteConfig, Theme } from "@scaffold/contracts";
import { fallbackTheme } from "@scaffold/contracts";
import qs from "qs";
import { env } from "./env";

type FetchOptions = {
  tags: string[];
  preview?: boolean;
};

type StrapiEnvelope<T> = {
  data: T;
  error?: {
    status: number;
    name: string;
    message: string;
  };
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

type MaybeAttributes<T extends Record<string, unknown>> = T & {
  id?: number;
  attributes?: T;
};

const pageSectionsPopulate = {
  sections: {
    on: {
      "sections.hero": {
        populate: {
          primaryAction: "*",
          secondaryAction: "*",
        },
      },
      "sections.feature-grid": {
        populate: {
          items: "*",
        },
      },
      "sections.rich-text": {
        populate: "*",
      },
      "sections.cta": {
        populate: {
          action: "*",
        },
      },
      "sections.faq": {
        populate: {
          items: "*",
        },
      },
      "sections.gallery": {
        populate: {
          images: "*",
        },
      },
    },
  },
};

function unwrapEntry<T extends Record<string, unknown>>(entry: MaybeAttributes<T> | null | undefined): T | null {
  if (!entry) {
    return null;
  }

  if (entry.attributes && typeof entry.attributes === "object") {
    return {
      ...entry.attributes,
      id: entry.id,
    } as T;
  }

  return entry as T;
}

function unwrapMany<T extends Record<string, unknown>>(entries: MaybeAttributes<T>[] | null | undefined): T[] {
  if (!entries || entries.length === 0) {
    return [];
  }

  return entries
    .map((entry) => unwrapEntry(entry))
    .filter((entry): entry is T => Boolean(entry));
}

function unwrapRelation(
  relation: unknown
): Record<string, unknown> | Record<string, unknown>[] | null {
  if (!relation || typeof relation !== "object") {
    return null;
  }

  const relationRecord = relation as Record<string, unknown>;

  if ("data" in relationRecord) {
    const data = relationRecord.data;
    if (Array.isArray(data)) {
      return unwrapMany(data as MaybeAttributes<Record<string, unknown>>[]);
    }
    return unwrapEntry(data as MaybeAttributes<Record<string, unknown>>);
  }

  return unwrapEntry(relationRecord as MaybeAttributes<Record<string, unknown>>);
}

function toAbsoluteMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${env.strapiApiUrl}${url}`;
  }
  return `${env.strapiApiUrl}/${url}`;
}

function normalizeActionLink(action: unknown): Record<string, unknown> | null {
  if (!action || typeof action !== "object") {
    return null;
  }

  const entry = unwrapEntry(action as MaybeAttributes<Record<string, unknown>>);
  if (!entry) {
    return null;
  }

  const label = typeof entry.label === "string" ? entry.label.trim() : "";
  const href = typeof entry.href === "string" ? entry.href.trim() : "";
  if (!label || !href) {
    return null;
  }

  return {
    label,
    href,
    target: entry.target === "_blank" ? "_blank" : "_self",
  };
}

function normalizeSection(rawSection: unknown): Record<string, unknown> | null {
  const base =
    rawSection && typeof rawSection === "object" && "attributes" in rawSection
      ? unwrapEntry(rawSection as MaybeAttributes<Record<string, unknown>>)
      : (rawSection as Record<string, unknown> | null);

  if (!base) {
    return null;
  }

  const section: Record<string, unknown> = {
    ...base,
    id: Number(base.id ?? 0),
  };

  if (section["__component"] === "sections.hero") {
    const primaryAction =
      normalizeActionLink(section["primaryAction"]) || normalizeActionLink(section["action"]);
    const secondaryAction = normalizeActionLink(section["secondaryAction"]);
    section["primaryAction"] = primaryAction;
    section["secondaryAction"] = secondaryAction;
  }

  if (section["__component"] === "sections.cta") {
    section["action"] = normalizeActionLink(section["action"]);
  }

  if (section["__component"] === "sections.feature-grid") {
    const parsedColumns = Number(section["columns"] ?? 3);
    section["columns"] = parsedColumns === 2 || parsedColumns === 4 ? parsedColumns : 3;

    const rawItems = Array.isArray(section["items"]) ? section["items"] : [];
    section["items"] = rawItems
      .map((entry: unknown) => {
        if (entry && typeof entry === "object" && "attributes" in entry) {
          return unwrapEntry(entry as MaybeAttributes<Record<string, unknown>>);
        }
        return entry as Record<string, unknown>;
      })
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .map((entry) => ({
        title: typeof entry.title === "string" ? entry.title : "",
        description: typeof entry.description === "string" ? entry.description : null,
        icon: typeof entry.icon === "string" ? entry.icon : null,
      }))
      .filter((entry) => Boolean(entry.title));
  }

  if (section["__component"] === "sections.faq") {
    const rawItems = Array.isArray(section["items"]) ? section["items"] : [];
    section["items"] = rawItems
      .map((entry: unknown) => {
        if (entry && typeof entry === "object" && "attributes" in entry) {
          return unwrapEntry(entry as MaybeAttributes<Record<string, unknown>>);
        }
        return entry as Record<string, unknown>;
      })
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .map((entry) => ({
        question: typeof entry.question === "string" ? entry.question : "",
        answer: typeof entry.answer === "string" ? entry.answer : "",
      }))
      .filter((entry) => Boolean(entry.question) && Boolean(entry.answer));
  }

  if (section["__component"] === "sections.gallery") {
    const rawImages = unwrapRelation(section["images"]);
    const images = Array.isArray(rawImages) ? rawImages : Array.isArray(section["images"]) ? (section["images"] as unknown[]) : [];
    section["images"] = images
      .map((entry: unknown) => unwrapEntry(entry as MaybeAttributes<Record<string, unknown>>))
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .map((entry) => ({
        ...entry,
        id: Number(entry.id ?? 0),
        url: typeof entry.url === "string" ? toAbsoluteMediaUrl(entry.url) : "",
      }));
  }

  return section;
}

function normalizePage(raw: Record<string, unknown>): Page {
  const sections = Array.isArray(raw.sections)
    ? raw.sections.map(normalizeSection).filter((section): section is Record<string, unknown> => Boolean(section))
    : [];

  return {
    id: Number(raw.id),
    title: String(raw.title ?? "Untitled"),
    slug: String(raw.slug ?? ""),
    showInHeader: Boolean(raw.showInHeader),
    headerLabel: (raw.headerLabel as string | null | undefined) ?? null,
    isHome: Boolean(raw.isHome),
    sections: sections.filter(Boolean) as unknown as Page["sections"],
    publishedAt: (raw.publishedAt as string | null | undefined) ?? null,
    seoTitle: (raw.seoTitle as string | null | undefined) ?? null,
    seoDescription: (raw.seoDescription as string | null | undefined) ?? null,
  };
}

function mergeTheme(raw: Record<string, unknown> | null): Theme {
  if (!raw) {
    return fallbackTheme;
  }

  return {
    ...fallbackTheme,
    ...raw,
    id: Number(raw.id ?? fallbackTheme.id),
    name: String(raw.name ?? fallbackTheme.name),
    slug: String(raw.slug ?? fallbackTheme.slug),
    colors: {
      ...fallbackTheme.colors,
      ...(raw.colors as Record<string, string> | undefined),
    },
    typography: {
      ...fallbackTheme.typography,
      ...(raw.typography as Record<string, string | number> | undefined),
    },
    spacing: {
      ...fallbackTheme.spacing,
      ...(raw.spacing as Record<string, string> | undefined),
    },
    radius: {
      ...fallbackTheme.radius,
      ...(raw.radius as Record<string, string> | undefined),
    },
    shadow: {
      ...fallbackTheme.shadow,
      ...(raw.shadow as Record<string, string> | undefined),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function hasThemeTokenPayload(raw: Record<string, unknown> | null): boolean {
  if (!raw) {
    return false;
  }

  return (
    isRecord(raw.colors) &&
    isRecord(raw.typography) &&
    isRecord(raw.spacing) &&
    isRecord(raw.radius) &&
    isRecord(raw.shadow)
  );
}

function pickThemeEntry(entries: Record<string, unknown>[]): Record<string, unknown> | null {
  if (entries.length === 0) {
    return null;
  }

  const withTokenPayload = entries.find((entry) => hasThemeTokenPayload(entry));
  if (withTokenPayload) {
    return withTokenPayload;
  }

  return entries[0];
}

async function getLatestTheme(preview = false): Promise<Theme | null> {
  const query = qs.stringify(
    {
      sort: ["updatedAt:desc", "createdAt:desc", "id:desc"],
      populate: "*",
      status: preview ? "draft" : "published",
      pagination: {
        pageSize: 25,
      },
    },
    { encodeValuesOnly: true }
  );

  const raw = await strapiFetch<Array<Record<string, unknown> | MaybeAttributes<Record<string, unknown>>>>(
    `themes?${query}`,
    {
      tags: ["themes"],
      preview,
    }
  );

  const entries = unwrapMany(raw as MaybeAttributes<Record<string, unknown>>[]);
  const candidate = pickThemeEntry(entries);
  return candidate ? mergeTheme(candidate) : null;
}

async function strapiFetch<T>(path: string, options: FetchOptions): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = options.preview ? env.strapiPreviewToken || env.strapiPublicToken : env.strapiPublicToken;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${env.strapiApiUrl}/api/${path}`, {
    method: "GET",
    headers,
    next: {
      tags: unique(["cms", ...options.tags]),
    },
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed (${response.status}) for ${path}`);
  }

  const payload = (await response.json()) as StrapiEnvelope<T>;

  if (payload.error) {
    throw new Error(`Strapi error: ${payload.error.message}`);
  }

  return payload.data;
}

export async function getSiteConfig(preview = false): Promise<SiteConfig> {
  const query = qs.stringify(
    {
      populate: "*",
      status: preview ? "draft" : "published",
    },
    { encodeValuesOnly: true }
  );

  const raw = await strapiFetch<Record<string, unknown> | MaybeAttributes<Record<string, unknown>>>(
    `site-config?${query}`,
    {
      tags: ["site-config"],
      preview,
    }
  );

  const site = unwrapEntry(raw as MaybeAttributes<Record<string, unknown>>);

  if (!site) {
    const latestTheme = await getLatestTheme(preview).catch(() => null);

    return {
      id: 0,
      siteMode: "MULTI_PAGE",
      defaultTheme: latestTheme || fallbackTheme,
      seoDefaultTitle: null,
      seoDefaultDescription: null,
      homepage: null,
    };
  }

  const themeEntry = unwrapRelation(site.defaultTheme) as Record<string, unknown> | null;
  const homepageEntry = unwrapRelation(site.homepage) as Record<string, unknown> | null;
  const fallbackThemeFromThemes = !hasThemeTokenPayload(themeEntry)
    ? await getLatestTheme(preview).catch(() => null)
    : null;

  return {
    id: Number(site.id ?? 0),
    siteMode: (site.siteMode as SiteConfig["siteMode"]) || "MULTI_PAGE",
    seoDefaultTitle: (site.seoDefaultTitle as string | null | undefined) ?? null,
    seoDefaultDescription: (site.seoDefaultDescription as string | null | undefined) ?? null,
    defaultTheme: fallbackThemeFromThemes || mergeTheme(themeEntry),
    homepage: homepageEntry
      ? {
          id: Number(homepageEntry.id),
          title: String(homepageEntry.title),
          slug: String(homepageEntry.slug),
        }
      : null,
    publishedAt: (site.publishedAt as string | null | undefined) ?? null,
  };
}

export async function getPages(preview = false): Promise<Page[]> {
  const query = qs.stringify(
    {
      sort: ["id:asc"],
      populate: pageSectionsPopulate,
      status: preview ? "draft" : "published",
    },
    { encodeValuesOnly: true }
  );

  const raw = await strapiFetch<Array<Record<string, unknown> | MaybeAttributes<Record<string, unknown>>>>(
    `pages?${query}`,
    {
      tags: ["pages"],
      preview,
    }
  );

  return unwrapMany(raw as MaybeAttributes<Record<string, unknown>>[]).map(normalizePage);
}

export async function getPageBySlug(slug: string, preview = false): Promise<Page | null> {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: pageSectionsPopulate,
      status: preview ? "draft" : "published",
      pagination: {
        pageSize: 1,
      },
    },
    { encodeValuesOnly: true }
  );

  const raw = await strapiFetch<Array<Record<string, unknown> | MaybeAttributes<Record<string, unknown>>>>(
    `pages?${query}`,
    {
      tags: ["pages", `page:${slug}`],
      preview,
    }
  );

  const first = unwrapMany(raw as MaybeAttributes<Record<string, unknown>>[])[0];
  return first ? normalizePage(first) : null;
}

export function resolveHomePage(options: {
  pages: Page[];
  siteConfig: SiteConfig;
}): Page | null {
  const { pages, siteConfig } = options;

  if (siteConfig.homepage?.slug) {
    const homepage = pages.find((page) => page.slug === siteConfig.homepage?.slug);
    if (homepage) {
      return homepage;
    }
  }

  const explicitHome = pages.find((page) => page.isHome);
  if (explicitHome) {
    return explicitHome;
  }

  const slugHome = pages.find((page) => page.slug === "home");
  if (slugHome) {
    return slugHome;
  }

  return pages[0] ?? null;
}
