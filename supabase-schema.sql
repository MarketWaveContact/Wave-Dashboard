-- ================================================
-- Wave Dashboard — Supabase Schema
-- Coller dans : Supabase Dashboard > SQL Editor
-- ================================================

-- 1. PROFILES (liée à auth.users)
CREATE TABLE public.profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name      TEXT NOT NULL DEFAULT 'Client',
  email     TEXT NOT NULL DEFAULT '',
  is_admin  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture profil personnel"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin lecture tous les profils"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY "Admin modification profils"
  ON public.profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));


-- 2. STATS ACTUELLES (1 ligne par client)
CREATE TABLE public.client_stats (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tiktok_views        BIGINT  DEFAULT 0,
  instagram_views     BIGINT  DEFAULT 0,
  followers_gained    INTEGER DEFAULT 0,
  google_maps_clicks  INTEGER DEFAULT 0,
  uber_eats_orders    INTEGER DEFAULT 0,
  estimated_clients   INTEGER DEFAULT 0,
  new_clients_month   INTEGER DEFAULT 0,
  custom_message      TEXT    DEFAULT '',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture stats personnelles"
  ON public.client_stats FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admin toutes ops sur stats"
  ON public.client_stats FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));


-- 3. STATS MENSUELLES (pour le graphique)
CREATE TABLE public.monthly_stats (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month_label         TEXT    NOT NULL, -- ex: "Jan", "Fév", "Mar"
  month_order         INTEGER NOT NULL, -- ex: 1, 2, 3 (pour le tri)
  tiktok_views        BIGINT  DEFAULT 0,
  instagram_views     BIGINT  DEFAULT 0,
  followers_gained    INTEGER DEFAULT 0,
  google_maps_clicks  INTEGER DEFAULT 0,
  estimated_clients   INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.monthly_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture stats mensuelles personnelles"
  ON public.monthly_stats FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admin toutes ops sur stats mensuelles"
  ON public.monthly_stats FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));


-- 4. TRIGGER : auto-création du profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Client'),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
