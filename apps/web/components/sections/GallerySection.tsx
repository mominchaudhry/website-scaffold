import type { GallerySection } from "@scaffold/contracts";
import { Images } from "lucide-react";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface GallerySectionProps {
  section: GallerySection;
  anchorId: string;
}

export function GallerySectionBlock({ section, anchorId }: GallerySectionProps) {
  const images = Array.isArray(section.images) ? section.images : [];

  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={sectionContainerClassName(section)}>
        {section.heading || section.navLabel ? (
          <div className="section-head">
            {section.navLabel ? (
              <p className="section-kicker">
                <Images className="section-kicker-icon" />
                <span>{section.navLabel}</span>
              </p>
            ) : null}
            {section.heading ? <h2 className="section-title">{section.heading}</h2> : null}
          </div>
        ) : null}
        <div className="gallery-grid">
          {images.map((image, index) => (
            <figure key={`${image.id || "image"}-${index}`} className="gallery-item">
              <img src={image.url || ""} alt={image.alternativeText || "Gallery image"} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
