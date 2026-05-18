const PAGE_UID = "api::page.page";
const THEME_UID = "api::theme.theme";
const SITE_CONFIG_UID = "api::site-config.site-config";
const DEFAULT_THEME_SLUG = "starter-theme";
const DEFAULT_HOME_SLUG = "home";
const DEFAULT_SITE_TITLE = "My Organization";

function nowIso() {
  return new Date().toISOString();
}

function relationRef(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry;
  if (typeof record.documentId === "string" && record.documentId.length > 0) {
    return record.documentId;
  }

  if (typeof record.id === "number") {
    return record.id;
  }

  return null;
}

function themeData() {
  return {
    name: DEFAULT_SITE_TITLE,
    slug: DEFAULT_THEME_SLUG,
    colors: {
      background: "#f6f8f3",
      surface: "#ffffff",
      text: "#123126",
      mutedText: "#4a6158",
      primary: "#1f6a53",
      secondary: "#d8a245",
      border: "#d7dfd5",
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
      card: "0 10px 24px rgba(17, 42, 70, 0.10)",
      elevated: "0 18px 44px rgba(17, 42, 70, 0.16)",
    },
  };
}

function pageData() {
  return {
    title: "Home",
    slug: DEFAULT_HOME_SLUG,
    isHome: true,
    showInHeader: true,
    headerLabel: "Home",
    seoTitle: DEFAULT_SITE_TITLE,
    seoDescription: "A trusted, mission-driven organization quietly building practical solutions that improve lives worldwide.",
    sections: [
      {
        __component: "sections.hero",
        eyebrow: "Top Secret Organization",
        heading: "My Organization",
        body: "We build practical systems that help communities thrive.",
        primaryAction: {
          label: "See Admission",
          href: "#admission",
          target: "_self",
        },
        secondaryAction: {
          label: "Contact Us",
          href: "#contact",
          target: "_self",
        },
        showInHeader: false,
        alignment: "left",
        maxWidth: "lg",
        spacing: "normal",
      },
      {
        __component: "sections.rich-text",
        heading: "Who We Are",
        content:
          "<p>We are a mission-first organization committed to long-term impact. We partner with communities, institutions, and local teams to build resilient programs that create measurable positive change.</p>",
        showInHeader: true,
        navLabel: "About",
        anchorId: "about",
        alignment: "left",
        maxWidth: "md",
        spacing: "normal",
      },
      {
        __component: "sections.rich-text",
        heading: "Videos",
        content:
          "<p>Explore short briefings and field stories from our initiatives.</p><p><a href='https://www.youtube.com/watch?v=aqz-KE-bpKQ' target='_blank' rel='noreferrer'>Mission Briefing</a></p><p><a href='https://www.youtube.com/watch?v=ysz5S6PUM-U' target='_blank' rel='noreferrer'>Community Impact Highlights</a></p>",
        showInHeader: true,
        navLabel: "Videos",
        anchorId: "videos",
        alignment: "left",
        maxWidth: "md",
        spacing: "normal",
      },
      {
        __component: "sections.cta",
        heading: "Admission",
        body: "Applications for partnership and membership are open. Learn eligibility, timelines, and onboarding requirements.",
        action: {
          label: "Request Admission Details",
          href: "mailto:admission@example.com",
          target: "_self",
        },
        showInHeader: true,
        navLabel: "Admission",
        anchorId: "admission",
        alignment: "left",
        maxWidth: "md",
        spacing: "normal",
      },
      {
        __component: "sections.feature-grid",
        heading: "Team",
        body: "A focused cross-functional team aligned around real-world outcomes.",
        columns: "3",
        items: [
          {
            title: "Operations Lead",
            description: "Coordinates mission logistics and cross-region execution.",
          },
          {
            title: "Research Director",
            description: "Guides evidence-based strategy and impact evaluation.",
          },
          {
            title: "Community Liaison",
            description: "Builds trusted local partnerships and feedback loops.",
          },
        ],
        showInHeader: true,
        navLabel: "Team",
        anchorId: "team",
        alignment: "left",
        maxWidth: "lg",
        spacing: "normal",
      },
      {
        __component: "sections.cta",
        heading: "Contact",
        body: "Reach our coordination desk for partnerships, media requests, or general inquiries.",
        action: {
          label: "Email contact@example.com",
          href: "mailto:contact@example.com",
          target: "_self",
        },
        showInHeader: true,
        navLabel: "Contact",
        anchorId: "contact",
        alignment: "left",
        maxWidth: "md",
        spacing: "normal",
      },
    ],
  };
}

