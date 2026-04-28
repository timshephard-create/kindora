'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getToolByRoute } from '@/config/platform';

export default function Nav() {
  const pathname = usePathname();
  const currentTool = getToolByRoute(pathname);
  const isHub = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-clover">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-white"
        >
          kindora<span className="text-apricot">.</span>
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
