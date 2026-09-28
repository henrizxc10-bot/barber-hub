-- ENUMS
create type public.app_role as enum ('admin','barber','customer');
create type public.appointment_status as enum ('aguardando','confirmado','em_atendimento','concluido','cancelado','nao_compareceu');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  cpf text,
  loyalty_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles select" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admin profiles select" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- SIGNUP TRIGGER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, cpf)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'cpf')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id,'customer') on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- SERVICES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null,
  duration_minutes integer not null,
  image_url text,
  category text not null default 'Geral',
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "services public read" on public.services for select to anon, authenticated using (true);
create policy "services admin write" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BARBERS
create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  photo_url text,
  bio text not null default '',
  specialties text[] not null default '{}',
  rating numeric(2,1) not null default 5.0,
  reviews_count integer not null default 0,
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.barbers to anon, authenticated;
grant insert, update, delete on public.barbers to authenticated;
grant all on public.barbers to service_role;
alter table public.barbers enable row level security;
create policy "barbers public read" on public.barbers for select to anon, authenticated using (true);
create policy "barbers admin write" on public.barbers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BARBER x SERVICES
create table public.barber_services (
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (barber_id, service_id)
);
grant select on public.barber_services to anon, authenticated;
grant insert, delete on public.barber_services to authenticated;
grant all on public.barber_services to service_role;
alter table public.barber_services enable row level security;
create policy "bs public read" on public.barber_services for select to anon, authenticated using (true);
create policy "bs admin write" on public.barber_services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BUSINESS HOURS (0=sunday)
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null unique check (weekday between 0 and 6),
  is_open boolean not null default true,
  opens_at time not null default '09:00',
  closes_at time not null default '19:00',
  break_start time,
  break_end time
);
grant select on public.business_hours to anon, authenticated;
grant insert, update, delete on public.business_hours to authenticated;
grant all on public.business_hours to service_role;
alter table public.business_hours enable row level security;
create policy "bh public read" on public.business_hours for select to anon, authenticated using (true);
create policy "bh admin write" on public.business_hours for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BARBER SCHEDULES / DAYS OFF
create table public.barber_schedules (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  works boolean not null default true,
  starts_at time not null default '09:00',
  ends_at time not null default '19:00',
  unique (barber_id, weekday)
);
grant select on public.barber_schedules to anon, authenticated;
grant insert, update, delete on public.barber_schedules to authenticated;
grant all on public.barber_schedules to service_role;
alter table public.barber_schedules enable row level security;
create policy "bsch public read" on public.barber_schedules for select to anon, authenticated using (true);
create policy "bsch admin write" on public.barber_schedules for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BLOCKED TIMES / HOLIDAYS
create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default 'Bloqueio',
  created_at timestamptz not null default now()
);
grant select on public.blocked_times to anon, authenticated;
grant insert, update, delete on public.blocked_times to authenticated;
grant all on public.blocked_times to service_role;
alter table public.blocked_times enable row level security;
create policy "bt public read" on public.blocked_times for select to anon, authenticated using (true);
create policy "bt admin write" on public.blocked_times for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- APPOINTMENTS
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  barber_id uuid not null references public.barbers(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_cents integer not null,
  status public.appointment_status not null default 'confirmado',
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appointments_barber_time_idx on public.appointments (barber_id, starts_at);
grant select on public.appointments to anon, authenticated;
grant insert, update on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
-- anon/authenticated need busy-slot visibility; safe columns are exposed through server fns only
create policy "appt public busy read" on public.appointments for select to anon, authenticated using (true);
create policy "appt own insert" on public.appointments for insert to authenticated with check (auth.uid() = customer_id);
create policy "appt own update" on public.appointments for update to authenticated using (auth.uid() = customer_id or public.has_role(auth.uid(),'admin'));

create table public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  status public.appointment_status not null,
  changed_at timestamptz not null default now()
);
grant select on public.appointment_status_history to authenticated;
grant all on public.appointment_status_history to service_role;
alter table public.appointment_status_history enable row level security;
create policy "ash admin read" on public.appointment_status_history for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- SETTINGS (single row)
create table public.settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null default 'Barbearia Nobre',
  address text not null default 'Rua Augusta, 1200 — Consolação, São Paulo — SP',
  phone text not null default '(11) 4002-8922',
  whatsapp text not null default '5511940028922',
  instagram text not null default '@barbearianobre',
  slot_interval_minutes integer not null default 30,
  buffer_minutes integer not null default 0,
  min_hours_ahead integer not null default 2,
  max_days_ahead integer not null default 60,
  cancellation_policy text not null default 'Cancelamentos e remarcações devem ser feitos com no mínimo 2 horas de antecedência.',
  currency text not null default 'BRL',
  timezone text not null default 'America/Sao_Paulo',
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "settings public read" on public.settings for select to anon, authenticated using (true);
create policy "settings admin write" on public.settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.settings (id) values (1);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif own read" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notif own update" on public.notifications for update to authenticated using (auth.uid() = user_id);
create policy "notif own insert" on public.notifications for insert to authenticated with check (auth.uid() = user_id);

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null default 'Cliente',
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  approved boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select to anon, authenticated using (approved = true);
create policy "reviews own insert" on public.reviews for insert to authenticated with check (auth.uid() = customer_id);

