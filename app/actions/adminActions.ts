'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isValidUuid } from '@/lib/validation';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function adminDeletePost(postId: string) {
  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Get image URL first to delete from storage
  const { data: post } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', postId)
    .single();

  if (post?.image_url) {
    const urlParts = post.image_url.split('/meal-photos/');
    if (urlParts.length > 1) {
      await supabase.storage.from('meal-photos').remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('Admin delete post error:', error);
    return { error: 'Failed to delete post.' };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteComment(commentId: string) {
  if (!commentId || !isValidUuid(commentId)) {
    return { error: 'Invalid comment.' };
  }

  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) {
    console.error('Admin delete comment error:', error);
    return { error: 'Failed to delete comment.' };
  }

  revalidatePath('/admin');
  return { success: true };
}
