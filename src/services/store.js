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
  subareas: [], estados: [], recursos: [], modulosCliente: [], contenidoModulos: [], finanzas: [], registros: [], accesos: [],
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

  /* --- La arquitectura nueva: el OS dirige, las herramientas ejecutan --- */
  subareas: {
    list: () => cache.subareas,
    byArea: (area) => cache.subareas.filter((s) => s.area === area).sort((a, b) => a.orden - b.orden),
    get: (slug) => cache.subareas.find((s) => s.slug === slug),
  },
  estados: {
    /* El catálogo es uno; el avance es por cuenta. */
    get: (orgId, subareaId) => cache.estados.find((e) => e.org === orgId && e.subarea === subareaId),
    bySubarea: (subareaId) => cache.estados.filter((e) => e.subarea === subareaId),
  },
  recursos: {
    list: () => cache.recursos,
    globales: () => cache.recursos.filter((r) => !r.org),
    porNombre: (nombre) => cache.recursos.find((r) => !r.org && r.nombre === nombre),
    /* En una etapa se ven los recursos de esa cuenta y también los globales
       que la agencia usa siempre para esa etapa. */
    deSubarea: (slug, orgId) => cache.recursos.filter(
      (r) => r.subarea === slug && r.estado === "activo" && (!r.org || r.org === orgId)),
    deOrg: (orgId) => cache.recursos.filter((r) => r.org === orgId),
    /* Lo que el cliente ve en un módulo de su portal: de su cuenta y abierto. */
    deModuloCliente: (orgId, moduloSlug) => cache.recursos.filter(
      (r) => r.org === orgId && r.visibleCliente && r.estado === "activo"
        && (r.moduloCliente === moduloSlug || r.subarea === moduloSlug)),
    /* Dónde se está usando un recurso, para no borrar algo que está enganchado. */
    usosDe: (id) => cache.registros.filter((x) => x.recurso === id).length,
  },
  modulosCliente: {
    byOrg: (orgId) => cache.modulosCliente.filter((m) => m.org === orgId).sort((a, b) => a.orden - b.orden),
    get: (id) => cache.modulosCliente.find((m) => m.id === id),
  },
  contenidoModulo: {
    byModulo: (moduleId) => cache.contenidoModulos.filter((c) => c.modulo === moduleId).sort((a, b) => a.orden - b.orden),
  },
  registros: {
    list: () => cache.registros,
    deSubarea: (subarea, orgId) => cache.registros
      .filter((r) => r.subarea === subarea && (!orgId || r.org === orgId || !r.org)),
  },
  accesos: {
    byOrg: (orgId) => cache.accesos.filter((a) => a.org === orgId).sort((a, b) => a.orden - b.orden),
  },
  finanzas: {
    list: () => cache.finanzas,
    valor: (clave) => { const f = cache.finanzas.find((x) => x.clave === clave); return f ? Number(f.valor) : null; },
  },
  eventos: { list: () => cache.eventos },

  /* Catálogo de la interfaz: no vive en la base todavía. */
  biblioteca: { list: () => BIBLIOTECA },
  prompts: { list: () => PROMPTS },
  automatizaciones: { list: () => AUTOMATIZACIONES },
  modulos: { get: (areaId, subId) => MODULOS[`${areaId}/${subId}`] || null },
};

