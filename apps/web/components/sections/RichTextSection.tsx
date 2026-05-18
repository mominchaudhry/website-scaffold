import type { RichTextSection } from "@scaffold/contracts";
import { Info, PlayCircle } from "lucide-react";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface RichTextSectionProps {
  section: RichTextSection;
  anchorId: string;
}

export function RichTextSectionBlock({ section, anchorId }: RichTextSectionProps) {
  const headingText = (section.heading || section.navLabel || "").toLowerCase();
  const Icon = headingText.includes("video") ? PlayCircle : Info;

  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={`${sectionContainerClassName(section)} prose-wrap`}>
        <div className="section-head">
          {section.navLabel ? (
            <p className="section-kicker">
              <Icon className="section-kicker-icon" />
              <span>{section.navLabel}</span>
            </p>
          ) : null}
          {section.heading ? <h2 className="section-title">{section.heading}</h2> : null}
        </div>
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}
