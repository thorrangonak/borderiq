"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Search,
  Menu,
  X,
  Trophy,
  GitCompare,
  Compass,
  MapPin,
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { href: "/rankings", label: "Rankings", icon: Trophy, description: "Passport power rankings" },
  { href: "/compare", label: "Compare & Combine", icon: GitCompare, description: "Combine passports & see total power" },
  { href: "/explore", label: "Explore", icon: Compass, description: "Browse by region & color" },
  { href: "/countries", label: "Countries", icon: MapPin, description: "All 199 countries" },
  { href: "/advisor", label: "AI Advisor", icon: Bot, description: "Smart travel guidance" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-500/15 text-teal-400"
                      : "text-foreground-muted hover:bg-navy-600/50 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-navy-600/50 hover:text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`absolute transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
                }`}
              >
                <X className="h-5 w-5" />
              </span>
              <span
                className={`absolute transition-all duration-300 ${
                  mobileMenuOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
                }`}
              >
                <Menu className="h-5 w-5" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Fullscreen Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-500 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel - slides from right */}
        <div
          className={`absolute right-0 top-16 bottom-0 w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col h-full">
            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
              <div className="space-y-1">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                        isActive
                          ? "bg-teal-500/10 border border-teal-500/20"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                      style={{
                        transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                        opacity: mobileMenuOpen ? 1 : 0,
                        transform: mobileMenuOpen ? "translateX(0)" : "translateX(20px)",
                      }}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-teal-500/20 text-teal-400"
                            : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[15px] font-semibold ${
                            isActive ? "text-teal-400" : "text-white"
                          }`}
                        >
                          {link.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                      </div>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-all ${
                          isActive
                            ? "text-teal-500 opacity-100"
                            : "text-gray-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="px-4 pb-8 pt-2">
              {/* CTA Card */}
              <div
                className="rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-white/10 p-5"
                style={{
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
                  transition: "all 500ms ease-out 300ms",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <p className="text-sm font-semibold text-white">Discover Your Passport Power</p>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Select your passport and see where you can travel visa-free on our interactive world map.
                </p>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Try the Map
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Branding */}
              <div
                className="flex items-center justify-center gap-2 mt-5"
                style={{
                  opacity: mobileMenuOpen ? 1 : 0,
                  transition: "opacity 500ms ease-out 400ms",
                }}
              >
                <Globe className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs text-gray-600">
                  BorderIQ.io &middot; Global Passport Intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
