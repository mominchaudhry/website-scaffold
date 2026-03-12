function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickFirstRecord(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.find((entry) => entry && typeof entry === "object") || null;
  }

  return value;
}

function resolveResultRecord(input) {
  const result = input.result;

  if (result && typeof result === "object" && Array.isArray(result.entries)) {
    return pickFirstRecord(result.entries);
  }

  return pickFirstRecord(result);
}

function getPageSlug(input, result) {
  if (result && typeof result.slug === "string" && result.slug.length > 0) {
    return result.slug;
  }

  const dataSlug = input?.params?.data?.slug;
  if (typeof dataSlug === "string" && dataSlug.length > 0) {
    return dataSlug;
  }

  return null;
}

function getThemeId(input, result) {
  const resultId = toNumber(result?.id);
  if (resultId) {
    return resultId;
  }

  const dataId = toNumber(input?.params?.data?.id);
  if (dataId) {
    return dataId;
  }

  return null;
}

function buildPayload(input) {
  const result = resolveResultRecord(input);
  const tags = ["cms", "site-config", "pages", "themes"];
  const paths = ["/"];

  if (input.model === "api::theme.theme") {
    const themeId = getThemeId(input, result);
    if (themeId) {
      tags.push(`theme:${themeId}`);
    }
  }

  if (input.model === "api::page.page") {
    const slug = getPageSlug(input, result);
    if (slug) {
      tags.push(`page:${slug}`);
      paths.push(slug === "home" ? "/" : `/${slug}`);
    }

    if (result?.isHome === true || slug === "home") {
      paths.push("/");
    }
  }

  return {
    secret: process.env.REVALIDATE_SECRET || "",
    tags: unique(tags),
    paths: unique(paths),
    meta: {
      model: input.model,
      action: input.action,
    },
  };
}

const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 350;
const REQUEST_TIMEOUT_MS = 6000;
let hasLoggedMissingConfig = false;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function revalidateForEntry(input) {
  const endpoint = process.env.REVALIDATE_WEBHOOK_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!endpoint || !secret) {
    if (!hasLoggedMissingConfig) {
      hasLoggedMissingConfig = true;
      console.warn("[revalidate] Skipping webhook because REVALIDATE_WEBHOOK_URL or REVALIDATE_SECRET is missing.");
    }
    return;
  }

  hasLoggedMissingConfig = false;
  const payload = buildPayload(input);

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body || "empty body"}`);
      }

      return;
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt < MAX_RETRY_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
        continue;
      }

      console.error("[revalidate] Failed to notify Next.js", {
        message: error instanceof Error ? error.message : "Unknown error",
        model: input.model,
        action: input.action,
        endpoint,
      });
    }
  }
}

module.exports = {
  revalidateForEntry,
};
