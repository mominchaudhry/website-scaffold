export const env = {
  strapiApiUrl: (process.env.STRAPI_API_URL || "http://localhost:1337").replace(/\/$/, ""),
  strapiPublicToken: process.env.STRAPI_PUBLIC_TOKEN,
  strapiPreviewToken: process.env.STRAPI_PREVIEW_TOKEN,
  previewSecret: process.env.PREVIEW_SECRET || (() => { console.warn("PREVIEW_SECRET is not set — using insecure default"); return "preview-secret"; })(),
  revalidateSecret: process.env.REVALIDATE_SECRET || (() => { console.warn("REVALIDATE_SECRET is not set — using insecure default"); return "revalidate-secret"; })(),
};
