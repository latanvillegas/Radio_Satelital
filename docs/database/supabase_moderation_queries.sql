-- Pendientes de revisión
select id, name, url, country, region, district, caserio, created_at
from public.global_stations
where status = 'pending'
order by created_at asc;

-- Aprobar por ID
update public.global_stations
set status = 'approved', approved_at = now(), reviewed_by = 'admin'
where id = :id;

-- Rechazar por ID
update public.global_stations
set status = 'rejected', approved_at = null, reviewed_by = 'admin'
where id = :id;

-- Aprobar por nombre + url
update public.global_stations
set status = 'approved', approved_at = now(), reviewed_by = 'admin'
where lower(trim(name)) = lower(trim(:name))
  and lower(trim(url)) = lower(trim(:url));

-- Limpiar rechazadas antiguas (ejemplo > 30 días)
delete from public.global_stations
where status = 'rejected'
  and created_at < now() - interval '30 days';
