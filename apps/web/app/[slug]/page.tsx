import { SectionRenderer } from "@/components/SectionRenderer";
import { getPageBySlug, getSiteConfig } from "@/lib/strapi";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

interface SlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const preview = (await draftMode()).isEnabled;
  const siteConfig = await getSiteConfig(preview).catch(() => null);

  if (!siteConfig) {
    notFound();
  }

  if (siteConfig.siteMode === "SPA") {
    notFound();
  }

  const page = await getPageBySlug(slug, preview).catch(() => null);

  if (!page) {
    notFound();
  }

  return <SectionRenderer sections={page.sections} />;
}
