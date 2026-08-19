/* ============================================================================
   STORE — el puente entre Supabase y las vistas
   ---------------------------------------------------------------------------
   Las vistas leen de forma sincrónica (services.clientes.list()), así que acá
   mantenemos una caché en memoria que se llena una vez por sesión con
   cargarDatos(). Las escrituras van directo a la base y refrescan la caché.

   Ninguna consulta filtra por organización a mano: RLS ya devuelve solo lo
   permitido. Si algo vuelve vacío, es porque no corresponde verlo.
   ========================================================================== */
import { supabase } from "../lib/supabase";
import { puede } from "../auth/roles";
import { BIBLIOTECA, PROMPTS, AUTOMATIZACIONES, MODULOS } from "../data/catalogo";

const cache = {
  clientes: [], usuarios: [], membresias: [], tareas: [], proyectos: [],
  contenido: [], campanas: [], reuniones: [], metricas: [],
  procesos: [], sops: [], invitaciones: [], eventos: [], notificaciones: [],
};

export const store = cache;

/* --- Lecturas: mismas firmas que usaban las vistas con datos demo -------- */
export const services = {
  clientes: {
    list: () => cache.clientes,
    get: (id) => cache.clientes.find((c) => c.id === id),
    visiblesPara: (perfil) => {
      if (!perfil) return [];
      if (puede(perfil.rol, "clientes.todos")) return cache.clientes;
      const ids = cache.membresias.filter((m) => m.user === perfil.id).map((m) => m.org);
      return cache.clientes.filter((c) => ids.includes(c.id));
    },
    accesoA: (perfil, orgId) => {
      if (!perfil) return false;
      if (puede(perfil.rol, "clientes.todos")) return true;
      return cache.membresias.some((m) => m.user === perfil.id && m.org === orgId);
    },
  },
  usuarios: {
    list: () => cache.usuarios,
    get: (id) => cache.usuarios.find((u) => u.id === id),
  },
  membresias: {
    porOrg: (orgId) => cache.membresias.filter((m) => m.org === orgId)
      .map((m) => ({ ...m, perfil: cache.usuarios.find((u) => u.id === m.user) })).filter((m) => m.perfil),
    porUsuario: (userId) => cache.membresias.filter((m) => m.user === userId)
      .map((m) => ({ ...m, org: cache.clientes.find((c) => c.id === m.org) })).filter((m) => m.org),
  },
  tareas: {
    list: () => cache.tareas,
    byCliente: (orgId) => cache.tareas.filter((t) => t.cliente === orgId),
  },
  contenido: { byCliente: (orgId) => cache.contenido.filter((c) => c.cliente === orgId) },
  campanas: { byCliente: (orgId) => cache.campanas.filter((c) => c.cliente === orgId) },
  reuniones: { byCliente: (orgId) => cache.reuniones.filter((r) => r.cliente === orgId) },
  proyectos: { byCliente: (orgId) => cache.proyectos.filter((p) => p.cliente === orgId) },
  procesos: { list: () => cache.procesos, get: (id) => cache.procesos.find((p) => p.id === id) },
  sops: { list: () => cache.sops, get: (id) => cache.sops.find((s) => s.id === id) },
  invitaciones: { list: () => cache.invitaciones },
  notificaciones: { list: () => cache.notificaciones },
  eventos: { list: () => cache.eventos },

  /* Catálogo de la interfaz: no vive en la base todavía. */
  biblioteca: { list: () => BIBLIOTECA },
  prompts: { list: () => PROMPTS },
  automatizaciones: { list: () => AUTOMATIZACIONES },
  modulos: { get: (areaId, subId) => MODULOS[`${areaId}/${subId}`] || null },
};

