'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';
import { deletePost } from '@/app/actions/postActions';
import Link from 'next/link';
import { Trash2, MessageCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentForm from './CommentForm';
import LikeButton from './LikeButton';

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
    avatar_url: string | null;
  } | null;
  recipe_requests: { count: number }[];
  user_has_requested: boolean;
  commentCount: number;
  likeCount: number;
  user_has_liked: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  showDeleteButton?: boolean;
}

export default function PostCard({ post, currentUserId, showDeleteButton = false }: PostCardProps) {
  const router = useRouter();
  const [isRequested, setIsRequested] = useState(post.user_has_requested);
  const [requestCount, setRequestCount] = useState(post.recipe_requests[0]?.count ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const authorDisplay = post.profiles?.email?.split('@')[0] || 'Pécs';

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }
    const alreadyRequested = isRequested;
    setIsRequested(!alreadyRequested);
    setRequestCount((prev) => (alreadyRequested ? prev - 1 : prev + 1));
    setError(null);
    const result = await requestRecipe(post.id);
    if (result.error) {
      setError(result.error);
      setIsRequested(alreadyRequested);
      setRequestCount((prev) => (alreadyRequested ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || currentUserId !== post.user_id) return;
    if (!window.confirm('Delete this post?')) return;
    try {
      setIsDeleting(true);
      setError(null);
      const result = await deletePost(post.id);
      if (result?.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
      setIsDeleting(false);
    }
  };

  const canDelete = showDeleteButton && currentUserId === post.user_id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`break-inside-avoid group relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200/80 transition-all duration-200 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Image: natural ratio, like Pinterest */}
      <div className="relative overflow-hidden bg-stone-50 rounded-t-2xl">
        <Link href={`/post/${post.id}`} className="block">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
          />
        </Link>

        {/* Hover overlay + Recipe button on image (Pinterest-style) — only button is clickable so image still links */}
        <div className="absolute inset-0 flex items-end justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            type="button"
            onClick={handleRequest}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all pointer-events-auto ${
              isRequested
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-stone-800 hover:bg-stone-100'
            }`}
          >
            <BookOpen size={14} className={isRequested ? 'fill-white' : ''} />
            {isRequested ? 'Requested' : 'Recipe'}
          </button>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-stone-400 hover:text-red-500 hover:bg-white shadow-md transition-all z-10 opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-3.5">
        <Link href={`/post/${post.id}`} className="block mb-3">
          <p className="text-sm font-medium text-stone-800 line-clamp-2 leading-snug hover:text-stone-600 transition-colors">
            {post.description}
          </p>
        </Link>

        {requestCount > 0 && (
          <p className="text-[11px] font-medium text-stone-400 mb-2">{requestCount} want this recipe</p>
        )}

        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
          <div className="flex items-center gap-2 min-w-0">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-200/80 flex items-center justify-center text-[10px] font-bold text-amber-800 flex-shrink-0">
                {authorDisplay.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-stone-500 truncate">{authorDisplay}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <LikeButton
              postId={post.id}
              initialLiked={post.user_has_liked}
              initialCount={post.likeCount}
              currentUserId={currentUserId}
              variant="compact"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowCommentBox(!showCommentBox);
              }}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-600 transition-colors"
            >
              <MessageCircle size={14} />
              <span className="text-xs font-medium">{post.commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCommentBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-stone-100"
          >
            <div className="p-3 pt-2 bg-stone-50/50">
              <CommentForm postId={post.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="px-3.5 pb-3 text-xs text-red-500 font-medium">{error}</p>
      )}
    </motion.article>
  );
}
