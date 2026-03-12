import type { FaqSection } from "@scaffold/contracts";
import { CircleHelp } from "lucide-react";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface FaqSectionProps {
  section: FaqSection;
  anchorId: string;
}

export function FaqSectionBlock({ section, anchorId }: FaqSectionProps) {
  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={sectionContainerClassName(section)}>
        <div className="section-head">
          <p className="section-kicker">
            <CircleHelp className="section-kicker-icon" />
            <span>{section.navLabel || "FAQ"}</span>
          </p>
          <h2 className="section-title">{section.heading}</h2>
        </div>
        <div className="faq-list">
          {items.map((item, index) => (
            <details key={`${item.question || "faq"}-${index}`} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
