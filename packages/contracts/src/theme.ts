import type { Theme } from "./site";

export type ThemeCssVariables = Record<`--${string}`, string>;

export const fallbackTheme: Theme = {
  id: 0,
  name: "Default",
  slug: "default",
  colors: {
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    mutedText: "#4b5563",
    primary: "#0f766e",
    secondary: "#f97316",
    border: "#d1d5db",
  },
  typography: {
    fontFamilyBase: "'Source Sans 3', sans-serif",
    fontFamilyHeading: "'Space Grotesk', sans-serif",
    baseSize: "16px",
    headingWeight: 700,
    bodyWeight: 400,
  },
  spacing: {
    sectionY: "4rem",
    containerX: "1.25rem",
    gap: "1.5rem",
  },
  radius: {
    small: "0.375rem",
    medium: "0.75rem",
    large: "1.25rem",
  },
  shadow: {
    card: "0 10px 25px rgba(15, 23, 42, 0.08)",
    elevated: "0 16px 40px rgba(15, 23, 42, 0.14)",
  },
};

export function themeToCssVariables(theme: Theme): ThemeCssVariables {
  return {
    "--color-bg": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-muted": theme.colors.mutedText,
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-border": theme.colors.border,
    "--font-base": theme.typography.fontFamilyBase,
    "--font-heading": theme.typography.fontFamilyHeading,
    "--font-base-size": theme.typography.baseSize,
    "--font-heading-weight": String(theme.typography.headingWeight),
    "--font-body-weight": String(theme.typography.bodyWeight),
    "--space-section-y": theme.spacing.sectionY,
    "--space-container-x": theme.spacing.containerX,
    "--space-gap": theme.spacing.gap,
    "--radius-small": theme.radius.small,
    "--radius-medium": theme.radius.medium,
    "--radius-large": theme.radius.large,
    "--shadow-card": theme.shadow.card,
    "--shadow-elevated": theme.shadow.elevated,
  };
}
