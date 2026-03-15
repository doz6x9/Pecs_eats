import { createClient } from '@/utils/supabase/server';
import PostCard from './components/PostCard';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import Link from 'next/link';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

interface RecipeRequest {
  user_id: string;
}

interface Like {
  user_id: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let supabaseQuery = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (id, email, avatar_url),
      recipe_requests (user_id),
      comments (count),
      likes (user_id)
    `)
    .order('created_at', { ascending: false });

  if (query && query !== 'All') {
    supabaseQuery = supabaseQuery.ilike('description', `%${query}%`);
  }

  const { data: postsData, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching posts:', error);
  }

  const posts = postsData?.map(post => ({
    ...post,
    user_has_requested: user ? post.recipe_requests.some((req: RecipeRequest) => req.user_id === user.id) : false,
    recipe_requests: [{ count: post.recipe_requests.length }],
    commentCount: post.comments[0]?.count ?? 0,
    likeCount: post.likes?.length ?? 0,
    user_has_liked: user ? (post.likes ?? []).some((l: Like) => l.user_id === user.id) : false,
  })) || [];

  return (
    <div className="w-full min-h-[60vh]">
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <p className="inline-flex items-center gap-1.5 text-amber-700/90 text-sm font-semibold tracking-wide uppercase mb-3">
          <Sparkles className="w-4 h-4" />
          Pécs food community
        </p>
        <h1 className="font-nunito text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-2">
          Share meals. Get recipes.
        </h1>
        <p className="text-stone-600 text-lg max-w-xl mx-auto">
          Discover what everyone’s cooking and request the recipes you love.
        </p>
      </section>

      {/* Search + filters bar */}
      <section className="mb-8">
        <div className="max-w-3xl mx-auto">
          <SearchBar defaultValue={query} />
          <div className="mt-4">
            <CategoryFilter />
          </div>
        </div>
      </section>

      {/* Feed */}
      <section>
        {posts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-nunito text-xl font-bold text-stone-800 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                Fresh from the feed
              </h2>
            </div>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-5 space-y-5">
              {posts.map((post) => (
                <div key={post.id} className="break-inside-avoid">
                  <PostCard post={post} currentUserId={user?.id ?? null} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/60 border border-amber-100/80 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-stone-600 text-lg font-medium mb-1">
              {query ? `No results for "${query}"` : 'No meals shared yet'}
            </p>
            <p className="text-stone-500 text-sm mb-6">
              {query ? 'Try another search or category.' : 'Be the first to share something delicious.'}
            </p>
            {!query && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Share your first meal
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
