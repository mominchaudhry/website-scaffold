import type { HeroSection } from "@scaffold/contracts";
import { ArrowRight, ChevronDown, Heart } from "lucide-react";
import Link from "next/link";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface HeroSectionProps {
  section: HeroSection;
  anchorId: string;
}

export function HeroSectionBlock({ section, anchorId }: HeroSectionProps) {
  const primaryAction = section.primaryAction;
  const secondaryAction = section.secondaryAction;
  const hasPrimaryAction = Boolean(primaryAction?.href && primaryAction?.label);
  const hasSecondaryAction = Boolean(secondaryAction?.href && secondaryAction?.label);
  const scrollTarget = hasPrimaryAction && primaryAction!.href.startsWith("#") ? primaryAction!.href : "#about";

  return (
    <section id={anchorId} className={`${sectionClassName(section)} hero-section`}>
      <div className={`${sectionContainerClassName(section)} hero-shell`}>
        {section.eyebrow ? (
          <p className="eyebrow hero-badge">
            <Heart className="hero-badge-icon" />
            <span>{section.eyebrow}</span>
          </p>
        ) : null}
        <h1>{section.heading}</h1>
        {section.body ? <p className="lead">{section.body}</p> : null}
        <div className="actions">
          {hasPrimaryAction ? (
            <Link className="button primary" href={primaryAction!.href} target={primaryAction!.target || "_self"}>
              <span>{primaryAction!.label}</span>
              <ArrowRight className="button-icon" />
            </Link>
          ) : null}
          {hasSecondaryAction ? (
            <Link
              className="button ghost"
              href={secondaryAction!.href}
              target={secondaryAction!.target || "_self"}
            >
              <span>{secondaryAction!.label}</span>
            </Link>
          ) : null}
        </div>
      </div>
      <Link className="hero-scroll-indicator" href={scrollTarget} aria-label="Scroll to next section">
        <ChevronDown className="hero-scroll-icon" />
      </Link>
    </section>
  );
}
