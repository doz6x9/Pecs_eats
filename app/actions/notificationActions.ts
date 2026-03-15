'use server';

import { createClient } from '@/utils/supabase/server';

export async function markNotificationRead(notificationId: string) {
  if (typeof notificationId !== 'string' || notificationId.length > 200 || !/^[a-zA-Z0-9_-]+$/.test(notificationId)) {
    return { error: 'Invalid notification.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated.' };
  }

  const { error } = await supabase.from('notification_reads').upsert(
    [
      {
        user_id: user.id,
        notification_id: notificationId,
        read_at: new Date().toISOString(),
      },
    ],
    {
      onConflict: 'user_id,notification_id',
    }
  );

  if (error) {
    console.error('Error marking notification read:', error);
    return { error: 'Failed to mark as read.' };
  }

  return { success: true };
}
