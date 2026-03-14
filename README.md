# OnlyFoods 🥗

OnlyFoods is a modern, social food-sharing platform built for students in Pécs (and beyond!). It allows users to share their culinary creations, discover local eats, request recipes from friends, and engage with a vibrant foodie community.

![OnlyFoods Preview](https://via.placeholder.com/1200x600?text=OnlyFoods+Preview+Image)

## ✨ Features

-   **📸 Share Meals**: Upload photos of your meals with descriptions and categories using an interactive drag-and-drop UI.
-   **📖 Request & Share Recipes**: See a meal you love? Request the recipe! Authors get notified and can easily add the recipe text later to fulfill requests.
-   **💬 Interactive Feed**: Comment on posts directly from the home page feed with inline comment boxes, and see full discussions on the post detail page.
-   **🔔 Comprehensive Notifications**: Get alerted when someone requests your recipe, comments on your post, or when a recipe you requested is added, with direct links to the action.
-   **👤 Customizable Profiles**: Personalize your profile with an avatar, a custom cover image, and view your stats.
-   **🛡️ Admin Moderation**: Role-based access control allows designated admins to view a dashboard and securely delete inappropriate posts or comments.
-   **🎨 Modern, Animated UI**: Built with Tailwind CSS v4, featuring a fresh Emerald & Slate color palette, masonry grid layouts, Framer Motion animations (springs, hovers, staggers), and Lucide Icons for a sleek, premium feel.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & @supabase/ssr)
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

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Supabase SQL)

Run the following complete SQL query in your Supabase SQL Editor to set up the tables, buckets, and security policies (RLS).

```sql
-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  avatar_url text,
  cover_url text,
  role text default 'user'
);

-- Profiles Policies
alter table public.profiles enable row level security;
create policy "Public can view all profiles" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);


-- 2. POSTS TABLE
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

-- Posts Policies
alter table public.posts enable row level security;
create policy "Public can view all posts" on public.posts for select using (true);
create policy "Users can insert their own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete to authenticated using (auth.uid() = user_id);

-- Auto-update updated_at for Posts
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_posts_updated_at
before update on public.posts
for each row execute procedure update_updated_at_column();


-- 3. COMMENTS TABLE
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Comments Policies
alter table public.comments enable row level security;
create policy "Public can view all comments" on public.comments for select using (true);
create policy "Users can insert their own comments" on public.comments for insert to authenticated with check (auth.uid() = user_id);


-- 4. RECIPE REQUESTS TABLE
create table public.recipe_requests (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Recipe Requests Policies
alter table public.recipe_requests enable row level security;
create policy "Users can view all recipe requests" on public.recipe_requests for select using (true);
create policy "Users can insert their own recipe requests" on public.recipe_requests for insert to authenticated with check (auth.uid() = user_id);


-- 5. ADMIN MODERATION POLICIES (Overrides)
create policy "Admins can delete any post" on public.posts for delete to authenticated using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can delete any comment" on public.comments for delete to authenticated using ((select role from public.profiles where id = auth.uid()) = 'admin');


-- 6. STORAGE BUCKETS (Meal Photos & Avatars)
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do update set public = true;

-- Storage Policies
create policy "Public can view meal-photos" on storage.objects for select using (bucket_id = 'meal-photos');
create policy "Authenticated users can upload meal-photos" on storage.objects for insert to authenticated with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users can delete meal-photos" on storage.objects for delete to authenticated using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users can update avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ Admin Access

To access the moderation dashboard:
1. Sign up or log in to the app normally.
2. Go to your Supabase Dashboard -> Table Editor -> `profiles` table.
3. Find your user row and change the `role` column from `user` to `admin`.
4. Refresh the app. An "Admin" link will appear in the header, giving you access to view the dashboard and delete any post or comment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
