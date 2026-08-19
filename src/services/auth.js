/* ============================================================================
   AUTENTICACIÓN
   ---------------------------------------------------------------------------
   Las contraseñas las maneja Supabase Auth. Nosotros nunca las vemos ni las
   guardamos. El perfil de aplicación (rol, departamento, estado) vive en
   public.profiles y se busca por el id del usuario autenticado.
   ========================================================================== */
import { supabase } from "../lib/supabase";

export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });
    if (error) return { session: null, error: traducir(error) };
    return { session: data.session, error: null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  },

  /* Avisa cuando la sesión cambia: login, logout, refresh, u otra pestaña. */
  onChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_evento, session) => cb(session ?? null));
    return () => data.subscription.unsubscribe();
  },

  async recuperar(email) {
    await supabase.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    });
    /* Misma respuesta exista o no la cuenta: no confirmamos qué emails están
       registrados. */
    return { error: null, mensaje: `Si ${email} tiene cuenta, le llega un mail para crear una contraseña nueva.` };
  },

  async cambiarContrasena(nueva) {
    const { error } = await supabase.auth.updateUser({ password: nueva });
    return { error: error ? traducir(error) : null };
  },

  /* El perfil se lee con RLS: cada uno ve el suyo. Si está desactivado,
     no dejamos entrar. */
  async perfilDe(session) {
    if (!session) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if (error || !data) return null;
    return data;
  },

  async registrarAcceso(userId) {
    await supabase.from("profiles").update({ ultimo_acceso: new Date().toISOString() }).eq("id", userId);
  },
};

function traducir(error) {
  const m = String(error?.message || "").toLowerCase();
  if (m.includes("invalid login")) return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Todavía no confirmaste tu email. Revisá tu casilla.";
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Esperá un minuto y probá de nuevo.";
  if (m.includes("network")) return "No hay conexión con el servidor. Revisá tu internet.";
  return "No pudimos entrar. Probá de nuevo en un momento.";
}
