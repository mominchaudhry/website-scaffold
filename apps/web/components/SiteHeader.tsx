"use client";

import type { HeaderLink } from "@scaffold/contracts";
import { HeartHandshake, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface SiteHeaderProps {
  links: HeaderLink[];
}

export function SiteHeader({ links }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePath = pathname === "/";
  const isHeroState = isHomePath && !isScrolled;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navId = "primary-navigation";
  const headerClassName = useMemo(
    () => `site-header ${isHeroState ? "is-hero" : "is-solid"} ${isMenuOpen ? "menu-open" : ""}`,
    [isHeroState, isMenuOpen]
  );

  return (
    <header className={headerClassName}>
      <div className="shell">
        <div className="header-top">
          <Link className="brand" href="/" onClick={() => setIsMenuOpen(false)}>
            <HeartHandshake className="brand-icon" />
            <span>My Organization</span>
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={isMenuOpen}
            aria-controls={navId}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X className="nav-toggle-icon" /> : <Menu className="nav-toggle-icon" />}
          </button>
        </div>
        <nav id={navId} aria-label="Main navigation" className={`nav-links ${isMenuOpen ? "is-open" : ""}`}>
          {links.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
