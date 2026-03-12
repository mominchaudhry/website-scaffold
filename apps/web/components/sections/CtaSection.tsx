import type { CtaSection } from "@scaffold/contracts";
import { ArrowRight, HandHeart } from "lucide-react";
import Link from "next/link";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface CtaSectionProps {
  section: CtaSection;
  anchorId: string;
}

export function CtaSectionBlock({ section, anchorId }: CtaSectionProps) {
  const hasAction = Boolean(section.action?.href && section.action?.label);

  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={`${sectionContainerClassName(section)} cta-shell`}>
        <div className="section-head">
          <p className="section-kicker">
            <HandHeart className="section-kicker-icon" />
            <span>{section.navLabel || "Call to Action"}</span>
          </p>
          <h2 className="section-title">{section.heading}</h2>
        </div>
        {section.body ? <p>{section.body}</p> : null}
        {hasAction ? (
          <Link className="button primary" href={section.action.href} target={section.action.target || "_self"}>
            <span>{section.action.label}</span>
            <ArrowRight className="button-icon" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
