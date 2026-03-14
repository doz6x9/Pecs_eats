'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Healthy', 'Pécs Specials'];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('query') || 'All';

  function handleFilter(category: string) {
    const params = new URLSearchParams(window.location.search);
    if (category === 'All') {
      params.delete('query');
    } else {
      params.set('query', category);
    }
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const isActive = currentQuery === cat || (cat === 'All' && !searchParams.get('query'));
        return (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80 hover:border-amber-200'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}