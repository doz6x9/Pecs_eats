'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

function getSafeAuthErrorMessage(raw: string): string {
  const lower = (raw || '').toLowerCase()
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Invalid email or password.'
  if (lower.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (lower.includes('user already registered')) return 'An account with this email already exists.'
  if (lower.includes('password')) return 'Invalid email or password.'
  return 'Something went wrong. Please try again.'
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string) || ''
  const password = (formData.get('password') as string) || ''

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const safeMessage = getSafeAuthErrorMessage(error.message)
    return redirect(`/login?message=${encodeURIComponent(safeMessage)}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const email = (formData.get('email') as string) || ''
  const password = (formData.get('password') as string) || ''

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This helps Supabase redirect the user back after email confirmation
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    const safeMessage = getSafeAuthErrorMessage(error.message)
    return redirect(`/login?message=${encodeURIComponent(safeMessage)}`)
  }

  // If Supabase is set to "Confirm Email", the user isn't logged in yet.
  // We check if a session exists. If not, they must check their email.
  if (!data.session) {
    return redirect('/login?message=Check your email to confirm your account')
  }

  revalidatePath('/', 'layout')
  return redirect('/')
}