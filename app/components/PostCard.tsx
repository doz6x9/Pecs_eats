'use client';

import { useState } from 'react';

export default function PostCard({ post }: { post: any }) {
  const [isRequested, setIsRequested] = useState(false);

  return (
    <div className="masonry-item group relative cursor-pointer">
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={post.image_url}
          alt={post.description}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsRequested(true);
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all ${
                isRequested
                ? 'bg-gray-200 text-gray-500 cursor-default'
                : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isRequested ? '✓ Requested' : 'Request Recipe'}
            </button>
          </div>
        </div>
      </div>

      {/* Post Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-bold leading-tight line-clamp-2">{post.description}</h3>
        <p className="text-xs text-gray-500 mt-1">PTE Student</p>
      </div>
    </div>
  );
}