/* --- Carga inicial ------------------------------------------------------ */
export async function cargarDatos() {
  const [orgs, miembros, perfiles, tareas, proyectos, contenido, campanas, reuniones, metricas, procesos, sops, invitaciones, notificaciones] =
    await Promise.all([
      sel("organizations", "*"),
      sel("organization_members", "*"),
      sel("profiles", "*"),
      sel("tasks", "*"),
      sel("projects", "*"),
      sel("content_items", "*"),
      sel("campaigns", "*"),
      sel("meetings", "*"),
      sel("metrics", "*"),
      sel("processes", "*"),
      sel("sops", "*"),
      sel("invitations", "*"),
      sel("notifications", "*"),
    ]);

  cache.usuarios = perfiles.map(mapPerfil).sort((a, b) => a.nombre.localeCompare(b.nombre));
  cache.membresias = miembros.map((m) => ({ id: m.id, user: m.user_id, org: m.organization_id, rolOrg: m.rol_org }));
  cache.proyectos = proyectos.map((p) => ({ id: p.id, cliente: p.organization_id, nombre: p.nombre, estado: p.estado, progreso: p.progreso }));
  cache.tareas = tareas.map((t) => mapTarea(t, cache.usuarios, cache.proyectos))
    .sort((a, b) => (a.orden || "").localeCompare(b.orden || ""));
  cache.contenido = contenido.map((c) => ({ id: c.id, cliente: c.organization_id, titulo: c.titulo, formato: c.formato, etapa: c.etapa, publicado: c.publicado_en }));
  cache.campanas = campanas.map((c) => ({ id: c.id, cliente: c.organization_id, nombre: c.nombre, objetivo: c.objetivo, presupuesto: c.presupuesto, estado: c.estado, inicio: c.inicio }));
  cache.reuniones = reuniones.map((r) => ({ id: r.id, cliente: r.organization_id, titulo: r.titulo, inicio: r.inicio, tipo: r.tipo }));
  cache.metricas = metricas;
  cache.clientes = orgs.map((o) => mapOrg(o, cache)).sort((a, b) => a.nombre.localeCompare(b.nombre));
  cache.procesos = procesos.map(mapProceso);
  cache.sops = sops.map(mapSop);
  cache.invitaciones = invitaciones.map((i) => ({
    id: i.id, email: i.email, nombre: i.nombre, apellido: i.apellido, rol: i.rol,
    org: i.organization_id, estado: i.estado, enviada: fecha(i.creado_en),
  }));
  cache.notificaciones = notificaciones
    .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
    .map((n) => ({ id: n.id, tono: n.tono, titulo: n.titulo, detalle: n.detalle || "", tiempo: relativo(n.creado_en), leida: n.leida }));
  cache.eventos = armarEventos(cache);
  return cache;
}

async function sel(tabla, cols) {
  const { data, error } = await supabase.from(tabla).select(cols);
  /* Un error de permisos no rompe la app: esa parte simplemente no se ve. */
  if (error) { console.warn(`[store] ${tabla}: ${error.message}`); return []; }
  return data ?? [];
}

/* --- Escrituras --------------------------------------------------------- */
export const acciones = {
  async crearCliente(d, responsableId) {
    const { data, error } = await supabase.from("organizations").insert({
      slug: slugify(d.nombre), nombre: d.nombre.trim(), industria: d.industria || null,
      plan: d.plan, fecha_inicio: null, responsable_id: responsableId || null,
      contacto_nombre: d.contacto || null, contacto_email: d.email || null,
      servicios: d.servicios || [], estado: "onboarding",
      objetivo: "Todavía sin objetivo cargado. Definilo en el diagnóstico inicial.",
    }).select().single();
    if (error) throw new Error(traducirEscritura(error));
    const cliente = mapOrg(data, cache);
    cache.clientes = [...cache.clientes, cliente].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return cliente;
  },

  async invitar(d, invitadoPor) {
    const { data, error } = await supabase.from("invitations").insert({
      email: d.email.trim().toLowerCase(), nombre: d.nombre, apellido: d.apellido,
      rol: d.rol, organization_id: d.org || null, invitado_por: invitadoPor,
    }).select().single();
    if (error) throw new Error(traducirEscritura(error));

    /* El alta real la hace la Edge Function con la service_role. Si todavía no
       está desplegada, la invitación queda registrada igual y se puede reenviar. */
    let enviada = true;
    try {
      const { error: fnError } = await supabase.functions.invoke("invitar-usuario", {
        body: { email: d.email, nombre: d.nombre, apellido: d.apellido, rol: d.rol, organization_id: d.org || null },
      });
      if (fnError) enviada = false;
    } catch { enviada = false; }

    const inv = { id: data.id, email: data.email, nombre: data.nombre, apellido: data.apellido,
      rol: data.rol, org: data.organization_id, estado: data.estado, enviada: fecha(data.creado_en) };
    cache.invitaciones = [inv, ...cache.invitaciones];
    return { invitacion: inv, enviada };
  },

  async cambiarEstadoUsuario(id) {
    const u = cache.usuarios.find((x) => x.id === id);
    const nuevo = u.estado === "activo" ? "inactivo" : "activo";
    const { error } = await supabase.from("profiles").update({ estado: nuevo }).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.usuarios = cache.usuarios.map((x) => x.id === id ? { ...x, estado: nuevo } : x);
    return nuevo;
  },

  async cambiarRolUsuario(id, rol) {
    const { error } = await supabase.from("profiles").update({ rol }).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.usuarios = cache.usuarios.map((x) => x.id === id ? { ...x, rol } : x);
  },

  async cambiarEstadoTarea(id, estado) {
    const { error } = await supabase.from("tasks").update({ estado }).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.tareas = cache.tareas.map((t) => t.id === id ? { ...t, estado } : t);
  },
};

