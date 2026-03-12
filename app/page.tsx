import { createClient } from '@/utils/supabase/server';
import PostCard from './components/PostCard';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const supabase = await createClient();

  // Fetch the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Initialize the Supabase query to fetch posts
  let supabaseQuery = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // 2. Filter by description if a search or category query exists
  if (query && query !== 'All') {
    supabaseQuery = supabaseQuery.ilike('description', `%${query}%`);
  }

  const { data: posts, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="w-full min-h-screen bg-white text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto flex items-center gap-4">
          <Link href="/" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            P
          </Link>

          <SearchBar defaultValue={query} />

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Profile Button - Shows user initial */}
                <Link
                  href="/profile"
                  className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 transition"
                  title="View Profile"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </Link>

                {/* Logout Form - Uses a Server Action/Route */}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-gray-500 hover:text-red-600 transition"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold transition"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Category Quick-Filters */}
      <CategoryFilter />

      <main className="max-w-[1800px] mx-auto p-4">
        {posts && posts.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-5 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg italic">
              No meals found matching "{query}" 🌶️
            </p>
          </div>
        )}
      </main>
    </div>
  );
}