-- SEED: business hours
insert into public.business_hours (weekday, is_open, opens_at, closes_at) values
 (0,false,'09:00','19:00'),
 (1,true,'09:00','19:00'),
 (2,true,'09:00','19:00'),
 (3,true,'09:00','20:00'),
 (4,true,'09:00','20:00'),
 (5,true,'09:00','21:00'),
 (6,true,'08:00','18:00');

-- SEED: services (10)
insert into public.services (name, slug, description, price_cents, duration_minutes, category, is_demo) values
 ('Corte Masculino','corte-masculino','Corte clássico ou moderno com acabamento na navalha.',6000,45,'Cabelo',true),
 ('Barba Completa','barba-completa','Toalha quente, óleos e modelagem precisa da barba.',4500,30,'Barba',true),
 ('Corte + Barba','corte-barba','O combo completo para um visual impecável.',9500,75,'Combo',true),
 ('Degradê','degrade','Fade trabalhado com transição perfeita.',7000,50,'Cabelo',true),
 ('Sobrancelha','sobrancelha','Design masculino de sobrancelha na navalha.',2500,15,'Estética',true),
 ('Pigmentação','pigmentacao','Preenchimento de falhas na barba ou no cabelo.',8000,60,'Estética',true),
 ('Platinado','platinado','Descoloração global com tonalização premium.',22000,150,'Coloração',true),
 ('Luzes','luzes','Mechas estratégicas para dar volume ao visual.',16000,120,'Coloração',true),
 ('Hidratação Capilar','hidratacao','Tratamento profundo para cabelo e couro cabeludo.',5000,30,'Tratamento',true),
 ('Corte Infantil','corte-infantil','Atendimento paciente e divertido para os pequenos.',5000,40,'Cabelo',true);

-- SEED: barbers (5)
insert into public.barbers (name, slug, bio, specialties, rating, reviews_count, is_demo) values
 ('Rafael Prado','rafael-prado','15 anos de estrada, especialista em degradê e barba desenhada.','{"Degradê","Barba","Navalha"}',4.9,128,true),
 ('Diego Martins','diego-martins','Referência em coloração masculina e platinados.','{"Platinado","Luzes","Coloração"}',4.8,96,true),
 ('Caio Ferreira','caio-ferreira','Clássico com precisão cirúrgica: tesoura e pente.','{"Corte clássico","Tesoura","Sobrancelha"}',4.7,74,true),
 ('Lucas Almeida','lucas-almeida','Cortes urbanos, freestyle e desenhos autorais.','{"Freestyle","Desenhos","Degradê"}',4.9,151,true),
 ('Bruno Rocha','bruno-rocha','Atendimento calmo, ótimo com crianças e cortes sociais.','{"Corte infantil","Social","Hidratação"}',4.6,63,true);

-- all barbers do all services
insert into public.barber_services (barber_id, service_id)
select b.id, s.id from public.barbers b cross join public.services s;

-- barber weekly schedules: tue-sat
insert into public.barber_schedules (barber_id, weekday, works, starts_at, ends_at)
select b.id, d.weekday, d.works, d.starts_at, d.ends_at
from public.barbers b
cross join (values
 (0,false,'09:00'::time,'19:00'::time),
 (1,false,'09:00'::time,'19:00'::time),
 (2,true,'09:00'::time,'19:00'::time),
 (3,true,'09:00'::time,'20:00'::time),
 (4,true,'09:00'::time,'20:00'::time),
 (5,true,'09:00'::time,'21:00'::time),
 (6,true,'08:00'::time,'18:00'::time)
) as d(weekday, works, starts_at, ends_at);

-- SEED: demo appointments (next days)
insert into public.appointments (code, customer_name, customer_phone, barber_id, service_id, starts_at, ends_at, price_cents, status, is_demo)
select
  'DEMO-' || lpad((row_number() over ())::text, 4, '0'),
  nome, fone, b.id, s.id,
  (current_date + offset_days)::timestamptz + hora,
  (current_date + offset_days)::timestamptz + hora + (s.duration_minutes || ' minutes')::interval,
  s.price_cents, st, true
from (values
 ('Marcos Vinicius','(11) 98888-1001','rafael-prado','corte-masculino',1,'10:00'::interval,'confirmado'::public.appointment_status),
 ('André Luiz','(11) 98888-1002','rafael-prado','corte-barba',1,'14:00','confirmado'),
 ('Felipe Souza','(11) 98888-1003','diego-martins','platinado',1,'11:00','aguardando'),
 ('Thiago Nunes','(11) 98888-1004','caio-ferreira','degrade',2,'09:30','confirmado'),
 ('Rodrigo Alves','(11) 98888-1005','lucas-almeida','degrade',2,'16:00','confirmado'),
 ('Gustavo Lima','(11) 98888-1006','bruno-rocha','corte-infantil',2,'10:30','confirmado'),
 ('Paulo Henrique','(11) 98888-1007','rafael-prado','barba-completa',3,'15:00','aguardando'),
 ('Eduardo Ramos','(11) 98888-1008','diego-martins','luzes',3,'13:00','confirmado'),
 ('Vitor Hugo','(11) 98888-1009','caio-ferreira','sobrancelha',4,'17:00','confirmado'),
 ('Leonardo Dias','(11) 98888-1010','lucas-almeida','corte-barba',4,'11:30','confirmado')
) as seed(nome, fone, barber_slug, service_slug, offset_days, hora, st)
join public.barbers b on b.slug = seed.barber_slug
join public.services s on s.slug = seed.service_slug;
