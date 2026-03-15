'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isValidUuid } from '@/lib/validation';

export async function toggleLike(postId: string) {
  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to like a post.' };
  }

  const { data: existing } = await supabase
    .from('likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error unliking:', error);
      return { error: 'Failed to unlike.' };
    }
    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    revalidatePath(`/profile/${user.id}`);
    return { success: true, liked: false };
  }

  const { error } = await supabase.from('likes').insert({
    post_id: postId,
    user_id: user.id,
  });

  if (error) {
    console.error('Error liking:', error);
    return { error: 'Failed to like.' };
  }

  revalidatePath('/');
  revalidatePath(`/post/${postId}`);
  revalidatePath(`/profile/${user.id}`);
  return { success: true, liked: true };
}
