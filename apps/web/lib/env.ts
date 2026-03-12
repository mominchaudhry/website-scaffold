export const env = {
  strapiApiUrl: (process.env.STRAPI_API_URL || "http://localhost:1337").replace(/\/$/, ""),
  strapiPublicToken: process.env.STRAPI_PUBLIC_TOKEN,
  strapiPreviewToken: process.env.STRAPI_PREVIEW_TOKEN,
  previewSecret: process.env.PREVIEW_SECRET || "preview-secret",
  revalidateSecret: process.env.REVALIDATE_SECRET || "revalidate-secret",
};
