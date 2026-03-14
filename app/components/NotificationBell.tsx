'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { markNotificationRead } from '@/app/actions/notificationActions';
import { Bell, BookOpen, MessageSquare, Inbox, Loader2, CheckCircle2, Heart } from 'lucide-react';

interface Notification {
  id: string;
  type: 'request' | 'comment' | 'recipe_added' | 'like';
  requesterName: string;
  requesterAvatar: string | null;
  postTitle: string;
  postId: string;
  createdAt: string;
  content?: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // --- 0. Fetch read notification IDs (so badge = unread count) ---
      const { data: readRows } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', userId);
      const readSet = new Set((readRows ?? []).map((r: { notification_id: string }) => r.notification_id));
      setReadIds(readSet);

      // --- 1. NOTIFICATIONS FOR ME (Requests, Comments, Likes on MY posts) ---

      const { data: myPosts, error: myPostsError } = await supabase
        .from('posts')
        .select('id, description')
        .eq('user_id', userId);

      if (myPostsError) throw myPostsError;

      let requests: any[] = [];
      let comments: any[] = [];
      let likeNotifs: any[] = [];

      if (myPosts && myPosts.length > 0) {
        const myPostIds = myPosts.map((p) => p.id);

        const [{ data: reqs }, { data: comms }, { data: likesData }] = await Promise.all([
          supabase
            .from('recipe_requests')
            .select(
              `created_at, post_id, user_id, profiles (email, avatar_url)`
            )
            .in('post_id', myPostIds)
            .neq('user_id', userId),
          supabase
            .from('comments')
            .select(
              `id, content, created_at, post_id, user_id, profiles (email, avatar_url)`
            )
            .in('post_id', myPostIds)
            .neq('user_id', userId),
          supabase
            .from('likes')
            .select(`created_at, post_id, user_id, profiles (email, avatar_url)`)
            .in('post_id', myPostIds)
            .neq('user_id', userId),
        ]);

        if (reqs) requests = reqs;
        if (comms) comments = comms;
        if (likesData) likeNotifs = likesData;
      }

      // --- 2. NOTIFICATIONS FROM OTHERS (Recipe added to posts I requested) ---

      const { data: myRequests, error: myReqError } = await supabase
        .from('recipe_requests')
        .select('post_id, created_at')
        .eq('user_id', userId);

      if (myReqError) throw myReqError;

      let recipeAddedNotifs: any[] = [];

      if (myRequests && myRequests.length > 0) {
        const requestedPostIds = myRequests.map((r) => r.post_id);
        const { data: fulfilledPosts } = await supabase
          .from('posts')
          .select(
            `id, description, has_recipe, created_at, updated_at, profiles!posts_user_id_fkey (email, avatar_url)`
          )
          .in('id', requestedPostIds)
          .eq('has_recipe', true);

        if (fulfilledPosts) recipeAddedNotifs = fulfilledPosts;
      }

      // --- 3. MERGE & TRANSFORM ---

      let allNotifs: Notification[] = [];

      allNotifs = allNotifs.concat(
        requests.map((req: any) => {
          const post = myPosts?.find((p) => p.id === req.post_id);
          return {
            id: `req_${req.user_id}_${req.post_id}`,
            type: 'request' as const,
            requesterName: req.profiles?.email?.split('@')[0] || 'Someone',
            requesterAvatar: req.profiles?.avatar_url,
            postTitle: post?.description || 'your meal',
            postId: req.post_id,
            createdAt: req.created_at,
          };
        })
      );

      allNotifs = allNotifs.concat(
        comments.map((comment: any) => {
          const post = myPosts?.find((p) => p.id === comment.post_id);
          return {
            id: `com_${comment.id}`,
            type: 'comment' as const,
            requesterName: comment.profiles?.email?.split('@')[0] || 'Someone',
            requesterAvatar: comment.profiles?.avatar_url,
            postTitle: post?.description || 'your meal',
            postId: comment.post_id,
            createdAt: comment.created_at,
            content: comment.content,
          };
        })
      );

