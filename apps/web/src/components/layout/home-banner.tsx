'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function HomeBanner() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <div className="relative z-10 -mt-16 h-[220px] w-full overflow-hidden bg-[#0d1b3e] sm:h-[260px] md:h-[320px]">
      <Image src="/images/banner.jpg" alt="" fill className="object-cover object-center" priority />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
