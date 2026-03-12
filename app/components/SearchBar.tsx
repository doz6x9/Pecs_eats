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
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {isPending ? '⏳' : '🔍'}
      </span>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for amazing meals in Pécs..."
        className="w-full bg-gray-100 rounded-full pl-11 pr-5 py-2.5 outline-none focus:ring-2 focus:ring-red-200 transition-all text-sm"
      />
    </div>
  );
}