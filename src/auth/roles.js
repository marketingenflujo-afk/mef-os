/* ============================================================================
   ROLES Y PERMISOS
   ---------------------------------------------------------------------------
   Espejo en el frontend de las políticas RLS de la base. La interfaz oculta;
   la base bloquea. Si cambiás un permiso acá, cambialo en la migración SQL.
   ========================================================================== */

/* --- Roles y permisos ---------------------------------------------------
   Esta tabla es el espejo en el frontend de las políticas RLS de la base.
   La interfaz oculta lo que no corresponde; la base es la que bloquea.
   Si cambiás un permiso acá, cambialo también en la migración SQL.        */
export const ROLES = {
  ceo:         { label: "CEO",         tipo: "interno", areas: "all",
                 perm: ["*"] },
  admin:       { label: "Admin",       tipo: "interno", areas: "all",
                 perm: ["admin", "clientes.todos", "calendario", "tareas", "biblioteca", "herramientas", "config"] },
  estrategia:  { label: "Estrategia",  tipo: "interno", areas: ["estrategia", "contenido", "research", "operaciones", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "tareas", "biblioteca", "herramientas"] },
  operaciones: { label: "Operaciones", tipo: "interno", areas: ["operaciones", "contenido", "paid", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "tareas", "biblioteca", "herramientas"] },
  contenido:   { label: "Contenido",   tipo: "interno", areas: ["contenido", "research", "operaciones", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "tareas", "biblioteca", "herramientas"] },
  editor:      { label: "Editor",      tipo: "interno", areas: ["contenido", "biblioteca"],
                 perm: ["clientes.asignados", "tareas", "biblioteca", "herramientas"] },
  media:       { label: "Media Buyer", tipo: "interno", areas: ["paid", "research", "operaciones", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "tareas", "biblioteca", "herramientas"] },
  research:    { label: "Research",    tipo: "interno", areas: ["research", "contenido", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "biblioteca", "herramientas"] },
  ventas:      { label: "Ventas",      tipo: "interno", areas: ["ventas", "research", "biblioteca"],
                 perm: ["clientes.asignados", "calendario", "tareas", "biblioteca", "herramientas"] },
  cliente:     { label: "Cliente",     tipo: "cliente", areas: [],
                 perm: ["portal"] },
};

/* Permisos usados en la interfaz:
   *                    → todo (solo CEO)
   admin                → sección Administración
   clientes.todos       → ve todas las organizaciones
   clientes.asignados   → ve solo las organizaciones donde es miembro       */
export const puede = (rol, p) => {
  const r = ROLES[rol];
  if (!r) return false;
  return r.perm.includes("*") || r.perm.includes(p);
};
