import Link from "next/link";
import { Globe } from "lucide-react";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/api", label: "API" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
          {/* Branding */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15">
                <Globe className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                Border<span className="text-teal-400">IQ</span>
              </span>
            </Link>
            <p className="max-w-xs text-center text-xs sm:text-sm text-foreground-subtle md:text-left">
              Global passport intelligence and visa requirement data for every
              country.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 md:flex-row md:justify-between">
          <p className="text-xs text-foreground-subtle">
            &copy; {new Date().getFullYear()} BorderIQ. All rights reserved.
          </p>
          <p className="text-xs text-foreground-subtle">
            Visa data sourced from official government publications and verified
            travel databases.
          </p>
        </div>
      </div>
    </footer>
  );
}
