'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
  // ... (deletePost logic remains the same)
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  if (!content.trim()) {
    return { error: 'Comment cannot be empty.' };
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error('Error adding comment:', error);
    return { error: 'Failed to add comment.' };
  }

  revalidatePath(`/post/${postId}`);

  return { success: true };
}
