export type SiteMode = "SPA" | "MULTI_PAGE";

export interface SiteConfig {
  id: number;
  siteMode: SiteMode;
  seoDefaultTitle?: string | null;
  seoDefaultDescription?: string | null;
  defaultTheme?: Theme | null;
  homepage?: PageSummary | null;
  publishedAt?: string | null;
}

export interface PageSummary {
  id: number;
  title: string;
  slug: string;
}

export interface Theme {
  id: number;
  name: string;
  slug: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
}

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  primary: string;
  secondary: string;
  border: string;
}

export interface ThemeTypography {
  fontFamilyBase: string;
  fontFamilyHeading: string;
  baseSize: string;
  headingWeight: number;
  bodyWeight: number;
}

export interface ThemeSpacing {
  sectionY: string;
  containerX: string;
  gap: string;
}

export interface ThemeRadius {
  small: string;
  medium: string;
  large: string;
}

export interface ThemeShadow {
  card: string;
  elevated: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  showInHeader: boolean;
  headerLabel?: string | null;
  isHome: boolean;
  sections: Section[];
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface HeaderLink {
  label: string;
  href: string;
}

export type Alignment = "left" | "center" | "right";
export type MaxWidth = "sm" | "md" | "lg" | "full";
export type Spacing = "compact" | "normal" | "large";

export interface ActionLink {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

export interface FeatureItem {
  title: string;
  description?: string | null;
  icon?: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

interface SectionBase {
  id: number;
  __component: string;
  showInHeader?: boolean | null;
  navLabel?: string | null;
  anchorId?: string | null;
  alignment?: Alignment | null;
  maxWidth?: MaxWidth | null;
  spacing?: Spacing | null;
}

export interface HeroSection extends SectionBase {
  __component: "sections.hero";
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  primaryAction?: ActionLink | null;
  secondaryAction?: ActionLink | null;
}

export interface FeatureGridSection extends SectionBase {
  __component: "sections.feature-grid";
  heading: string;
  body?: string | null;
  columns: 2 | 3 | 4;
  items: FeatureItem[];
}

export interface RichTextSection extends SectionBase {
  __component: "sections.rich-text";
  heading?: string | null;
  content: string;
}

export interface CtaSection extends SectionBase {
  __component: "sections.cta";
  heading: string;
  body?: string | null;
  action: ActionLink;
}

export interface FaqSection extends SectionBase {
  __component: "sections.faq";
  heading: string;
  items: FaqItem[];
}

export interface GallerySection extends SectionBase {
  __component: "sections.gallery";
  heading?: string | null;
  images: Array<{
    id: number;
    url: string;
    alternativeText?: string | null;
  }>;
}

export type Section =
  | HeroSection
  | FeatureGridSection
  | RichTextSection
  | CtaSection
  | FaqSection
  | GallerySection;
