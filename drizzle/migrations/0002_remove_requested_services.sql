-- Remove only the two services requested from the public booking catalog.
update public.services
set active = false, updated_at = now()
where slug in ('hidratacao', 'degrade');
