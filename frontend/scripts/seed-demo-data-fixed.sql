-- =============================================
-- BLOGHEAD DEMO SEED DATA (FIXED)
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- DEMO ARTIST PROFILES
-- user_id is nullable, so we can create demo artists without users
-- =============================================

INSERT INTO artist_profiles (
  id, user_id, kuenstlername, jobbezeichnung, genre, bio, stadt, land, region,
  preis_minimum, preis_pro_veranstaltung, star_rating, total_ratings,
  is_bookable, total_bookings, total_followers
) VALUES
(
  gen_random_uuid(),
  NULL,
  'DJ MaxBeat',
  'DJ',
  ARRAY['Electronic', 'House', 'Techno'],
  'Professioneller DJ mit 10 Jahren Erfahrung. Spezialisiert auf Club-Events, Hochzeiten und Firmenveranstaltungen. Modernste Technik und unvergessliche Sets garantiert!',
  'Frankfurt',
  'Deutschland',
  'Hessen',
  500,
  2500,
  4.8,
  47,
  true,
  89,
  1250
),
(
  gen_random_uuid(),
  NULL,
  'Anna Melodie',
  'Sängerin',
  ARRAY['Pop', 'Jazz', 'Soul'],
  'Vielseitige Sängerin für jeden Anlass. Von romantischen Balladen bis zu Party-Hits - ich bringe die richtige Stimmung auf jedes Event!',
  'Wiesbaden',
  'Deutschland',
  'Hessen',
  600,
  1800,
  4.9,
  32,
  true,
  56,
  890
),
(
  gen_random_uuid(),
  NULL,
  'The Groove Band',
  'Band',
  ARRAY['Rock', 'Pop', 'Funk'],
  '5-köpfige Live-Band für Hochzeiten, Firmenfeiern und Festivals. Wir spielen von den 80ern bis heute - garantiert volle Tanzfläche!',
  'Mainz',
  'Deutschland',
  'Rheinland-Pfalz',
  1200,
  4000,
  4.7,
  28,
  true,
  42,
  650
),
(
  gen_random_uuid(),
  NULL,
  'Piano Paul',
  'Pianist',
  ARRAY['Classical', 'Jazz', 'Lounge'],
  'Elegante Klaviermusik für gehobene Anlässe. Perfekt für Empfänge, Dinner-Events und romantische Feiern.',
  'Darmstadt',
  'Deutschland',
  'Hessen',
  400,
  1200,
  5.0,
  15,
  true,
  23,
  340
),
(
  gen_random_uuid(),
  NULL,
  'MC Thunder',
  'MC / Rapper',
  ARRAY['Hip-Hop', 'R&B', 'Urban'],
  'Energiegeladene Performances für Club-Nights und Urban Events. Bring den Beat!',
  'Offenbach',
  'Deutschland',
  'Hessen',
  350,
  1500,
  4.6,
  22,
  true,
  38,
  520
),
(
  gen_random_uuid(),
  NULL,
  'Strings Quartet',
  'Ensemble',
  ARRAY['Classical', 'Film Music', 'Pop Covers'],
  'Professionelles Streichquartett für Hochzeiten, Galas und besondere Anlässe. Klassik trifft Moderne.',
  'Frankfurt',
  'Deutschland',
  'Hessen',
  800,
  2500,
  4.9,
  19,
  true,
  31,
  280
),
(
  gen_random_uuid(),
  NULL,
  'Saxophon Sarah',
  'Saxophonistin',
  ARRAY['Jazz', 'Soul', 'Lounge'],
  'Stimmungsvolle Saxophon-Klänge für Ihr Event. Perfekt für Cocktailempfänge und elegante Feiern.',
  'Bad Homburg',
  'Deutschland',
  'Hessen',
  450,
  1100,
  4.8,
  11,
  true,
  18,
  195
),
(
  gen_random_uuid(),
  NULL,
  'Acoustic Duo',
  'Duo',
  ARRAY['Acoustic', 'Folk', 'Pop'],
  'Akustik-Duo für intime Veranstaltungen. Gitarre und Gesang in perfekter Harmonie.',
  'Hanau',
  'Deutschland',
  'Hessen',
  300,
  900,
  4.5,
  8,
  true,
  12,
  145
)
ON CONFLICT DO NOTHING;

-- =============================================
-- ENSURE SERVICE CATEGORIES EXIST
-- (These may already exist from migrations)
-- =============================================

INSERT INTO service_categories (name, name_de, slug, icon, display_order, is_active) VALUES
  ('Caterer', 'Caterer', 'caterer', 'utensils', 3, true),
  ('Photographer', 'Fotograf', 'photographer', 'camera', 6, true),
  ('Florist', 'Florist', 'florist', 'flower', 5, true),
  ('Sound', 'Ton & Licht', 'sound', 'speaker', 13, true),
  ('Security', 'Security', 'security', 'shield', 11, true),
  ('Videographer', 'Videograf', 'videographer', 'video', 7, true),
  ('Decorator', 'Dekorateur', 'decorator', 'palette', 8, true),
  ('Hairdresser', 'Friseur & Make-up', 'hairdresser', 'scissors', 9, true),
  ('Venue', 'Location', 'venue', 'building', 4, true),
  ('Transportation', 'Transport', 'transportation', 'car', 14, true),
  ('Entertainment', 'Entertainment', 'entertainment', 'star', 15, true),
  ('Musician', 'Musiker', 'musician', 'music', 1, true),
  ('DJ', 'DJ', 'dj', 'disc', 2, true),
  ('Makeup Artist', 'Visagist', 'makeup-artist', 'sparkles', 10, true),
  ('Lighting', 'Lichttechnik', 'lighting', 'lightbulb', 12, true)
ON CONFLICT (name) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- =============================================
-- NOTE ON SERVICE PROVIDERS & EVENTS
-- =============================================
-- service_provider_profiles.user_id is NOT NULL
-- events.organizer_id is NOT NULL
--
-- These tables require real authenticated users.
-- Demo service providers and events should be created:
-- 1. Via the registration flow in the app
-- 2. Or by first creating users in Supabase Auth Dashboard
--
-- For the frontend to show demo data, we use mock data
-- in the React components as fallback when no real data exists.
-- =============================================

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'Artist Profiles:' as table_name, COUNT(*) as count FROM artist_profiles
UNION ALL
SELECT 'Service Categories:', COUNT(*) FROM service_categories;

SELECT 'Demo seed data inserted successfully!' as status;
