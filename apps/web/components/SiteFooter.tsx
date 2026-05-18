import type { HeaderLink } from "@scaffold/contracts";
import { ArrowUpRight, HeartHandshake, Mail, Phone } from "lucide-react";

interface SiteFooterProps {
  links: HeaderLink[];
  siteName: string;
  tagline?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export function SiteFooter({ links, siteName, tagline, contactEmail, contactPhone }: SiteFooterProps) {
  const hasContact = contactEmail || contactPhone;

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <section>
          <h2 className="footer-title footer-brand">
            <HeartHandshake className="footer-brand-icon" />
            <span>{siteName}</span>
          </h2>
          {tagline ? <p className="footer-description">{tagline}</p> : null}
        </section>

        {links.length > 0 ? (
          <section>
            <h3 className="footer-heading">Quick Links</h3>
            <nav aria-label="Footer quick links" className="footer-links">
              {links.map((link) => (
                <a key={`${link.label}-${link.href}`} href={link.href} className="footer-link">
                  <span>{link.label}</span>
                  <ArrowUpRight className="footer-link-icon" />
                </a>
              ))}
            </nav>
          </section>
        ) : null}

        {hasContact ? (
          <section>
            <h3 className="footer-heading">Contact</h3>
            {contactEmail ? (
              <p className="footer-description footer-contact-row">
                <Mail className="footer-contact-icon" />
                <span>{contactEmail}</span>
              </p>
            ) : null}
            {contactPhone ? (
              <p className="footer-description footer-contact-row">
                <Phone className="footer-contact-icon" />
                <span>{contactPhone}</span>
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
      <div className="shell footer-bottom">&copy; {new Date().getFullYear()} {siteName}</div>
    </footer>
  );
}
