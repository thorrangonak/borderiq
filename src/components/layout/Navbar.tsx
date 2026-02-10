"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Search, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/rankings", label: "Rankings" },
  { href: "/compare", label: "Compare" },
  { href: "/explore", label: "Explore" },
  { href: "/countries", label: "Countries" },
  { href: "/advisor", label: "Advisor" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-strong sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
            <Globe className="h-5 w-5 text-teal-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Border<span className="text-teal-400">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3.5 text-base font-medium text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground active:bg-navy-600/70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
