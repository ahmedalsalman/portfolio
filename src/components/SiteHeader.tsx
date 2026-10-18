'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="wrap">
        <Link href="/" className="mark" aria-label="Ahmed Al-Salman, home">
          <b>Ahmed Al-Salman</b>
          <span className="ar" lang="ar">أحمد</span>
        </Link>
        <nav className="nav" aria-label="Sections">
          <Link href="/#rooms">Exhibition</Link>
          <Link href="/#storeroom" className="hide-sm">Storeroom</Link>
          <Link href="/#chronology" className="hide-sm">Chronology</Link>
          <Link href="/#enquiries">Contact</Link>
          <ThemeButton />
        </nav>
      </div>
    </header>
  );
}

function ThemeButton() {
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };
  return (
    <button className="theme-btn" onClick={toggle} aria-label="Switch between light and dark gallery">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    </button>
  );
}
