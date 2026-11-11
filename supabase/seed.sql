-- Bonus requests confirmed from the car photos (rows 1–16). Inserted as drafts; the owner publishes them.
insert into public.bonus_requests (no, code, "group", title, element, strength, description, submit, idea, execution, sort, status) values
  (1,  'L01', 'lights', 'Tail lights with holographic audio-brand logos (Concerto Malang, STEG, Audiocircle/Zelos)', 'A', 'strong', null, false, false, 0, 1, 'draft'),
  (2,  'B02', 'body',   'Sound-wave / heartbeat line across the bonnet (lime side)', 'D', 'strong', null, false, false, 0, 2, 'draft'),
  (3,  'B03', 'body',   'Yellow stacked-bar ornament at the sills, reads like an EQ meter (confirm meaning)', 'B/D', 'strong', null, false, false, 0, 3, 'draft'),
  (4,  'B04', 'body',   'Audio-brand livery on side skirts and doors (Audiocircle, STEG, Zelos)', 'A', 'strong', null, false, false, 0, 4, 'draft'),
  (5,  'L05', 'lights', 'Custom headlights: blue projectors, purple halo, green figures inside', 'B', 'medium', null, false, false, 0, 5, 'draft'),
  (6,  'L06', 'lights', 'Purple LED grille bars and illuminated front emblem', 'B', 'medium', null, false, false, 0, 6, 'draft'),
  (7,  'L07', 'lights', 'Smoked tail lights with purple figures inside', 'B', 'medium', null, false, false, 0, 7, 'draft'),
  (8,  'G08', 'glass',  'Wayang gunungan motif on rear quarter glass and tailgate', 'B/D', 'medium', null, false, false, 0, 8, 'draft'),
  (9,  'B09', 'body',   'Gold wayang figure across doors and glass, both sides', 'B/D', 'medium', null, false, false, 0, 9, 'draft'),
  (10, 'B10', 'body',   'Colour character illustration on the lime-side front door', 'B', 'medium', null, false, false, 0, 10, 'draft'),
  (11, 'B11', 'body',   'Yellow tower / lantern ornament on the black-side tailgate', 'B/D', 'medium', null, false, false, 0, 11, 'draft'),
  (12, 'B12', 'body',   'Mirrored floral / batik line art', 'D', 'medium', null, false, false, 0, 12, 'draft'),
  (13, 'B13', 'body',   'Two-face split paint, lime and black', 'Overall design', 'weak', null, false, false, 0, 13, 'draft'),
  (14, 'R14', 'rims',   'Multi-piece rims, polished lips, lowered stance', '—', 'weak', null, false, false, 0, 14, 'draft'),
  (15, 'G15', 'glass',  'EMMA Asian Finals 2026 banners on windscreen and rear glass', 'D', 'weak', null, false, false, 0, 15, 'draft'),
  (16, 'B16', 'body',   'Twin exhaust tips', '—', 'unlikely', null, false, false, 0, 16, 'draft');
