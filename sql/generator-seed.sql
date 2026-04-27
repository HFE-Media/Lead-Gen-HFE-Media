insert into public.term_patterns (pattern)
values
  ('{category} {location}'),
  ('{category} in {location}'),
  ('{category} near {location}'),
  ('best {category} {location}'),
  ('affordable {category} {location}'),
  ('professional {category} {location}'),
  ('local {category} {location}'),
  ('{location} {category}')
on conflict do nothing;
