'use client';

import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';
import { deletePost } from '@/app/actions/postActions';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  has_recipe: boolean;
  created_at: string;
  profiles: {
    id: string;
    email: string;
  } | null;
  recipe_requests: { count: number }[];
  user_has_requested: boolean;
  commentCount: number;
}

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  showDeleteButton?: boolean;
}

export default function PostCard({ post, currentUserId, showDeleteButton = false }: PostCardProps) {
  const [isRequested, setIsRequested] = useState(post.user_has_requested);
  const [requestCount, setRequestCount] = useState(post.recipe_requests[0]?.count ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorDisplay = post.profiles?.email.split('@')[0] || 'Pécs Student';

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }

    const alreadyRequested = isRequested;
    setIsRequested(!alreadyRequested);
    setRequestCount(prev => alreadyRequested ? prev - 1 : prev + 1);
    setError(null);

    const result = await requestRecipe(post.id);
    if (result.error) {
      setError(result.error);
      // Revert UI on error
      setIsRequested(alreadyRequested);
      setRequestCount(prev => alreadyRequested ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    // ... (delete logic)
  };

  const canDelete = showDeleteButton && currentUserId === post.user_id;

  return (
    <div className={`break-inside-avoid mb-4 group relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link href={`/post/${post.id}`} className="cursor-pointer">
        <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          <img src={post.image_url} alt={post.description} className="w-full h-auto object-cover" />
          {canDelete && (
            <div className="absolute top-2 right-2">
              {/* ... (delete button) */}
            </div>
          )}
        </div>
      </Link>
      <div className="mt-2 px-1 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{post.description}</h3>

        <div className="flex items-center justify-between gap-2">
          <button onClick={handleRequest} className={`flex-grow px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${isRequested ? 'bg-slate-200 text-slate-600' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            {isRequested ? '✓ Requested' : 'Request Recipe'}
          </button>
          <div className="text-sm font-bold text-slate-600 pr-2">{requestCount}</div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-700">{authorDisplay.charAt(0).toUpperCase()}</div>
            <p className="font-medium">{authorDisplay}</p>
          </div>
          <Link href={`/post/${post.id}#comments`} className="hover:underline">
            {post.commentCount} comments
          </Link>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
