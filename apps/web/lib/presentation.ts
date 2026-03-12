import type { Alignment, MaxWidth, Spacing } from "@scaffold/contracts";

type PresentationInput = {
  alignment?: Alignment | null;
  maxWidth?: MaxWidth | null;
  spacing?: Spacing | null;
};

export function sectionClassName(section: PresentationInput): string {
  const alignment = section.alignment || "left";
  const spacing = section.spacing || "normal";
  return `section align-${alignment} spacing-${spacing}`;
}

export function sectionContainerClassName(section: PresentationInput): string {
  const maxWidth = section.maxWidth || "lg";
  return `shell max-${maxWidth}`;
}
