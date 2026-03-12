import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-white">P</div>
              <span className="font-bold text-lg text-slate-800">Pécs Eats</span>
            </Link>
          </div>

          {/* Main Navigation & User Actions */}
          <div className="flex items-center gap-4">
            <Link href="/upload" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors">
              Share a Meal
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${user.id}`}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 transition"
                  title="View Profile"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
