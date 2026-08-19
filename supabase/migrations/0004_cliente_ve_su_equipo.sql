-- ============================================================================
-- Migración 0004 — El cliente ve quién trabaja en su cuenta
-- Al consolidar las políticas, el cliente dejó de ver los perfiles del equipo
-- y el panel "quiénes trabajan en esta cuenta" quedaba vacío. Le devolvemos
-- exactamente eso y nada más: nombre y rol de quienes comparten su
-- organización. No ve al resto del equipo ni a otros clientes.
-- ============================================================================
create or replace function public.comparte_org(otro uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.organization_members mio
    join public.organization_members ajeno
      on ajeno.organization_id = mio.organization_id
    where mio.user_id = auth.uid() and ajeno.user_id = otro
  );
$$;

revoke execute on function public.comparte_org(uuid) from public, anon;
grant execute on function public.comparte_org(uuid) to authenticated;

drop policy "lectura de perfiles" on public.profiles;

create policy "lectura de perfiles" on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or public.es_direccion()
    or (public.es_interno() and rol <> 'cliente')
    or public.comparte_org(id)
  );
