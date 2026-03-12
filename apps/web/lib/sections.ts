import { slugify } from "./slug";

type SectionAnchorInput = {
  __component: string;
  anchorId?: string | null;
  navLabel?: string | null;
};

export function getSectionAnchor(section: SectionAnchorInput, index: number): string {
  if (section.__component === "sections.hero" && !section.anchorId && !section.navLabel) {
    return "home";
  }

  const fallback = `${section.__component}-${index + 1}`;
  return slugify(section.anchorId || section.navLabel || fallback);
}
