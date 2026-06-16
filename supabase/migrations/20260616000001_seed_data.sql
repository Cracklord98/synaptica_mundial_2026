-- ==========================================
-- LA POLLA MUNDIAL 2026 - SEED DATA
-- ==========================================

-- 1. Insert 32 Teams (using strictly valid hexadecimal UUIDs)
INSERT INTO public.teams (id, name, flag_url, group_name, position_in_group, is_qualified) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Estados Unidos', 'https://flagcdn.com/us.svg', 'A', 1, TRUE),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'México', 'https://flagcdn.com/mx.svg', 'A', 2, TRUE),
('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Canadá', 'https://flagcdn.com/ca.svg', 'B', 1, TRUE),
('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'Argentina', 'https://flagcdn.com/ar.svg', 'B', 2, TRUE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Brasil', 'https://flagcdn.com/br.svg', 'C', 1, TRUE),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Colombia', 'https://flagcdn.com/co.svg', 'C', 2, TRUE),
('b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', 'Uruguay', 'https://flagcdn.com/uy.svg', 'D', 1, TRUE),
('b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', 'Ecuador', 'https://flagcdn.com/ec.svg', 'D', 2, TRUE),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Francia', 'https://flagcdn.com/fr.svg', 'E', 1, TRUE),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'España', 'https://flagcdn.com/es.svg', 'E', 2, TRUE),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Alemania', 'https://flagcdn.com/de.svg', 'F', 1, TRUE),
('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'Inglaterra', 'https://flagcdn.com/gb.svg', 'F', 2, TRUE),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Portugal', 'https://flagcdn.com/pt.svg', 'G', 1, TRUE),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'Países Bajos', 'https://flagcdn.com/nl.svg', 'G', 2, TRUE),
('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', 'Italia', 'https://flagcdn.com/it.svg', 'H', 1, TRUE),
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'Bélgica', 'https://flagcdn.com/be.svg', 'H', 2, TRUE),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Croacia', 'https://flagcdn.com/hr.svg', 'I', 1, TRUE),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'Marruecos', 'https://flagcdn.com/ma.svg', 'I', 2, TRUE),
('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'Senegal', 'https://flagcdn.com/sn.svg', 'J', 1, TRUE),
('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'Japón', 'https://flagcdn.com/jp.svg', 'J', 2, TRUE),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'Corea del Sur', 'https://flagcdn.com/kr.svg', 'K', 1, TRUE),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Australia', 'https://flagcdn.com/au.svg', 'K', 2, TRUE),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'Dinamarca', 'https://flagcdn.com/dk.svg', 'L', 1, TRUE),
('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Suiza', 'https://flagcdn.com/ch.svg', 'L', 2, TRUE),
('19191919-1919-1919-1919-191919191919', 'Austria', 'https://flagcdn.com/at.svg', 'A', 3, TRUE),
('29292929-2929-2929-2929-292929292929', 'Polonia', 'https://flagcdn.com/pl.svg', 'B', 3, TRUE),
('39393939-3939-3939-3939-393939393939', 'Turquía', 'https://flagcdn.com/tr.svg', 'C', 3, TRUE),
('49494949-4949-4949-4949-494949494949', 'Ucrania', 'https://flagcdn.com/ua.svg', 'D', 3, TRUE),
('18181818-1818-1818-1818-181818181818', 'Gales', 'https://flagcdn.com/gb-wls.svg', 'E', 3, TRUE),
('28282828-2828-2828-2828-282828282828', 'Suecia', 'https://flagcdn.com/se.svg', 'F', 3, TRUE),
('38383838-3838-3838-3838-383838383838', 'Noruega', 'https://flagcdn.com/no.svg', 'G', 3, TRUE),
('48484848-4848-4848-4848-484848484848', 'Chile', 'https://flagcdn.com/cl.svg', 'H', 3, TRUE)
ON CONFLICT (name) DO NOTHING;

-- 2. Pre-create the Gran Final and Third Place Match (using strictly valid hexadecimal UUIDs)
INSERT INTO public.matches (id, round, match_datetime, deadline) VALUES
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'final', '2026-07-19T18:00:00Z', '2026-07-19T17:00:00Z'),
('33333333-3333-3333-3333-333333333333', 'third_place', '2026-07-18T18:00:00Z', '2026-07-18T17:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 3. Pre-create Semifinal Matches (linking to Final)
INSERT INTO public.matches (id, round, next_match_id, match_datetime, deadline) VALUES
('04040404-0404-0404-0404-040404040401', 'semi', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '2026-07-14T20:00:00Z', '2026-07-14T19:00:00Z'),
('04040404-0404-0404-0404-040404040402', 'semi', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '2026-07-15T20:00:00Z', '2026-07-15T19:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. Pre-create Quarterfinal Matches (linking to Semis)
INSERT INTO public.matches (id, round, next_match_id, match_datetime, deadline) VALUES
('08080808-0808-0808-0808-080808080801', 'quarter', '04040404-0404-0404-0404-040404040401', '2026-07-09T18:00:00Z', '2026-07-09T17:00:00Z'),
('08080808-0808-0808-0808-080808080802', 'quarter', '04040404-0404-0404-0404-040404040401', '2026-07-10T18:00:00Z', '2026-07-10T17:00:00Z'),
('08080808-0808-0808-0808-080808080803', 'quarter', '04040404-0404-0404-0404-040404040402', '2026-07-10T21:00:00Z', '2026-07-10T20:00:00Z'),
('08080808-0808-0808-0808-080808080804', 'quarter', '04040404-0404-0404-0404-040404040402', '2026-07-11T18:00:00Z', '2026-07-11T17:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Pre-create Round of 16 Matches (linking to Quarters)
INSERT INTO public.matches (id, round, next_match_id, match_datetime, deadline) VALUES
('16161616-1616-1616-1616-161616161601', 'round_16', '08080808-0808-0808-0808-080808080801', '2026-07-04T17:00:00Z', '2026-07-04T16:00:00Z'),
('16161616-1616-1616-1616-161616161602', 'round_16', '08080808-0808-0808-0808-080808080801', '2026-07-04T21:00:00Z', '2026-07-04T20:00:00Z'),
('16161616-1616-1616-1616-161616161603', 'round_16', '08080808-0808-0808-0808-080808080802', '2026-07-05T17:00:00Z', '2026-07-05T16:00:00Z'),
('16161616-1616-1616-1616-161616161604', 'round_16', '08080808-0808-0808-0808-080808080802', '2026-07-05T21:00:00Z', '2026-07-05T20:00:00Z'),
('16161616-1616-1616-1616-161616161605', 'round_16', '08080808-0808-0808-0808-080808080803', '2026-07-06T17:00:00Z', '2026-07-06T16:00:00Z'),
('16161616-1616-1616-1616-161616161606', 'round_16', '08080808-0808-0808-0808-080808080803', '2026-07-06T21:00:00Z', '2026-07-06T20:00:00Z'),
('16161616-1616-1616-1616-161616161607', 'round_16', '08080808-0808-0808-0808-080808080804', '2026-07-07T17:00:00Z', '2026-07-07T16:00:00Z'),
('16161616-1616-1616-1616-161616161608', 'round_16', '08080808-0808-0808-0808-080808080804', '2026-07-07T21:00:00Z', '2026-07-07T20:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 6. Pre-create and seed Round of 32 Matches (linking to Round of 16 and seeding qualified teams)
INSERT INTO public.matches (id, round, team1_id, team2_id, next_match_id, match_datetime, deadline) VALUES
-- Bracket Half 1
('32323232-3232-3232-3232-323232323201', 'round_32', 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', '19191919-1919-1919-1919-191919191919', '16161616-1616-1616-1616-161616161601', '2026-06-28T16:00:00Z', '2026-06-28T15:00:00Z'), -- Argentina vs Austria
('32323232-3232-3232-3232-323232323202', 'round_32', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '29292929-2929-2929-2929-292929292929', '16161616-1616-1616-1616-161616161601', '2026-06-28T20:00:00Z', '2026-06-28T19:00:00Z'), -- USA vs Polonia
('32323232-3232-3232-3232-323232323203', 'round_32', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '39393939-3939-3939-3939-393939393939', '16161616-1616-1616-1616-161616161602', '2026-06-29T16:00:00Z', '2026-06-29T15:00:00Z'), -- Francia vs Turquía
('32323232-3232-3232-3232-323232323204', 'round_32', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '49494949-4949-4949-4949-494949494949', '16161616-1616-1616-1616-161616161602', '2026-06-29T20:00:00Z', '2026-06-29T19:00:00Z'), -- Alemania vs Ucrania
('32323232-3232-3232-3232-323232323205', 'round_32', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '18181818-1818-1818-1818-181818181818', '16161616-1616-1616-1616-161616161603', '2026-06-30T16:00:00Z', '2026-06-30T15:00:00Z'), -- Brasil vs Gales
('32323232-3232-3232-3232-323232323206', 'round_32', 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', '28282828-2828-2828-2828-282828282828', '16161616-1616-1616-1616-161616161603', '2026-06-30T20:00:00Z', '2026-06-30T19:00:00Z'), -- Uruguay vs Suecia
('32323232-3232-3232-3232-323232323207', 'round_32', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', '38383838-3838-3838-3838-383838383838', '16161616-1616-1616-1616-161616161604', '2026-07-01T16:00:00Z', '2026-07-01T15:00:00Z'), -- Portugal vs Noruega
('32323232-3232-3232-3232-323232323208', 'round_32', 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', '48484848-4848-4848-4848-484848484848', '16161616-1616-1616-1616-161616161604', '2026-07-01T20:00:00Z', '2026-07-01T19:00:00Z'), -- Italia vs Chile
-- Bracket Half 2
('32323232-3232-3232-3232-323232323209', 'round_32', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', '16161616-1616-1616-1616-161616161605', '2026-07-02T16:00:00Z', '2026-07-02T15:00:00Z'), -- Colombia vs México
('32323232-3232-3232-3232-323232323210', 'round_32', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', '16161616-1616-1616-1616-161616161605', '2026-07-02T20:00:00Z', '2026-07-02T19:00:00Z'), -- Canadá vs Ecuador
('32323232-3232-3232-3232-323232323211', 'round_32', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', '16161616-1616-1616-1616-161616161606', '2026-07-03T16:00:00Z', '2026-07-03T15:00:00Z'), -- España vs Croacia
('32323232-3232-3232-3232-323232323212', 'round_32', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', '16161616-1616-1616-1616-161616161606', '2026-07-03T20:00:00Z', '2026-07-03T19:00:00Z'), -- Inglaterra vs Marruecos
('32323232-3232-3232-3232-323232323213', 'round_32', 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', '16161616-1616-1616-1616-161616161607', '2026-07-04T16:00:00Z', '2026-07-04T15:00:00Z'), -- Países Bajos vs Senegal
('32323232-3232-3232-3232-323232323214', 'round_32', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', '16161616-1616-1616-1616-161616161607', '2026-07-04T20:00:00Z', '2026-07-04T19:00:00Z'), -- Bélgica vs Japón
('32323232-3232-3232-3232-323232323215', 'round_32', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', '16161616-1616-1616-1616-161616161608', '2026-07-05T16:00:00Z', '2026-07-05T15:00:00Z'), -- Corea del Sur vs Dinamarca
('32323232-3232-3232-3232-323232323216', 'round_32', 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', '16161616-1616-1616-1616-161616161608', '2026-07-05T20:00:00Z', '2026-07-05T19:00:00Z') -- Australia vs Suiza
ON CONFLICT (id) DO NOTHING;
