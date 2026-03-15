'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/actions/postActions';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  currentUserId: string | null;
  variant?: 'compact' | 'full' | 'overlay';
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  currentUserId,
  variant = 'compact'
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }

    const previousLiked = liked;

    // Optimistic update
    setLiked(!previousLiked);
    setCount(prev => previousLiked ? prev - 1 : prev + 1);
    setIsAnimating(true);

    const result = await toggleLike(postId);

    if (result?.error) {
      // Revert on error
      setLiked(previousLiked);
      setCount(prev => previousLiked ? prev + 1 : prev - 1);
      console.error(result.error);
    }
  };

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleLike}
        className="flex flex-col items-center gap-1 group/like pointer-events-auto"
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => setIsAnimating(false)}
          className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${
            liked ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
          }`}
        >
          <Heart
            size={24} // Made bigger
            className={`${liked ? 'fill-white' : 'group-hover/like:text-red-500 group-hover/like:fill-red-50 transition-colors'}`}
          />
        </motion.div>
        {count > 0 && (
          <span className="text-xs font-bold text-white drop-shadow-md">
            {count}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleLike}
        className="flex items-center gap-1.5 transition-colors group/like"
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <Heart
            size={20} // Made bigger from 14 to 20
            className={`transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover/like:text-red-400'}`}
          />
        </motion.div>
        <span className={`text-sm font-bold ${liked ? 'text-red-600' : 'text-slate-500 group-hover/like:text-red-500'}`}>
          {count}
        </span>
      </button>
    );
  }

  // Full variant for post detail page
  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
        liked
          ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        <Heart
          size={20} // Made slightly bigger
          className={liked ? 'fill-red-500' : ''}
        />
      </motion.div>
      <span>{liked ? 'Liked' : 'Like'}</span>
      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/50 text-xs">{count}</span>
    </button>
  );
}
