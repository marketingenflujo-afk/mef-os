/* ============================================================================
   CLIENTE DE SUPABASE
   ---------------------------------------------------------------------------
   La clave publicable no da permisos por sí sola: quien decide qué se ve es la
   sesión del usuario más las políticas RLS. Por eso puede vivir en el frontend.
   La service_role NUNCA va acá.
   ========================================================================== */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan las variables de entorno. Copiá .env.example a .env.local y cargá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
