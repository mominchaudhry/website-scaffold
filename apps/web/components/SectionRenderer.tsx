import type { Section } from "@scaffold/contracts";
import { logUnknownSection } from "@/lib/telemetry";
import { getSectionAnchor } from "@/lib/sections";
import { UnknownSection } from "./UnknownSection";
import { CtaSectionBlock } from "./sections/CtaSection";
import { FaqSectionBlock } from "./sections/FaqSection";
import { FeatureGridSectionBlock } from "./sections/FeatureGridSection";
import { GallerySectionBlock } from "./sections/GallerySection";
import { HeroSectionBlock } from "./sections/HeroSection";
import { RichTextSectionBlock } from "./sections/RichTextSection";

type RuntimeSection = Section | ({ id: number; __component: string } & Record<string, unknown>);

interface SectionRendererProps {
  sections: RuntimeSection[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.__component}-${section.id}`;
        const anchorId = getSectionAnchor(section, index);

        switch (section.__component) {
          case "sections.hero":
            return <HeroSectionBlock key={key} section={section as Section & { __component: "sections.hero" }} anchorId={anchorId} />;
          case "sections.feature-grid":
            return (
              <FeatureGridSectionBlock
                key={key}
                section={section as Section & { __component: "sections.feature-grid" }}
                anchorId={anchorId}
              />
            );
          case "sections.rich-text":
            return (
              <RichTextSectionBlock
                key={key}
                section={section as Section & { __component: "sections.rich-text" }}
                anchorId={anchorId}
              />
            );
          case "sections.cta":
            return <CtaSectionBlock key={key} section={section as Section & { __component: "sections.cta" }} anchorId={anchorId} />;
          case "sections.faq":
            return <FaqSectionBlock key={key} section={section as Section & { __component: "sections.faq" }} anchorId={anchorId} />;
          case "sections.gallery":
            return (
              <GallerySectionBlock
                key={key}
                section={section as Section & { __component: "sections.gallery" }}
                anchorId={anchorId}
              />
            );
          default:
            logUnknownSection(section.__component);
            return <UnknownSection key={key} componentUid={section.__component} />;
        }
      })}
    </>
  );
}
