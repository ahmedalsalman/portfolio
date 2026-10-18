'use client';
import { useEffect, useRef } from 'react';

/** Fades its children in the first time they enter the viewport. */
export function Reveal({ children, as: Tag = 'div', className = '', ...rest }: {
  children: React.ReactNode;
  as?: 'div' | 'article' | 'section' | 'li' | 'figure';
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any;
  return (
    <T ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </T>
  );
}
