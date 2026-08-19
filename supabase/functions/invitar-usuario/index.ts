// ============================================================================
// EDGE FUNCTION — invitar-usuario
// ---------------------------------------------------------------------------
// Crear usuarios necesita la service_role, que nunca puede estar en el
// navegador. Por eso vive acá: la función verifica que quien invita sea CEO o
// Admin antes de hacer nada.
//
// Desplegar:  supabase functions deploy invitar-usuario
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Falta la sesión." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Quién está pidiendo esto
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "Sesión inválida." }, 401);

    // 2. Solo Dirección invita. El chequeo va acá, no en la interfaz.
    const { data: perfil } = await admin.from("profiles").select("rol, estado").eq("id", auth.user.id).single();
    if (!perfil || perfil.estado !== "activo" || !["ceo", "admin"].includes(perfil.rol)) {
      return json({ error: "Tu rol no puede invitar usuarios." }, 403);
    }

    const { email, nombre, apellido, rol, organization_id } = await req.json();
    if (!email || !rol) return json({ error: "Falta el email o el rol." }, 400);
    if (rol === "cliente" && !organization_id) {
      return json({ error: "Un cliente necesita una organización asignada." }, 400);
    }

    // 3. La invitación. El trigger handle_new_user crea el perfil y la
    //    membresía cuando la persona acepta y elige su contraseña.
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        nombre: nombre ?? "",
        apellido: apellido ?? "",
        rol,
        ...(organization_id ? { organization_id, rol_org: rol === "cliente" ? "Cliente" : "Miembro" } : {}),
      },
      redirectTo: `${Deno.env.get("SITE_URL") ?? url}/bienvenida`,
    });
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch {
    return json({ error: "No pudimos enviar la invitación." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
