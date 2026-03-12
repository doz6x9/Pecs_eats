# OnlyFoods 🥗

OnlyFoods is a modern, social food-sharing platform built for students in Pécs (and beyond!). It allows users to share their culinary creations, discover local eats, request recipes from friends, and engage with a vibrant foodie community.

![OnlyFoods Preview](https://via.placeholder.com/1200x600?text=OnlyFoods+Preview+Image)

## ✨ Features

-   **📸 Share Meals**: Upload photos of your meals with descriptions and categories.
-   **📖 Request & Share Recipes**: See a meal you love? Request the recipe! Authors get notified and can fulfill requests.
-   **💬 Interactive Feed**: Comment on posts directly from the feed and see what others are saying.
-   **🔔 Real-time-ish Notifications**: Get notified when someone requests your recipe or comments on your post.
-   **👤 Customizable Profiles**: Personalize your profile with an avatar and a cover image.
-   **🛡️ Admin Moderation**: Role-based access control allows admins to moderate content.
-   **🎨 Modern UI**: Built with Tailwind CSS, Framer Motion, and Lucide Icons for a sleek, animated experience.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Storage**: Supabase Storage

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   A Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/onlyfoods.git
cd onlyfoods
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Supabase)

Run the following SQL queries in your Supabase SQL Editor to set up the tables and security policies.

**Tables & Columns:**

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  avatar_url text,
  cover_url text,
  role text default 'user'
);

-- Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  description text,
  category text,
  has_recipe boolean default false,
  recipe_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Recipe Requests
create table public.recipe_requests (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
```

**Storage Buckets:**

Create two public buckets: `meal-photos` and `avatars`.

**Security Policies (RLS):**

*Note: You should enable RLS on all tables and create policies. The following are simplified examples.*

```sql
-- Example: Allow public read access
create policy "Public read" on public.posts for select using (true);
create policy "Public read" on public.comments for select using (true);
create policy "Public read" on public.profiles for select using (true);

-- Example: Allow authenticated insert
create policy "User insert" on public.posts for insert to authenticated with check (auth.uid() = user_id);
```

*(Refer to the project development history for the complete, robust SQL script including Admin permissions)*

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ Admin Access

To become an admin:
1. Sign up/Log in to the app.
2. Go to your Supabase Table Editor -> `profiles` table.
3. Change your user's `role` column from `user` to `admin`.
4. Refresh the app to see the Admin Dashboard link in the header.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
