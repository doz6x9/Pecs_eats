import { createClient } from '@/utils/supabase/server';
import PostCard from '@/app/components/PostCard';
import Link from 'next/link';

type ProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (id, email),
      recipe_requests (user_id),
      comments (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (profileError || !profile) {
    // ... (error handling)
  }

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  const posts = postsData?.map(post => ({
    ...post,
    user_has_requested: currentUser ? post.recipe_requests.some(req => req.user_id === currentUser.id) : false,
    recipe_requests: [{ count: post.recipe_requests.length }],
    commentCount: post.comments[0]?.count ?? 0,
  })) || [];

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div>
      <div className="flex flex-col items-center mb-12">
        {/* ... (profile info) */}
      </div>

      <hr className="border-slate-200 mb-8" />

      {posts.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard
                post={post}
                currentUserId={currentUser?.id ?? null}
                showDeleteButton={isOwnProfile}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 italic py-20">
          This user hasn't shared any meals yet. 🍽️
        </p>
      )}
    </div>
  );
}
