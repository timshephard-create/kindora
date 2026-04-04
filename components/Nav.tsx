'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PLATFORM, getToolByRoute } from '@/config/platform';

export default function Nav() {
  const pathname = usePathname();
  const currentTool = getToolByRoute(pathname);
  const isHub = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-charcoal">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-white"
        >
          {PLATFORM.name}
        </Link>

        {!isHub && currentTool && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <span aria-hidden="true">&larr;</span>
            All Tools
          </Link>
        )}
      </div>
    </nav>
  );
}