function traducirEscritura(error) {
  const m = String(error?.message || "").toLowerCase();
  if (m.includes("row-level security") || m.includes("permission denied"))
    return "Tu rol no tiene permiso para hacer esto.";
  if (m.includes("duplicate key")) return "Ya existe un registro con ese nombre o email.";
  return "No se pudo guardar. Probá de nuevo.";
}

/* --- Mapeo de la base al lenguaje de la interfaz ------------------------- */
function mapPerfil(p) {
  return {
    id: p.id, nombre: p.nombre, apellido: p.apellido || "", email: p.email, rol: p.rol,
    depto: p.departamento || "—", estado: p.estado,
    creado: fecha(p.creado_en), ultimo: p.ultimo_acceso ? relativo(p.ultimo_acceso) : "Todavía no entró",
  };
}

function mapTarea(t, usuarios, proyectos) {
  const resp = usuarios.find((u) => u.id === t.responsable_id);
  const proy = proyectos.find((p) => p.id === t.project_id);
  return {
    id: t.id, titulo: t.titulo, cliente: t.organization_id, area: t.area || "General",
    responsable: resp ? resp.nombre : "Sin asignar", prioridad: t.prioridad, estado: t.estado,
    fecha: t.fecha ? diaMes(t.fecha) : "—", orden: t.fecha || "9999",
    proyecto: proy ? proy.nombre : "—", visibleCliente: t.visible_cliente,
  };
}

function mapOrg(o, c) {
  const proyectos = c.proyectos.filter((p) => p.cliente === o.id);
  const tareas = c.tareas.filter((t) => t.cliente === o.id);
  const responsable = c.usuarios.find((u) => u.id === o.responsable_id);
  const prox = c.reuniones.filter((r) => r.cliente === o.id && new Date(r.inicio) >= hoy())
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))[0];
  const met = (clave) => {
    const filas = c.metricas.filter((m) => m.organization_id === o.id && m.clave === clave);
    if (!filas.length) return null;
    return filas.reduce((s, f) => s + Number(f.valor), 0) / (clave === "leads" ? 1 : filas.length);
  };
  const leads = met("leads"), roas = met("roas"), cpl = met("cpl");
  return {
    id: o.id, slug: o.slug, nombre: o.nombre, industria: o.industria || "—", estado: o.estado,
    plan: o.plan, responsable: responsable ? responsable.nombre : "Sin asignar",
    proyectos: proyectos.length, reunion: prox ? diaMes(prox.inicio) : "—",
    desde: o.fecha_inicio ? mesAnio(o.fecha_inicio) : "—",
    objetivo: o.objetivo || "Todavía sin objetivo cargado.",
    salud: salud(o, tareas),
    kpis: {
      leads: leads != null ? Math.round(leads) : "—",
      ventas: "—",
      roas: roas != null ? `${roas.toFixed(1)}x` : "—",
      cac: cpl != null ? `USD ${Math.round(cpl)}` : "—",
      conversion: "—",
    },
    contacto: o.contacto_nombre || "—", email: o.contacto_email || "—",
    renovacion: o.fecha_renovacion ? fecha(o.fecha_renovacion) : "—",
    servicios: o.servicios || [],
  };
}

