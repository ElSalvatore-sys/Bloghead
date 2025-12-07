-- =============================================
-- BLOGHEAD DEMO SEED DATA
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- DEMO ARTIST PROFILES
-- =============================================

INSERT INTO artist_profiles (
  id, user_id, artist_name, genre, profession, bio, city, country, region,
  profile_image_url, cover_image_url, min_price, max_price, avg_rating,
  total_reviews, is_verified, is_newcomer, profile_completed
) VALUES
(
  gen_random_uuid(),
  gen_random_uuid(),
  'DJ MaxBeat',
  ARRAY['Electronic', 'House', 'Techno'],
  'DJ',
  'Professioneller DJ mit 10 Jahren Erfahrung. Spezialisiert auf Club-Events, Hochzeiten und Firmenveranstaltungen. Modernste Technik und unvergessliche Sets garantiert!',
  'Frankfurt',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1571266028243-3716f02d4c11?w=400',
  'https://images.unsplash.com/photo-1571266028243-3716f02d4c11?w=1200',
  500,
  2500,
  4.8,
  47,
  true,
  false,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Anna Melodie',
  ARRAY['Pop', 'Jazz', 'Soul'],
  'Sängerin',
  'Vielseitige Sängerin für jeden Anlass. Von romantischen Balladen bis zu Party-Hits - ich bringe die richtige Stimmung auf jedes Event!',
  'Wiesbaden',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200',
  600,
  1800,
  4.9,
  32,
  true,
  false,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'The Groove Band',
  ARRAY['Rock', 'Pop', 'Funk'],
  'Band',
  '5-köpfige Live-Band für Hochzeiten, Firmenfeiern und Festivals. Wir spielen von den 80ern bis heute - garantiert volle Tanzfläche!',
  'Mainz',
  'Deutschland',
  'Rheinland-Pfalz',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200',
  1200,
  4000,
  4.7,
  28,
  true,
  false,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Piano Paul',
  ARRAY['Classical', 'Jazz', 'Lounge'],
  'Pianist',
  'Elegante Klaviermusik für gehobene Anlässe. Perfekt für Empfänge, Dinner-Events und romantische Feiern.',
  'Darmstadt',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200',
  400,
  1200,
  5.0,
  15,
  false,
  true,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'MC Thunder',
  ARRAY['Hip-Hop', 'R&B', 'Urban'],
  'MC / Rapper',
  'Energiegeladene Performances für Club-Nights und Urban Events. Bring den Beat!',
  'Offenbach',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=400',
  'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1200',
  350,
  1500,
  4.6,
  22,
  false,
  false,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Strings Quartet',
  ARRAY['Classical', 'Film Music', 'Pop Covers'],
  'Ensemble',
  'Professionelles Streichquartett für Hochzeiten, Galas und besondere Anlässe. Klassik trifft Moderne.',
  'Frankfurt',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200',
  800,
  2500,
  4.9,
  19,
  true,
  false,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Saxophon Sarah',
  ARRAY['Jazz', 'Soul', 'Lounge'],
  'Saxophonistin',
  'Stimmungsvolle Saxophon-Klänge für Ihr Event. Perfekt für Cocktailempfänge und elegante Feiern.',
  'Bad Homburg',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200',
  450,
  1100,
  4.8,
  11,
  false,
  true,
  true
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Acoustic Duo',
  ARRAY['Acoustic', 'Folk', 'Pop'],
  'Duo',
  'Akustik-Duo für intime Veranstaltungen. Gitarre und Gesang in perfekter Harmonie.',
  'Hanau',
  'Deutschland',
  'Hessen',
  'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200',
  300,
  900,
  4.5,
  8,
  false,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- DEMO SERVICE PROVIDERS
-- =============================================

-- First ensure service_categories exist
INSERT INTO service_categories (id, name, name_de, icon) VALUES
  (gen_random_uuid(), 'Caterer', 'Caterer', 'utensils'),
  (gen_random_uuid(), 'Photographer', 'Fotograf', 'camera'),
  (gen_random_uuid(), 'Florist', 'Florist', 'flower'),
  (gen_random_uuid(), 'Sound', 'Ton & Licht', 'speaker'),
  (gen_random_uuid(), 'Security', 'Security', 'shield'),
  (gen_random_uuid(), 'Videographer', 'Videograf', 'video'),
  (gen_random_uuid(), 'Decorator', 'Dekorateur', 'palette'),
  (gen_random_uuid(), 'Hairdresser', 'Friseur & Make-up', 'scissors'),
  (gen_random_uuid(), 'Venue', 'Location', 'building'),
  (gen_random_uuid(), 'Transportation', 'Transport', 'car'),
  (gen_random_uuid(), 'Entertainment', 'Unterhaltung', 'star')
ON CONFLICT DO NOTHING;

INSERT INTO service_provider_profiles (
  id, user_id, business_name, category_id, description, city, country,
  profile_image_url, min_price, max_price, avg_rating, total_reviews,
  is_verified, is_newcomer, profile_completed
)
SELECT
  gen_random_uuid(),
  gen_random_uuid(),
  provider.name,
  sc.id,
  provider.description,
  provider.city,
  'Deutschland',
  provider.image,
  provider.min_price,
  provider.max_price,
  provider.rating,
  provider.reviews,
  provider.verified,
  provider.newcomer,
  true
FROM (VALUES
  ('Catering Deluxe', 'Caterer', 'Premium Catering für Events aller Größen. Von der kleinen Feier bis zur Großveranstaltung.', 'Frankfurt', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', 500, 10000, 4.9, 56, true, false),
  ('Foto Moment', 'Photographer', 'Professionelle Event-Fotografie. Hochzeiten, Firmenevents, Portraits.', 'Wiesbaden', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400', 300, 2500, 4.8, 89, true, false),
  ('Blumen Paradies', 'Florist', 'Kreative Blumenarrangements und Eventdekoration.', 'Mainz', 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400', 200, 3000, 4.7, 34, false, false),
  ('Sound & Light Pro', 'Sound', 'Professionelle Ton- und Lichttechnik für Events.', 'Frankfurt', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 400, 5000, 4.6, 27, true, false),
  ('Security First', 'Security', 'Professioneller Sicherheitsdienst für Veranstaltungen.', 'Offenbach', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400', 300, 3000, 4.5, 18, true, false),
  ('VideoArt', 'Videographer', 'Hochwertige Eventvideos und Aftermovies.', 'Darmstadt', 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400', 500, 4000, 4.9, 42, false, true),
  ('Deko Dreams', 'Decorator', 'Traumhafte Dekorationen für jeden Anlass.', 'Bad Homburg', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', 250, 2000, 4.8, 23, false, false),
  ('Style Studio', 'Hairdresser', 'Mobile Friseur- und Make-up Services für Events.', 'Wiesbaden', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 150, 800, 4.7, 31, false, true)
) AS provider(name, category, description, city, image, min_price, max_price, rating, reviews, verified, newcomer)
JOIN service_categories sc ON sc.name = provider.category
ON CONFLICT DO NOTHING;

-- =============================================
-- DEMO EVENTS (for Events page)
-- =============================================

INSERT INTO events (
  id, organizer_id, title, description, event_type, event_date, start_time, end_time,
  venue_name, city, country, expected_guests, budget_min, budget_max,
  status, is_public, cover_image_url
) VALUES
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Summer Music Festival 2025',
  'Das größte Open-Air Festival der Region! 3 Bühnen, 20+ Artists, Food & Drinks.',
  'festival',
  '2025-07-15',
  '14:00',
  '23:00',
  'Kulturpark',
  'Wiesbaden',
  'Deutschland',
  5000,
  50000,
  100000,
  'published',
  true,
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Corporate Gala Night',
  'Elegante Firmengala mit Live-Musik, Dinner und Networking.',
  'corporate',
  '2025-03-22',
  '18:00',
  '01:00',
  'Kurhaus Wiesbaden',
  'Wiesbaden',
  'Deutschland',
  300,
  15000,
  25000,
  'published',
  true,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Techno Underground',
  'Die beste Underground Techno Party der Stadt. Nur für echte Liebhaber.',
  'party',
  '2025-02-28',
  '23:00',
  '06:00',
  'Club Pulse',
  'Frankfurt',
  'Deutschland',
  500,
  5000,
  10000,
  'published',
  true,
  'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1200'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Jazz im Park',
  'Entspannte Jazz-Klänge unter freiem Himmel. Picknick & Wein willkommen!',
  'concert',
  '2025-06-08',
  '17:00',
  '22:00',
  'Nerotal Park',
  'Wiesbaden',
  'Deutschland',
  200,
  3000,
  6000,
  'published',
  true,
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Hochzeitsmesse Rhein-Main',
  'Die große Hochzeitsmesse mit über 50 Ausstellern. Finde alles für deinen großen Tag!',
  'exhibition',
  '2025-04-12',
  '10:00',
  '18:00',
  'Messehalle',
  'Mainz',
  'Deutschland',
  1000,
  20000,
  35000,
  'published',
  true,
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'
)
ON CONFLICT DO NOTHING;

SELECT 'Seed data inserted successfully!' as status;
