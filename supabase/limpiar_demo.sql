-- ============================================================================
-- LIMPIAR LOS DATOS DE EJEMPLO
-- ---------------------------------------------------------------------------
-- Nórdika, Vitalis, Casa Campo, Brotes, Altair y Punto Fitness son inventados.
-- Sirven para probar el sistema, no para trabajar. Corré esto cuando quieras
-- arrancar con tus clientes reales.
--
-- Dónde: panel de Supabase → SQL Editor → pegar y ejecutar.
-- Ojo: borra también las tareas, campañas, contenido y reuniones de esas
-- cuentas. Los procesos y SOPs NO se tocan: esos son tuyos y sirven igual.
-- ============================================================================

-- 1. Las organizaciones de ejemplo, con todo lo que cuelga de ellas.
--    El "on delete cascade" se encarga del resto.
delete from public.organizations
where slug in ('nordika-studio','vitalis-salud','casa-campo',
               'brotes-organico','altair-consultora','punto-fitness');

-- 2. Los usuarios de ejemplo. Dejá el tuyo afuera de esta lista.
--    Borrar de auth.users arrastra el perfil y las membresías.
delete from auth.users
where email in (
  'lucia@marketingenflujo.com',
  'sofi@marketingenflujo.com',
  'nico@marketingenflujo.com',
  'juli@marketingenflujo.com',
  'maria@nordikastudio.com',
  'valeria@vitalissalud.com'
  -- 'facu@marketingenflujo.com'  <- este NO: es tu cuenta de CEO
);

-- 3. Notificaciones huérfanas de los datos de ejemplo.
delete from public.notifications
where organization_id is null and creado_en < now() - interval '1 day';

-- 4. Control: qué quedó vivo.
select 'organizaciones' as tabla, count(*) from public.organizations
union all select 'usuarios', count(*) from public.profiles
union all select 'tareas', count(*) from public.tasks
union all select 'procesos', count(*) from public.processes
union all select 'sops', count(*) from public.sops;
