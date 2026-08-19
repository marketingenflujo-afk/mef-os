-- ============================================================================
-- Migración 0002 — Invitaciones
-- El alta real la hace Supabase Auth. Esta tabla existe para que
-- Administración pueda mostrar qué invitaciones están pendientes.
-- ============================================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nombre text not null default '',
  apellido text not null default '',
  rol app_role not null default 'contenido',
  organization_id uuid references public.organizations(id) on delete cascade,
  estado text not null default 'pendiente',
  invitado_por uuid references public.profiles(id) on delete set null,
  creado_en timestamptz not null default now()
);

alter table public.invitations enable row level security;

create policy "dirección administra invitaciones" on public.invitations
  for all using (public.es_direccion()) with check (public.es_direccion());

grant select, insert, update, delete on public.invitations to authenticated;

-- Cuando la persona acepta y aparece su perfil, la invitación queda cerrada.
create or replace function public.cerrar_invitacion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.invitations set estado = 'aceptada' where lower(email) = lower(new.email);
  return new;
end $$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.cerrar_invitacion();

revoke execute on function public.cerrar_invitacion() from public, anon, authenticated;