/* Salud de la cuenta: estado del contrato menos lo que está trabado. */
function salud(o, tareas) {
  const base = { activo: 88, onboarding: 70, atencion: 62, pausado: 45, baja: 20 }[o.estado] ?? 70;
  const trabadas = tareas.filter((t) => t.estado === "bloqueada").length;
  return Math.max(10, Math.min(100, base - trabadas * 8));
}

function mapProceso(p) {
  const tonos = { Contenido: "orange", "Paid Media": "blue", Operaciones: "green", Estrategia: "violet", Research: "orange" };
  return {
    id: p.slug, nombre: p.nombre, area: p.area, tone: tonos[p.area] || "blue",
    desc: p.descripcion || "",
    etapas: (p.etapas || []).map((e) => ({
      n: e.n, nombre: e.nombre, responsable: e.responsable,
      entra: e.entra || "—", sale: e.sale || "—",
      herramientas: e.herramientas || [], sop: e.sop || null,
      checklist: e.checklist || [], auto: e.auto || null,
    })),
  };
}

function mapSop(s) {
  return {
    id: s.slug, nombre: s.nombre, area: s.area, tiempo: s.tiempo_estimado || "—",
    responsable: s.responsable || "—", herramientas: s.herramientas || [],
    objetivo: s.objetivo || "", pasos: (s.pasos || []).map((p) => ({ t: p.t, d: p.d || "" })),
  };
}

/* El calendario junta reuniones, entregas y publicaciones del mes en curso. */
function armarEventos(c) {
  const mes = new Date().getMonth(), anio = new Date().getFullYear();
  const delMes = (iso) => { const d = new Date(iso); return d.getMonth() === mes && d.getFullYear() === anio; };
  const ev = [];
  c.reuniones.filter((r) => delMes(r.inicio)).forEach((r) => ev.push({
    d: new Date(r.inicio).getDate(), tipo: r.tipo === "cliente" ? "cliente" : "interno",
    t: r.titulo, h: hora(r.inicio),
  }));
  c.tareas.filter((t) => t.orden !== "9999" && delMes(t.orden)).forEach((t) => ev.push({
    d: new Date(t.orden + "T12:00:00").getDate(),
    tipo: t.area === "Contenido" ? "contenido" : t.area === "Paid Media" ? "ads" : t.area === "Ventas" ? "ventas" : "interno",
    t: t.titulo, h: "",
  }));
  c.contenido.filter((x) => x.publicado && delMes(x.publicado)).forEach((x) => ev.push({
    d: new Date(x.publicado + "T12:00:00").getDate(), tipo: "contenido", t: `Publicado: ${x.titulo}`, h: "",
  }));
  return ev;
}

/* --- Formato ------------------------------------------------------------ */
const hoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const dt = (v) => (typeof v === "string" && v.length === 10 ? new Date(v + "T12:00:00") : new Date(v));
const diaMes = (v) => dt(v).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
const fecha = (v) => dt(v).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
const mesAnio = (v) => { const s = dt(v).toLocaleDateString("es-AR", { month: "short", year: "numeric" }); return s.charAt(0).toUpperCase() + s.slice(1); };
const hora = (v) => new Date(v).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

function relativo(iso) {
  const min = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (min < 2) return "Recién";
  if (min < 60) return `Hace ${min} min`;
  if (min < 60 * 24) return `Hace ${Math.floor(min / 60)} h`;
  const dias = Math.floor(min / 60 / 24);
  if (dias === 1) return "Ayer";
  if (dias < 30) return `Hace ${dias} días`;
  return fecha(iso);
}

function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `org-${Date.now()}`;
}
