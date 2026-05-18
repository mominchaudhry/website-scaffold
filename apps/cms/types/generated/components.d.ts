import type { Struct, Schema } from '@strapi/strapi';

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    description: 'Reusable CTA link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<['_self', '_blank']> &
      Schema.Attribute.DefaultTo<'_self'>;
  };
}

export interface ThemeTypography extends Struct.ComponentSchema {
  collectionName: 'components_theme_typographies';
  info: {
    displayName: 'Theme Typography';
  };
  attributes: {
    fontFamilyBase: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"'Source Sans 3', sans-serif">;
    fontFamilyHeading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"'Space Grotesk', sans-serif">;
    baseSize: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'16px'>;
    headingWeight: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<700>;
    bodyWeight: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<400>;
  };
}

export interface ThemeSpacing extends Struct.ComponentSchema {
  collectionName: 'components_theme_spacings';
  info: {
    displayName: 'Theme Spacing';
  };
  attributes: {
    sectionY: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'4rem'>;
    containerX: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1.25rem'>;
    gap: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1.5rem'>;
  };
}

export interface ThemeShadow extends Struct.ComponentSchema {
  collectionName: 'components_theme_shadows';
  info: {
    displayName: 'Theme Shadow';
  };
  attributes: {
    card: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0 10px 25px rgba(15, 23, 42, 0.08)'>;
    elevated: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0 16px 40px rgba(15, 23, 42, 0.14)'>;
  };
}

export interface ThemeRadius extends Struct.ComponentSchema {
  collectionName: 'components_theme_radii';
  info: {
    displayName: 'Theme Radius';
  };
  attributes: {
    small: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0.375rem'>;
    medium: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0.75rem'>;
    large: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1.25rem'>;
  };
}

export interface ThemeColors extends Struct.ComponentSchema {
  collectionName: 'components_theme_colors';
  info: {
    displayName: 'Theme Colors';
  };
  attributes: {
    background: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#f9fafb'>;
    surface: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#ffffff'>;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#111827'>;
    mutedText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#4b5563'>;
    primary: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#0f766e'>;
    secondary: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#f97316'>;
    border: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'global::hex-color'> &
      Schema.Attribute.DefaultTo<'#d1d5db'>;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    displayName: 'Rich Text';
  };
  attributes: {
    heading: Schema.Attribute.String;
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.Text;
    primaryAction: Schema.Attribute.Component<'shared.link', false>;
    secondaryAction: Schema.Attribute.Component<'shared.link', false>;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsGallery extends Struct.ComponentSchema {
  collectionName: 'components_sections_galleries';
  info: {
    displayName: 'Gallery';
  };
  attributes: {
    heading: Schema.Attribute.String;
    images: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_items';
  info: {
    displayName: 'Feature Item';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
  };
}

export interface SectionsFeatureGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_grids';
  info: {
    displayName: 'Feature Grid';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.Text;
    columns: Schema.Attribute.Enumeration<['2', '3', '4']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'3'>;
    items: Schema.Attribute.Component<'sections.feature-item', true> &
      Schema.Attribute.Required;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'sections.faq-item', true> &
      Schema.Attribute.Required;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_items';
  info: {
    displayName: 'FAQ Item';
  };
  attributes: {
    question: Schema.Attribute.String & Schema.Attribute.Required;
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsCta extends Struct.ComponentSchema {
  collectionName: 'components_sections_ctas';
  info: {
    displayName: 'CTA';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.Text;
    action: Schema.Attribute.Component<'shared.link', false> &
      Schema.Attribute.Required;
    showInHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navLabel: Schema.Attribute.String;
    anchorId: Schema.Attribute.String;
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    maxWidth: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'full']> &
      Schema.Attribute.DefaultTo<'lg'>;
    spacing: Schema.Attribute.Enumeration<['compact', 'normal', 'large']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.link': SharedLink;
      'theme.typography': ThemeTypography;
      'theme.spacing': ThemeSpacing;
      'theme.shadow': ThemeShadow;
      'theme.radius': ThemeRadius;
      'theme.colors': ThemeColors;
      'sections.rich-text': SectionsRichText;
      'sections.hero': SectionsHero;
      'sections.gallery': SectionsGallery;
      'sections.feature-item': SectionsFeatureItem;
      'sections.feature-grid': SectionsFeatureGrid;
      'sections.faq': SectionsFaq;
      'sections.faq-item': SectionsFaqItem;
      'sections.cta': SectionsCta;
    }
  }
}
