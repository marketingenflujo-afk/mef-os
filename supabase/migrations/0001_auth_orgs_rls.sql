-- ============================================================================
-- MARKETING EN FLUJO OS — Migración 0001
-- Usuarios, organizaciones, membresías y Row Level Security
--
-- Regla que ordena todo el archivo:
--   la interfaz oculta, la base bloquea.
--   Ninguna tabla con datos de cliente se consulta sin pasar por RLS.
--
-- Aplicar con:  supabase db push     (o pegar en el SQL Editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TIPOS
-- ---------------------------------------------------------------------------
create type app_role as enum (
  'ceo', 'admin', 'estrategia', 'operaciones', 'contenido',
  'editor', 'media', 'research', 'ventas', 'cliente'
);

create type user_status as enum ('activo', 'inactivo', 'suspendido');
create type org_status  as enum ('activo', 'atencion', 'onboarding', 'pausado', 'baja');
create type org_plan    as enum ('Starter', 'Growth', 'Scale');
create type task_status as enum ('pendiente', 'curso', 'revision', 'bloqueada', 'completada');

-- ---------------------------------------------------------------------------
-- 2. PERFILES
--    auth.users (Supabase Auth) → public.profiles (datos de la aplicación).
--    Las contraseñas viven solo en auth. Acá nunca.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nombre       text not null,
  apellido     text not null default '',
  email        text not null unique,
  avatar_url   text,
  telefono     text,
  departamento text,
  rol          app_role not null default 'contenido',
  estado       user_status not null default 'activo',
  creado_en    timestamptz not null default now(),
  ultimo_acceso timestamptz
);

-- El perfil se crea solo cuando alguien acepta la invitación.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, apellido, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'rol')::app_role, 'cliente')
  );

  -- Si la invitación traía organización, queda como miembro desde el minuto cero.
  if new.raw_user_meta_data ? 'organization_id' then
    insert into public.organization_members (organization_id, user_id, rol_org)
    values ((new.raw_user_meta_data->>'organization_id')::uuid, new.id,
            coalesce(new.raw_user_meta_data->>'rol_org', 'Cliente'));
  end if;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. ORGANIZACIONES (clientes)
-- ---------------------------------------------------------------------------
create table public.organizations (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  nombre         text not null,
  logo_url       text,
  descripcion    text,
  industria      text,
  objetivo       text,
  estado         org_status not null default 'onboarding',
  plan           org_plan not null default 'Growth',
  fecha_inicio   date,
  fecha_renovacion date,
  responsable_id uuid references public.profiles(id) on delete set null,
  contacto_nombre text,
  contacto_email  text,
  contacto_telefono text,
  servicios      text[] not null default '{}',
  creado_en      timestamptz not null default now()
);

create table public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  rol_org         text not null default 'Miembro',
  creado_en       timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index on public.organization_members (user_id);
create index on public.organization_members (organization_id);

-- ---------------------------------------------------------------------------
-- 4. FUNCIONES DE PERMISOS
--    security definer + search_path fijo: son la base de todas las políticas,
--    así que no pueden depender de RLS ni de esquemas del usuario.
-- ---------------------------------------------------------------------------
create or replace function public.mi_rol()
returns app_role language sql stable security definer set search_path = public as $$
  select rol from public.profiles where id = auth.uid() and estado = 'activo';
$$;

-- CEO y Admin ven toda la agencia.
create or replace function public.es_direccion()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.mi_rol() in ('ceo', 'admin'), false);
$$;

-- Cualquier rol interno (todos menos 'cliente').
create or replace function public.es_interno()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.mi_rol() <> 'cliente', false);
$$;

-- El chequeo que se repite en cada tabla: ¿puedo tocar esta organización?
create or replace function public.acceso_org(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_direccion()
      or exists (
        select 1
        from public.organization_members m
        join public.profiles p on p.id = m.user_id
        where m.organization_id = org
          and m.user_id = auth.uid()
          and p.estado = 'activo'
      );
$$;

-- ---------------------------------------------------------------------------
-- 5. ENTIDADES DE TRABAJO
--    Toda tabla con datos de cliente lleva organization_id. Sin excepción:
--    es lo que hace posible una sola política clara por tabla.
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nombre text not null, descripcion text, estado task_status not null default 'curso',
  progreso int not null default 0 check (progreso between 0 and 100),
  responsable_id uuid references public.profiles(id) on delete set null,
  deadline date, creado_en timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  titulo text not null, area text, prioridad text not null default 'media',
  estado task_status not null default 'pendiente',
  responsable_id uuid references public.profiles(id) on delete set null,
  fecha date, visible_cliente boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  titulo text not null, formato text, etapa text not null default 'idea',
  guion text, url_archivo text, aprobado_por uuid references public.profiles(id) on delete set null,
  aprobado_en timestamptz, publicado_en date, creado_en timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nombre text not null, plataforma text not null default 'meta',
  objetivo text, presupuesto numeric(12,2), estado text not null default 'activa',
  external_id text, inicio date, fin date, creado_en timestamptz not null default now()
);