/* --- Carga inicial ------------------------------------------------------ */
export async function cargarDatos() {
  const [orgs, miembros, perfiles, tareas, proyectos, contenido, campanas, reuniones, metricas, procesos, sops, invitaciones, notificaciones,
         subareas, estados, recursos, modulosCliente, contenidoModulos, finanzas, registros, accesos] =
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
      sel("subareas", "*"),
      sel("subarea_estados", "*"),
      sel("resources", "*"),
      sel("client_modules", "*"),
      sel("client_module_content", "*"),
      sel("finances", "*"),
      sel("records", "*"),
      sel("client_accesses", "*"),
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
  cache.subareas = subareas.map((s) => ({
    id: s.id, slug: s.slug, area: s.area, nombre: s.nombre, descripcion: s.descripcion,
    objetivo: s.objetivo, entra: s.que_entra, resultado: s.resultado,
    rol: s.responsable_rol, herramienta: s.herramienta,
    checklist: s.checklist || [], orden: s.orden,
  }));
  cache.estados = estados.map((e) => ({
    id: e.id, org: e.organization_id, subarea: e.subarea_id, estado: e.estado,
    responsable: e.responsable_id, hechos: e.hechos || [], nota: e.nota,
  }));
  cache.recursos = recursos.map((r) => ({
    id: r.id, org: r.organization_id, nombre: r.nombre, tipo: r.tipo, categoria: r.categoria,
    area: r.area, subarea: r.subarea, url: r.url || "", descripcion: r.descripcion || "",
    color: r.color || "#155EEA", estado: r.estado, visibleCliente: r.visible_cliente,
    proyecto: r.proyecto || "", moduloCliente: r.modulo_cliente || "",
    creadoPor: r.creado_por, actualizado: r.actualizado_en,
  })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  cache.modulosCliente = modulosCliente.map((m) => ({
    id: m.id, org: m.organization_id, slug: m.slug, nombre: m.nombre, descripcion: m.descripcion,
    grupo: m.grupo, estado: m.estado, orden: m.orden,
    accionTexto: m.accion_texto, accionUrl: m.accion_url, requiereCliente: m.requiere_cliente,
  }));
  cache.contenidoModulos = contenidoModulos.map((c) => ({
    id: c.id, modulo: c.module_id, bloque: c.bloque, cuerpo: c.cuerpo, orden: c.orden,
  }));
  cache.finanzas = finanzas.map((f) => ({
    id: f.id, org: f.organization_id, periodo: f.periodo, clave: f.clave,
    valor: f.valor, moneda: f.moneda, nota: f.nota,
  }));
  cache.registros = registros.map((r) => ({
    id: r.id, org: r.organization_id, area: r.area, subarea: r.subarea, titulo: r.titulo,
    detalle: r.detalle || "", estado: r.estado, extra: r.extra || "",
    responsable: r.responsable_id, creado: r.creado_en,
  })).sort((a, b) => new Date(b.creado) - new Date(a.creado));
  cache.accesos = accesos.map((a) => ({
    id: a.id, org: a.organization_id, plataforma: a.plataforma, necesitamos: a.que_necesitamos || "",
    porQue: a.por_que || "", instrucciones: a.instrucciones || "", estado: a.estado, orden: a.orden,
  }));
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

  /* --- Avance de una subárea en una cuenta ------------------------------
     Upsert: si es la primera vez que alguien la toca, la fila se crea sola. */
  async guardarAvance(orgId, subareaId, cambios) {
    const actual = cache.estados.find((e) => e.org === orgId && e.subarea === subareaId);
    const fila = {
      organization_id: orgId,
      subarea_id: subareaId,
      estado: cambios.estado ?? actual?.estado ?? "pendiente",
      hechos: cambios.hechos ?? actual?.hechos ?? [],
      responsable_id: cambios.responsable ?? actual?.responsable ?? null,
      nota: cambios.nota ?? actual?.nota ?? null,
      actualizado_en: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("subarea_estados")
      .upsert(fila, { onConflict: "organization_id,subarea_id" }).select().single();
    if (error) throw new Error(traducirEscritura(error));
    const mapeado = {
      id: data.id, org: data.organization_id, subarea: data.subarea_id, estado: data.estado,
      responsable: data.responsable_id, hechos: data.hechos || [], nota: data.nota,
    };
    cache.estados = [...cache.estados.filter((e) => !(e.org === orgId && e.subarea === subareaId)), mapeado];
    return mapeado;
  },

  /* --- Recursos: cambiar un enlace no debería requerir un programador --- */
  async guardarRecurso(id, campos) {
    const limpio = { ...campos, actualizado_en: new Date().toISOString() };
    if ("url" in limpio) limpio.url = normalizarUrl(limpio.url);
    const { error } = await supabase.from("resources").update(limpio).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    /* La base usa nombres de columna; la interfaz usa los suyos. */
    cache.recursos = cache.recursos.map((r) => r.id === id ? {
      ...r,
      ...(limpio.nombre !== undefined ? { nombre: limpio.nombre } : {}),
      ...(limpio.tipo !== undefined ? { tipo: limpio.tipo } : {}),
      ...(limpio.url !== undefined ? { url: limpio.url || "" } : {}),
      ...(limpio.descripcion !== undefined ? { descripcion: limpio.descripcion || "" } : {}),
      ...(limpio.area !== undefined ? { area: limpio.area } : {}),
      ...(limpio.subarea !== undefined ? { subarea: limpio.subarea } : {}),
      ...(limpio.proyecto !== undefined ? { proyecto: limpio.proyecto || "" } : {}),
      ...(limpio.estado !== undefined ? { estado: limpio.estado } : {}),
      ...(limpio.organization_id !== undefined ? { org: limpio.organization_id } : {}),
      ...(limpio.visible_cliente !== undefined ? { visibleCliente: limpio.visible_cliente } : {}),
      ...(limpio.modulo_cliente !== undefined ? { moduloCliente: limpio.modulo_cliente || "" } : {}),
    } : r);
  },

  async crearRecurso(d, autorId) {
    const { data, error } = await supabase.from("resources").insert({
      organization_id: d.org || null, nombre: d.nombre, tipo: d.tipo || "enlace",
      categoria: d.categoria || null, area: d.area || null, subarea: d.subarea || null,
      url: normalizarUrl(d.url), descripcion: d.descripcion || null, color: d.color || "#155EEA",
      visible_cliente: !!d.visibleCliente, estado: d.estado || "activo",
      proyecto: d.proyecto || null, modulo_cliente: d.moduloCliente || null,
      creado_por: autorId || null,
    }).select().single();
    if (error) throw new Error(traducirEscritura(error));
    const r = {
      id: data.id, org: data.organization_id, nombre: data.nombre, tipo: data.tipo,
      categoria: data.categoria, area: data.area, subarea: data.subarea, url: data.url || "",
      descripcion: data.descripcion || "", color: data.color, estado: data.estado,
      visibleCliente: data.visible_cliente, proyecto: data.proyecto || "",
      moduloCliente: data.modulo_cliente || "", creadoPor: data.creado_por,
      actualizado: data.actualizado_en,
    };
    cache.recursos = [...cache.recursos, r].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return r;
  },

  async duplicarRecurso(id, autorId) {
    const r = cache.recursos.find((x) => x.id === id);
    if (!r) return null;
    return await acciones.crearRecurso({
      ...r, nombre: `${r.nombre} (copia)`, moduloCliente: r.moduloCliente,
    }, autorId);
  },

  async borrarRecurso(id) {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.recursos = cache.recursos.filter((r) => r.id !== id);
  },

  /* --- Registros de cada etapa ----------------------------------------- */
  async crearRegistro(d, autorId) {
    const { data, error } = await supabase.from("records").insert({
      organization_id: d.org || null, area: d.area, subarea: d.subarea,
      titulo: d.titulo, detalle: d.detalle || null, extra: d.extra || null,
      estado: d.estado || "pendiente", responsable_id: d.responsable || null,
      resource_id: d.recurso || null, creado_por: autorId,
    }).select().single();
    if (error) throw new Error(traducirEscritura(error));
    const r = { id: data.id, org: data.organization_id, area: data.area, subarea: data.subarea,
      titulo: data.titulo, detalle: data.detalle || "", estado: data.estado, extra: data.extra || "",
      responsable: data.responsable_id, recurso: data.resource_id, creado: data.creado_en };
    cache.registros = [r, ...cache.registros];
    return r;
  },

  async cambiarEstadoRegistro(id, estado) {
    const { error } = await supabase.from("records").update({ estado }).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.registros = cache.registros.map((r) => r.id === id ? { ...r, estado } : r);
  },

  async borrarRegistro(id) {
    const { error } = await supabase.from("records").delete().eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.registros = cache.registros.filter((r) => r.id !== id);
  },

  /* --- Tareas ---------------------------------------------------------- */
  async crearTarea(d) {
    const { data, error } = await supabase.from("tasks").insert({
      organization_id: d.org || null, titulo: d.titulo, area: d.area,
      prioridad: d.prioridad, estado: "pendiente", responsable_id: d.responsable || null,
      fecha: d.fecha || null, visible_cliente: !!d.visibleCliente,
    }).select().single();
    if (error) throw new Error(traducirEscritura(error));
    cache.tareas = [mapTarea(data, cache.usuarios, cache.proyectos), ...cache.tareas];
  },

  /* --- Borrados --------------------------------------------------------
     Borrar una organización se lleva en cascada su portal, tareas, campañas,
     contenido, reuniones, métricas, accesos y recursos. Por eso la interfaz
     siempre pide confirmación antes de llamar acá. */
  async borrarCliente(orgId) {
    const { error } = await supabase.from("organizations").delete().eq("id", orgId);
    if (error) throw new Error(traducirEscritura(error));
    cache.clientes = cache.clientes.filter((c) => c.id !== orgId);
    cache.membresias = cache.membresias.filter((m) => m.org !== orgId);
    cache.tareas = cache.tareas.filter((t) => t.cliente !== orgId);
    cache.proyectos = cache.proyectos.filter((p) => p.cliente !== orgId);
    cache.contenido = cache.contenido.filter((c) => c.cliente !== orgId);
    cache.campanas = cache.campanas.filter((c) => c.cliente !== orgId);
    cache.reuniones = cache.reuniones.filter((r) => r.cliente !== orgId);
    cache.modulosCliente = cache.modulosCliente.filter((m) => m.org !== orgId);
    cache.accesos = cache.accesos.filter((a) => a.org !== orgId);
    cache.recursos = cache.recursos.filter((r) => r.org !== orgId);
    cache.registros = cache.registros.filter((r) => r.org !== orgId);
    cache.eventos = armarEventos(cache);
  },

  async borrarTarea(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.tareas = cache.tareas.filter((t) => t.id !== id);
  },

  /* --- Quién entra a cada cuenta --------------------------------------- */
  async agregarMiembro(orgId, userId, rolOrg) {
    const { data, error } = await supabase.from("organization_members")
      .insert({ organization_id: orgId, user_id: userId, rol_org: rolOrg })
      .select().single();
    if (error) throw new Error(traducirEscritura(error));
    cache.membresias = [...cache.membresias,
      { id: data.id, user: data.user_id, org: data.organization_id, rolOrg: data.rol_org }];
  },

  async quitarMiembro(id) {
    const { error } = await supabase.from("organization_members").delete().eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.membresias = cache.membresias.filter((m) => m.id !== id);
  },

  /* --- Accesos que le pedimos al cliente -------------------------------- */
  async cambiarEstadoAcceso(id, estado) {
    const { error } = await supabase.from("client_accesses")
      .update({ estado, actualizado_en: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.accesos = cache.accesos.map((a) => a.id === id ? { ...a, estado } : a);
  },

  /* --- Contenido de los módulos del cliente ----------------------------- */
  async guardarBloque(moduleId, bloque) {
    if (bloque.id) {
      const { error } = await supabase.from("client_module_content")
        .update({ bloque: bloque.bloque, cuerpo: bloque.cuerpo }).eq("id", bloque.id);
      if (error) throw new Error(traducirEscritura(error));
      cache.contenidoModulos = cache.contenidoModulos.map((c) => c.id === bloque.id
        ? { ...c, bloque: bloque.bloque, cuerpo: bloque.cuerpo } : c);
      return;
    }
    const orden = (cache.contenidoModulos.filter((c) => c.modulo === moduleId).length + 1) * 10;
    const { data, error } = await supabase.from("client_module_content")
      .insert({ module_id: moduleId, bloque: bloque.bloque, cuerpo: bloque.cuerpo, orden })
      .select().single();
    if (error) throw new Error(traducirEscritura(error));
    cache.contenidoModulos = [...cache.contenidoModulos,
      { id: data.id, modulo: data.module_id, bloque: data.bloque, cuerpo: data.cuerpo, orden: data.orden }];
  },

  async borrarBloque(id) {
    const { error } = await supabase.from("client_module_content").delete().eq("id", id);
    if (error) throw new Error(traducirEscritura(error));
    cache.contenidoModulos = cache.contenidoModulos.filter((c) => c.id !== id);
  },

  /* --- Candados del portal: solo el equipo los mueve ------------------- */
  async cambiarEstadoModulo(moduleId, estado) {
    const { error } = await supabase.from("client_modules")
      .update({ estado, actualizado_en: new Date().toISOString() }).eq("id", moduleId);
    if (error) throw new Error(traducirEscritura(error));
    cache.modulosCliente = cache.modulosCliente.map((m) => m.id === moduleId ? { ...m, estado } : m);
  },

  async guardarAccionModulo(moduleId, campos) {
    if ("accion_url" in campos) campos.accion_url = normalizarUrl(campos.accion_url);
    const { error } = await supabase.from("client_modules").update(campos).eq("id", moduleId);
    if (error) throw new Error(traducirEscritura(error));
    cache.modulosCliente = cache.modulosCliente.map((m) => m.id === moduleId
      ? { ...m, accionTexto: campos.accion_texto ?? m.accionTexto, accionUrl: campos.accion_url ?? m.accionUrl } : m);
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

/* Si pegan "docs.google.com/..." sin https://, el navegador lo toma como una
   ruta de nuestra propia app y no lleva a ningún lado. Lo completamos. */
export function normalizarUrl(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (/^(mailto:|tel:)/i.test(u)) return u;
  return `https://${u.replace(/^\/+/, "")}`;
}

function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `org-${Date.now()}`;
}
