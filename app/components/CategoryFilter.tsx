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
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar max-w-[1800px] mx-auto px-4 mt-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
            currentQuery === cat || (cat === 'All' && !searchParams.get('query'))
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}