create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  fecha date not null, clave text not null, valor numeric(14,4),
  fuente text, unique (organization_id, campaign_id, fecha, clave)
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  titulo text not null, inicio timestamptz not null, fin timestamptz,
  tipo text not null default 'cliente', notas text,
  visible_cliente boolean not null default true
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nombre text not null, storage_path text not null, mime text, tamano bigint,
  subido_por uuid references public.profiles(id) on delete set null,
  visible_cliente boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  autor_id uuid not null references public.profiles(id) on delete cascade,
  cuerpo text not null, creado_en timestamptz not null default now()
);

-- Conocimiento interno de la agencia: no pertenece a ninguna organización.
create table public.processes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, nombre text not null, area text, descripcion text,
  etapas jsonb not null default '[]'
);

create table public.sops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, nombre text not null, area text, objetivo text,
  responsable text, tiempo_estimado text, herramientas text[] default '{}',
  pasos jsonb not null default '[]'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  titulo text not null, detalle text, tono text not null default 'blue',
  leida boolean not null default false, creado_en timestamptz not null default now()
);

-- Auditoría: quién hizo qué y sobre qué organización.
create table public.activity_log (
  id bigserial primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  accion text not null, entidad text, entidad_id uuid, detalle jsonb,
  creado_en timestamptz not null default now()
);

create index on public.tasks (organization_id);
create index on public.content_items (organization_id);
create index on public.campaigns (organization_id);
create index on public.metrics (organization_id, fecha);
create index on public.files (organization_id);
create index on public.messages (organization_id);
create index on public.activity_log (organization_id, creado_en desc);

-- ---------------------------------------------------------------------------
-- 6. RLS
--    Se activa en TODAS las tablas. Sin política explícita, nadie ve nada.
-- ---------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects             enable row level security;
alter table public.tasks                enable row level security;
alter table public.content_items        enable row level security;
alter table public.campaigns            enable row level security;
alter table public.metrics              enable row level security;
alter table public.meetings             enable row level security;
alter table public.files                enable row level security;
alter table public.messages             enable row level security;
alter table public.processes            enable row level security;
alter table public.sops                 enable row level security;
alter table public.notifications        enable row level security;
alter table public.activity_log         enable row level security;

-- --- profiles --------------------------------------------------------------
create policy "cada uno ve su perfil"
  on public.profiles for select using (id = auth.uid());

create policy "el equipo se ve entre sí"
  on public.profiles for select using (public.es_interno() and rol <> 'cliente');

create policy "dirección ve todos los perfiles"
  on public.profiles for select using (public.es_direccion());

-- Nadie se asciende solo: el rol no puede cambiar desde el propio update.
-- Se usa mi_rol() y no una subconsulta a profiles: al ser security definer,
-- no vuelve a disparar RLS sobre la misma tabla (recursión infinita).
create policy "cada uno edita su perfil"
  on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and rol = public.mi_rol());

create policy "dirección administra perfiles"
  on public.profiles for all using (public.es_direccion()) with check (public.es_direccion());

-- --- organizations ---------------------------------------------------------
create policy "veo las organizaciones donde soy miembro"
  on public.organizations for select using (public.acceso_org(id));

create policy "dirección administra organizaciones"
  on public.organizations for all using (public.es_direccion()) with check (public.es_direccion());

-- --- organization_members --------------------------------------------------
create policy "veo las membresías de mis organizaciones"
  on public.organization_members for select using (public.acceso_org(organization_id));

create policy "dirección administra membresías"
  on public.organization_members for all using (public.es_direccion()) with check (public.es_direccion());

