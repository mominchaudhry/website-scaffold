import type { FeatureGridSection } from "@scaffold/contracts";
import { Sparkles, Users } from "lucide-react";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface FeatureGridSectionProps {
  section: FeatureGridSection;
  anchorId: string;
}

export function FeatureGridSectionBlock({ section, anchorId }: FeatureGridSectionProps) {
  const columns = Number(section.columns);
  const safeColumns = columns === 2 || columns === 4 ? columns : 3;
  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={sectionContainerClassName(section)}>
        <div className="section-head">
          {section.navLabel ? (
            <p className="section-kicker">
              <Users className="section-kicker-icon" />
              <span>{section.navLabel}</span>
            </p>
          ) : null}
          <h2 className="section-title">{section.heading}</h2>
        </div>
        {section.body ? <p className="lead">{section.body}</p> : null}
        <div className="feature-grid" style={{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }}>
          {items.map((item, index) => (
            <article key={`${item.title || "feature"}-${index}`} className="feature-card">
              <span className="feature-icon-wrap">
                <Sparkles className="feature-icon" />
              </span>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
