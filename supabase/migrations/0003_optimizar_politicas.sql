-- ============================================================================
-- Migración 0003 — Optimización de RLS
-- Tres cambios, ningún permiso nuevo:
--   1. (select auth.uid()) en vez de auth.uid(): se evalúa una vez por
--      consulta y no una vez por fila.
--   2. Una sola política por tabla y acción: las permisivas se combinan con
--      OR, así que varias hacen el mismo trabajo varias veces.
--   3. "to authenticated": sin sesión, las políticas ni se evalúan.
--
-- El patrón por tabla queda así:
--   SELECT  → acceso_org(organization_id)
--   INSERT  → acceso_org + es_interno
--   UPDATE  → acceso_org + es_interno
--   DELETE  → es_direccion
-- Con dos excepciones deliberadas:
--   · tasks, files y meetings suman "or visible_cliente" en el SELECT.
--     Esa restricción va DENTRO de la única política de lectura: si hubiera
--     una segunda política permisiva, el OR anularía el filtro.
--   · messages deja escribir al cliente si firma con su propio id.
-- ============================================================================

-- Limpieza: sacamos todas las políticas para rearmarlas consolidadas.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- --- profiles --------------------------------------------------------------
create policy "lectura de perfiles" on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or public.es_direccion()
    or (public.es_interno() and rol <> 'cliente')
  );

-- Cada uno edita el suyo; Dirección edita cualquiera. Nadie se asciende solo:
-- fuera de Dirección, el rol tiene que quedar igual al que ya tenía.
create policy "edicion de perfiles" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or public.es_direccion())
  with check (
    public.es_direccion()
    or (id = (select auth.uid()) and rol = public.mi_rol())
  );

create policy "alta de perfiles" on public.profiles for insert to authenticated
  with check (public.es_direccion());
create policy "baja de perfiles" on public.profiles for delete to authenticated
  using (public.es_direccion());

-- --- organizations ---------------------------------------------------------
-- acceso_org ya contempla a Dirección, así que una sola política alcanza.
create policy "lectura de organizaciones" on public.organizations for select to authenticated
  using (public.acceso_org(id));
create policy "alta de organizaciones" on public.organizations for insert to authenticated
  with check (public.es_direccion());
create policy "edicion de organizaciones" on public.organizations for update to authenticated
  using (public.es_direccion()) with check (public.es_direccion());
create policy "baja de organizaciones" on public.organizations for delete to authenticated
  using (public.es_direccion());

-- --- organization_members --------------------------------------------------
create policy "lectura de membresias" on public.organization_members for select to authenticated
  using (public.acceso_org(organization_id));
create policy "alta de membresias" on public.organization_members for insert to authenticated
  with check (public.es_direccion());
create policy "edicion de membresias" on public.organization_members for update to authenticated
  using (public.es_direccion()) with check (public.es_direccion());
create policy "baja de membresias" on public.organization_members for delete to authenticated
  using (public.es_direccion());

-- --- entidades de trabajo --------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['projects','content_items','campaigns','metrics']
  loop
    execute format($f$
      create policy "lectura por organizacion" on public.%1$s for select to authenticated
        using (public.acceso_org(organization_id));
      create policy "alta interna" on public.%1$s for insert to authenticated
        with check (public.acceso_org(organization_id) and public.es_interno());
      create policy "edicion interna" on public.%1$s for update to authenticated
        using (public.acceso_org(organization_id) and public.es_interno())
        with check (public.acceso_org(organization_id));
      create policy "baja de direccion" on public.%1$s for delete to authenticated
        using (public.es_direccion());
    $f$, t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tasks','files','meetings']
  loop
    execute format($f$
      create policy "lectura con visibilidad" on public.%1$s for select to authenticated
        using (public.acceso_org(organization_id)
               and (public.es_interno() or visible_cliente));
      create policy "alta interna" on public.%1$s for insert to authenticated
        with check (public.acceso_org(organization_id) and public.es_interno());
      create policy "edicion interna" on public.%1$s for update to authenticated
        using (public.acceso_org(organization_id) and public.es_interno())
        with check (public.acceso_org(organization_id));
      create policy "baja de direccion" on public.%1$s for delete to authenticated
        using (public.es_direccion());
    $f$, t);
  end loop;
end $$;

create policy "lectura de mensajes" on public.messages for select to authenticated
  using (public.acceso_org(organization_id));
create policy "alta de mensajes" on public.messages for insert to authenticated
  with check (
    public.acceso_org(organization_id)
    and (public.es_interno() or autor_id = (select auth.uid()))
  );
create policy "edicion de mensajes" on public.messages for update to authenticated
  using (autor_id = (select auth.uid())) with check (autor_id = (select auth.uid()));
create policy "baja de mensajes" on public.messages for delete to authenticated
  using (public.es_direccion());

-- --- conocimiento interno --------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['processes','sops']
  loop
    execute format($f$
      create policy "lectura del equipo" on public.%1$s for select to authenticated
        using (public.es_interno());
      create policy "alta de direccion" on public.%1$s for insert to authenticated
        with check (public.es_direccion());
      create policy "edicion de direccion" on public.%1$s for update to authenticated
        using (public.es_direccion()) with check (public.es_direccion());
      create policy "baja de direccion" on public.%1$s for delete to authenticated
        using (public.es_direccion());
    $f$, t);
  end loop;
end $$;

-- --- notificaciones, invitaciones y auditoría ------------------------------
create policy "veo mis notificaciones" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "marco mis notificaciones" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "el equipo genera notificaciones" on public.notifications for insert to authenticated
  with check (public.es_interno());

create policy "lectura de invitaciones" on public.invitations for select to authenticated
  using (public.es_direccion());
create policy "alta de invitaciones" on public.invitations for insert to authenticated
  with check (public.es_direccion());
create policy "edicion de invitaciones" on public.invitations for update to authenticated
  using (public.es_direccion()) with check (public.es_direccion());
create policy "baja de invitaciones" on public.invitations for delete to authenticated
  using (public.es_direccion());

create policy "auditoria solo para direccion" on public.activity_log for select to authenticated
  using (public.es_direccion());
create policy "el equipo deja registro" on public.activity_log for insert to authenticated
  with check (public.es_interno());

-- --- índices que faltaban en las claves foráneas ---------------------------
create index on public.organizations (responsable_id);
create index on public.projects (responsable_id);
create index on public.tasks (responsable_id);
create index on public.tasks (project_id);
create index on public.content_items (aprobado_por);
create index on public.metrics (campaign_id);
create index on public.files (subido_por);
create index on public.messages (autor_id);
create index on public.notifications (organization_id);
create index on public.invitations (organization_id);
create index on public.invitations (invitado_por);
create index on public.activity_log (actor_id);
