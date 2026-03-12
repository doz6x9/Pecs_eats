import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PostCard from '../components/PostCard';

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. If no user is logged in, send them to login
  if (!user) {
    redirect('/login');
  }

  // 3. Fetch only posts belonging to THIS user
  const { data: myPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="w-full min-h-screen bg-white text-black">
      {/* Back to Feed Button */}
      <div className="p-4 max-w-[1200px] mx-auto">
        <a href="/" className="text-gray-500 hover:text-black font-semibold flex items-center gap-2 mb-8">
          ← Back to Feed
        </a>

        {/* User Stats Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700 mb-4 shadow-sm border border-gray-100">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{user.email?.split('@')[0]}</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          <div className="flex gap-4 mt-6">
            <div className="text-center">
              <span className="block font-bold text-lg">{myPosts?.length || 0}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Posts</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-10" />

        {/* User's Masonry Grid */}
        <h2 className="text-xl font-bold mb-6 px-2 text-center md:text-left">My Creations</h2>
        {myPosts && myPosts.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-2">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 italic">You haven't shared any meals yet! 🥘</p>
            <a href="/upload" className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm">
              Upload your first meal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}