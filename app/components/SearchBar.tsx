'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Navigates to the new URL without a full page reload
    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  }

  return (
    <div className="flex-1 relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
        {isPending ? '⏳' : '🔍'}
      </span>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for amazing meals in Pécs..."
        className="w-full bg-white/90 border border-stone-200/80 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-2 focus:ring-amber-300/60 focus:border-amber-300/50 transition-all text-sm text-stone-800 placeholder:text-stone-400 shadow-sm"
      />
    </div>
  );
}