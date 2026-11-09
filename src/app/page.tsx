import type { Metadata } from 'next';
import { HeroStrip } from '@/components/HeroStrip';
import { HomeSections } from '@/components/HomeSections';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <HeroStrip />
      <HomeSections />
    </>
  );
}