      allNotifs = allNotifs.concat(
        likeNotifs.map((like: any) => {
          const post = myPosts?.find((p) => p.id === like.post_id);
          return {
            id: `like_${like.user_id}_${like.post_id}`,
            type: 'like' as const,
            requesterName: like.profiles?.email?.split('@')[0] || 'Someone',
            requesterAvatar: like.profiles?.avatar_url,
            postTitle: post?.description || 'your meal',
            postId: like.post_id,
            createdAt: like.created_at,
          };
        })
      );

      allNotifs = allNotifs.concat(
        recipeAddedNotifs.map((post: any) => ({
          id: `added_${post.id}`,
          type: 'recipe_added' as const,
          requesterName: post.profiles?.email?.split('@')[0] || 'Author',
          requesterAvatar: post.profiles?.avatar_url,
          postTitle: post.description,
          postId: post.id,
          createdAt: post.updated_at || post.created_at,
        }))
      );

      allNotifs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(allNotifs);
    } catch (error) {
      console.error('Unexpected error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleNotificationClick = async (notif: Notification) => {
    await markNotificationRead(notif.id);
    setReadIds((prev) => new Set(prev).add(notif.id));
    setIsOpen(false);
    // Owner gets "request" notifications → send to add-recipe form so they can fill the recipe
    // Once recipe is added, other notifications (comment, like, recipe_added) → post description page
    const path =
      notif.type === 'request'
        ? `/post/${notif.postId}/add-recipe`
        : `/post/${notif.postId}`;
    router.push(path);
  };

  return (
    <div className="relative group">
      <button
        className="relative p-2 text-slate-600 hover:text-red-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right transition-all"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 flex justify-center items-center text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-slate-400">
                <Inbox size={32} className="mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-medium">No new activity.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                    notif.type === 'recipe_added' ? 'bg-orange-50/50' : ''
                  } ${readIds.has(notif.id) ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1 text-slate-500">
                      {notif.type === 'request' && (
                        <BookOpen size={16} className="text-orange-500" />
                      )}
                      {notif.type === 'comment' && (
                        <MessageSquare size={16} className="text-blue-500" />
                      )}
                      {notif.type === 'recipe_added' && (
                        <CheckCircle2 size={16} className="text-green-600" />
                      )}
                      {notif.type === 'like' && (
                        <Heart size={16} className="text-red-500 fill-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900">
                          {notif.requesterName}
                        </span>
                        {notif.type === 'request' && (
                          <>
                            {' '}
                            requested the recipe for{' '}
                            <span className="italic text-slate-600">
                              &quot;{notif.postTitle.slice(0, 20)}...&quot;
                            </span>
                          </>
                        )}
                        {notif.type === 'comment' && (
                          <>
                            {' '}
                            commented on{' '}
                            <span className="italic text-slate-600">
                              &quot;{notif.postTitle.slice(0, 20)}...&quot;
                            </span>
                          </>
                        )}
                        {notif.type === 'like' && (
                          <>
                            {' '}
                            said Bon Appétit on{' '}
                            <span className="italic text-slate-600">
                              &quot;{notif.postTitle.slice(0, 20)}...&quot;
                            </span>
                          </>
                        )}
                        {notif.type === 'recipe_added' && (
                          <>
                            {' '}
                            added the recipe for{' '}
                            <span className="italic text-slate-600">
                              &quot;{notif.postTitle.slice(0, 20)}...&quot;
                            </span>
                          </>
                        )}
                      </p>

                      {notif.type === 'comment' && notif.content && (
                        <p className="text-slate-500 italic mt-1 truncate">
                          &quot;{notif.content}&quot;
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        {notif.type === 'request' && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded-full">
                            Request
                          </span>
                        )}
                        {notif.type === 'comment' && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded-full">
                            Comment
                          </span>
                        )}
                        {notif.type === 'like' && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 rounded-full">
                            Bon Appétit
                          </span>
                        )}
                        {notif.type === 'recipe_added' && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 rounded-full">
                            Ready!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
