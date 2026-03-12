import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if a session exists
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Refresh the page data and redirect back to login
  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  });
}