import type { HeaderLink } from "@scaffold/contracts";
import { ArrowUpRight, HeartHandshake, Mail, Phone } from "lucide-react";

interface SiteFooterProps {
  links: HeaderLink[];
  title: string;
  description: string;
}

export function SiteFooter({ links, title, description }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <section>
          <h2 className="footer-title footer-brand">
            <HeartHandshake className="footer-brand-icon" />
            <span>{title}</span>
          </h2>
          <p className="footer-description">{description}</p>
        </section>

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

        <section>
          <h3 className="footer-heading">Contact</h3>
          <p className="footer-description footer-contact-row">
            <Mail className="footer-contact-icon" />
            <span>contact@example.com</span>
          </p>
          <p className="footer-description footer-contact-row">
            <Phone className="footer-contact-icon" />
            <span>+1 (555) 010-2900</span>
          </p>
        </section>
      </div>
      <div className="shell footer-bottom">© {new Date().getFullYear()} {title}. All rights reserved.</div>
    </footer>
  );
}