-- --- entidades con organization_id ----------------------------------------
-- Mismo patrón en todas: leer si tengo acceso a la organización,
-- escribir solo si además soy del equipo interno.
do $$
declare t text;
begin
  foreach t in array array['projects','content_items','campaigns','metrics','messages']
  loop
    execute format($f$
      create policy "lectura por organización" on public.%1$s
        for select using (public.acceso_org(organization_id));
      create policy "escritura interna" on public.%1$s
        for insert with check (public.acceso_org(organization_id) and public.es_interno());
      create policy "edición interna" on public.%1$s
        for update using (public.acceso_org(organization_id) and public.es_interno())
        with check (public.acceso_org(organization_id));
      create policy "borrado de dirección" on public.%1$s
        for delete using (public.es_direccion());
    $f$, t);
  end loop;
end $$;

-- Excepción: el cliente sí puede escribir en el hilo de comunicación de su cuenta.
create policy "el cliente responde en su hilo"
  on public.messages for insert
  with check (public.acceso_org(organization_id) and autor_id = auth.uid());

-- tasks, files y meetings: el cliente ve solo lo marcado como visible.
-- Van aparte del bloque anterior a propósito: las políticas permisivas se
-- combinan con OR, así que una política genérica de lectura acá anularía
-- el filtro visible_cliente. La restricción tiene que estar en la única
-- política de SELECT de la tabla.
do $$
declare t text;
begin
  foreach t in array array['tasks','files','meetings']
  loop
    execute format($f$
      create policy "lectura con visibilidad" on public.%1$s
        for select using (public.acceso_org(organization_id)
                          and (public.es_interno() or visible_cliente));
      create policy "escritura interna" on public.%1$s
        for insert with check (public.acceso_org(organization_id) and public.es_interno());
      create policy "edición interna" on public.%1$s
        for update using (public.acceso_org(organization_id) and public.es_interno())
        with check (public.acceso_org(organization_id));
      create policy "borrado de dirección" on public.%1$s
        for delete using (public.es_direccion());
    $f$, t);
  end loop;
end $$;

-- --- conocimiento interno --------------------------------------------------
create policy "procesos solo para el equipo"
  on public.processes for select using (public.es_interno());
create policy "dirección administra procesos"
  on public.processes for all using (public.es_direccion()) with check (public.es_direccion());

create policy "sops solo para el equipo"
  on public.sops for select using (public.es_interno());
create policy "dirección administra sops"
  on public.sops for all using (public.es_direccion()) with check (public.es_direccion());

-- --- notificaciones y auditoría --------------------------------------------
create policy "veo mis notificaciones"
  on public.notifications for select using (user_id = auth.uid());
create policy "marco mis notificaciones como leídas"
  on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "auditoría solo para dirección"
  on public.activity_log for select using (public.es_direccion());

-- ---------------------------------------------------------------------------
-- 7. VISTA DE CONVENIENCIA
--    El frontend pregunta "¿a qué organizaciones entro?" y la base contesta
--    lo mismo que contestaría RLS. Una sola fuente de verdad.
-- ---------------------------------------------------------------------------
-- security_invoker: la vista se evalúa con los permisos de quien consulta.
-- Sin esto correría como su dueño (postgres) y se saltearía RLS.
create view public.mis_organizaciones with (security_invoker = on) as
  select * from public.organizations;

-- ---------------------------------------------------------------------------
-- 8. PRIVILEGIOS
--    Las funciones de permisos no tienen por qué estar expuestas en la API.
--    authenticated conserva EXECUTE porque las políticas RLS se evalúan con
--    los privilegios de quien consulta: sin eso, las policies romperían.
-- ---------------------------------------------------------------------------
revoke execute on function public.mi_rol()         from public, anon;
revoke execute on function public.es_direccion()   from public, anon;
revoke execute on function public.es_interno()     from public, anon;
revoke execute on function public.acceso_org(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.mi_rol()         to authenticated;
grant execute on function public.es_direccion()   to authenticated;
grant execute on function public.es_interno()     to authenticated;
grant execute on function public.acceso_org(uuid) to authenticated;

-- El sistema no tiene nada público: sin sesión no se lee ni una fila.
-- Le sacamos los privilegios de tabla a anon, así las políticas ni se evalúan.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

-- ---------------------------------------------------------------------------
-- 9. CÓMO PROBAR QUE FUNCIONA
--    Con el usuario cliente autenticado:
--      select * from organizations;              -- solo la suya
--      select * from campaigns where organization_id = '<otra org>';  -- 0 filas
--    Cambiar el id en la URL del frontend no alcanza: la consulta vuelve vacía.
-- ---------------------------------------------------------------------------