async function ensureTheme(strapi, publishedAt) {
  const existingTheme = await strapi.db.query(THEME_UID).findOne({
    where: { slug: DEFAULT_THEME_SLUG },
    select: ["id", "documentId", "slug"],
  });

  if (existingTheme) {
    return existingTheme;
  }

  if (typeof strapi.documents === "function") {
    return strapi.documents(THEME_UID).create({
      data: themeData(),
      status: "published",
    });
  }

  return strapi.db.query(THEME_UID).create({
    data: {
      ...themeData(),
      publishedAt,
    },
  });
}

async function ensureHomePage(strapi, publishedAt) {
  const existingPage = await strapi.db.query(PAGE_UID).findOne({
    where: { slug: DEFAULT_HOME_SLUG },
    select: ["id", "documentId", "slug", "title"],
  });

  if (existingPage) {
    return existingPage;
  }

  if (typeof strapi.documents === "function") {
    return strapi.documents(PAGE_UID).create({
      data: pageData(),
      status: "published",
    });
  }

  return strapi.db.query(PAGE_UID).create({
    data: {
      ...pageData(),
      publishedAt,
    },
  });
}

async function upsertSiteConfig(strapi, { homepageRef, themeRef, publishedAt }) {
  if (!homepageRef || !themeRef) {
    strapi.log.warn("[seed] Could not resolve homepage/theme references for site config.");
    return;
  }

  const siteConfigData = {
    siteName: DEFAULT_SITE_TITLE,
    siteMode: "SPA",
    defaultTheme: themeRef,
    homepage: homepageRef,
    seoDefaultTitle: DEFAULT_SITE_TITLE,
    seoDefaultDescription:
      "A mission-driven organization improving lives through practical and effective programs.",
    footerTagline: "Building practical solutions that improve lives worldwide.",
    contactEmail: "contact@example.com",
    contactPhone: "+1 (555) 010-2900",
    publishedAt,
  };

  const coreService = strapi.service(SITE_CONFIG_UID);
  if (coreService && typeof coreService.createOrUpdate === "function") {
    await coreService.createOrUpdate({
      data: siteConfigData,
      status: "published",
    });
    return;
  }

  const existingSiteConfig = await strapi.db.query(SITE_CONFIG_UID).findOne({
    where: { id: 1 },
  });

  if (existingSiteConfig?.id) {
    await strapi.db.query(SITE_CONFIG_UID).update({
      where: { id: existingSiteConfig.id },
      data: siteConfigData,
    });
    return;
  }

  await strapi.db.query(SITE_CONFIG_UID).create({
    data: siteConfigData,
  });
}

async function seedDefaultContent(strapi) {
  if (process.env.SEED_DEFAULT_CONTENT === "false") {
    return;
  }

  try {
    const existingPages = await strapi.db.query(PAGE_UID).findMany({
      select: ["id", "title"],
      limit: 1,
    });

    if (existingPages.length > 0) {
      return;
    }

    const publishedAt = nowIso();
    const theme = await ensureTheme(strapi, publishedAt);
    const page = await ensureHomePage(strapi, publishedAt);

    await upsertSiteConfig(strapi, {
      homepageRef: relationRef(page),
      themeRef: relationRef(theme),
      publishedAt,
    });

    strapi.log.info("[seed] Created default single-page business content.");
  } catch (error) {
    strapi.log.warn(`[seed] Failed to seed default content: ${error instanceof Error ? error.message : "unknown error"}`);
    strapi.log.warn("[seed] Continuing startup without default seed data.");
  }
}

module.exports = {
  seedDefaultContent,
};
