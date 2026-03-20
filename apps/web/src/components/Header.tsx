"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="frosted-glass sticky top-0 z-100">
      <nav
        className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-0 text-[22px] font-[800] font-[family-name:var(--font-sora)]"
          aria-label="Burnlog home"
        >
          <span className="text-text">Burn</span>
          <span className="text-brand">log</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/dashboard"
            className="text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:text-text"
          >
            Dashboard
          </Link>
          <Link
            href="/u/williamchan"
            className="text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:text-text"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:text-text"
          >
            Settings
          </Link>
          <Link
            href="/login"
            className="inline-flex h-[44px] items-center rounded-[50px] bg-brand px-6 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
          >
            Log in
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/50 px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            <Link
              href="/dashboard"
              className="rounded-[12px] px-4 py-3 text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:bg-blue-50 hover:text-text"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/u/williamchan"
              className="rounded-[12px] px-4 py-3 text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:bg-blue-50 hover:text-text"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/settings"
              className="rounded-[12px] px-4 py-3 text-[15px] font-[500] text-text-secondary transition-colors duration-200 hover:bg-blue-50 hover:text-text"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <Link
              href="/login"
              className="mt-2 inline-flex h-[44px] items-center justify-center rounded-[50px] bg-brand px-6 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
