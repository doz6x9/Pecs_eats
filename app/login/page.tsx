'use client';

import { login, signup } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Salad, ArrowRight, ChefHat, Flame, Users, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup view
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  const features = [
    { icon: ChefHat, title: "Share Your Creations", text: "Show off your culinary skills." },
    { icon: Flame, title: "Discover Hot Spots", text: "Find the best eats in town." },
    { icon: Users, title: "Foodie Community", text: "Connect with local food lovers." },
  ];

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Image & Branding (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-40 scale-105 animate-[kenburns_30s_infinite_alternate]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/80 to-transparent z-10" />

        <div className="relative z-20 text-white p-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30 ring-1 ring-white/20">
                <Salad size={32} className="text-white" />
              </div>
              <span className="text-4xl font-black tracking-tight">OnlyFoods</span>
            </div>

            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight text-white">
              Connect over <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">great food.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed font-medium max-w-md">
              Join the most vibrant food community in Pécs. Share recipes, find inspiration, and connect with fellow foodies.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-center gap-5 group"
                >
                  <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                    <feature.icon size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                    <p className="text-sm text-slate-400 font-medium">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 bg-slate-50 lg:bg-white relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
           <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
              <Salad size={20} className="text-white" />
           </div>
           <span className="text-2xl font-black tracking-tight text-slate-900">OnlyFoods</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Enter your details to access your account.' : 'Join the community and start sharing.'}
            </p>
          </div>

          {/* Error Message Display */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium text-center"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-base font-medium shadow-sm hover:border-slate-200"
                  name="email"
                  placeholder="you@pte.hu"
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Forgot password?</a>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-base font-medium shadow-sm hover:border-slate-200"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              {isLogin ? (
                <button
                  formAction={login}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-base"
                >
                  <span>Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  formAction={signup}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-base"
                >
                  <span>Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          {/* Social Social Logins (Visual Only for now) */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Or continue with</p>
            <div className="flex gap-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl transition-all active:scale-95">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.58-.76 1.48.01 2.65.68 3.39 1.8-3.05 1.77-2.48 5.61.35 6.77-.73 1.83-1.63 3.53-2.4 4.36zM12.03 7.25c-.15-3.13 2.5-5.69 5.35-5.83.25 3.23-2.73 5.9-5.35 5.83z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs font-medium text-slate-400">
            By continuing, you agree to our <a href="#" className="text-slate-600 hover:underline decoration-slate-300">Terms of Service</a> and <a href="#" className="text-slate-600 hover:underline decoration-slate-300">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
