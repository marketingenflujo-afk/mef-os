import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import {
  Home, Crown, Settings, Target, Clapperboard, Megaphone, Search, DollarSign, Bot, BookOpen,
  Link2, Bell, Calendar, ChevronRight, ChevronDown, Users, Folder, CheckSquare, BarChart3,
  TrendingUp, UserPlus, ExternalLink, Copy, Check, X, Menu, Moon, Sun, Plus, ArrowLeft,
  Clock, AlertCircle, CheckCircle2, Circle, FileText, Zap, Sparkles, LayoutDashboard,
  PieChart, Wallet, GitBranch, Lightbulb, Mic, Scissors, ThumbsUp, Send, Image as ImageIcon,
  Wrench, Library, Route, ListChecks, MessageSquare, Paperclip, Video, Eye, Gauge, Flag,
  Building2, Star, Command, CornerDownLeft, Filter, Layers, Compass, Beaker, Activity, Lock,
  ClipboardList, Rocket, Share2, ShieldCheck, Award, Play, Download
} from "lucide-react";

import "./design/system.css";
import { ROLES, puede } from "./auth/roles";
import {
  TONE, ESTADOS, PRIORIDADES, AREAS, ESTADO_CLIENTE, TOOLS_INIT,
  PROMPTS, AUTOMATIZACIONES, TIPO_EVENTO, QUICK_INIT, FLUJO,
} from "./data/catalogo";
import { services, acciones, cargarDatos } from "./services/store";
import { auth } from "./services/auth";

/* ============================================================================
   MARKETING EN FLUJO OS
   ---------------------------------------------------------------------------
   Este archivo tiene la interfaz: componentes, vistas y navegación.
   Lo demás vive afuera, a propósito:

     design/system.css   tokens y estilos (el "Design DNA" de la referencia)
     data/catalogo.jsx   áreas, herramientas, prompts — cómo se ve y se navega
     auth/roles.js       roles y permisos (espejo de las políticas RLS)
     services/auth.js    sesión, login, recuperación de contraseña
     services/store.js   lectura y escritura contra Supabase
     lib/supabase.js     el cliente

   Las vistas no saben que existe Supabase: le piden datos al store.
   ========================================================================== */


/* ============================================================================
   2. DATOS (demo). Reemplazables por Supabase / Airtable / API.
   ========================================================================== */

























/* ============================================================================
   3. SERVICIOS — única capa a reemplazar al conectar un backend real
   ========================================================================== */


/* --- Autenticación ------------------------------------------------------
   Este proveedor tiene la misma forma que Supabase Auth, a propósito:
   cuando conectes el proyecto real, reemplazás el cuerpo de cada método
   por la llamada de supabase-js y el resto de la aplicación no cambia.

     signIn      → supabase.auth.signInWithPassword({ email, password })
     signOut     → supabase.auth.signOut()
     getSession  → supabase.auth.getSession()
     recuperar   → supabase.auth.resetPasswordForEmail(email)
     invitar     → edge function con service_role (nunca desde el navegador)


/* ============================================================================
   4. COMPONENTES REUTILIZABLES
   ========================================================================== */

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* Las subáreas definidas en la base mandan sobre el catálogo del código.
   Así se agregan o reordenan etapas sin tocar la aplicación. */
function itemsDeArea(area) {
  const deLaBase = services.subareas.byArea(area.id);
  if (!deLaBase.length) return area.items;
  const iconos = {
    research: Search, ideas: Lightbulb, guiones: FileText, grabacion: Mic, edicion: Scissors,
    avatares: Bot, visual: ImageIcon, aprobaciones: ThumbsUp, final: Send, calendario: Calendar,
    campanas: Megaphone, creatividades: ImageIcon, presupuesto: Wallet, metricas: BarChart3,
    tests: Beaker, optimizacion: Gauge,
  };
  return deLaBase.map((sa) => ({
    id: sa.slug, name: sa.nombre, icon: iconos[sa.slug.split("/")[1]] || ListChecks,
    view: "subarea", slug: sa.slug,
  }));
}

function StatusBadge({ tone = "gray", children, dot = false }) {
  const t = TONE[tone] || TONE.gray;
  return (
    <span className="badge" style={{ background: t.bg, color: t.fg }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: t.fg }} />}
      {children}
    </span>
  );
}

function DashboardCard({ icon: Icon, label, value, delta, deltaTone = "green", onClick }) {
  return (
    <button className="card card-pad card-hover" onClick={onClick} style={{ display: "flex", gap: 14, alignItems: "center", width: "100%" }}>
      <span className="stat-ico" style={{ background: "var(--blue)", color: "#fff" }}><Icon size={21} strokeWidth={2.1} /></span>
      <span style={{ minWidth: 0, textAlign: "left" }}>
        <span className="eyebrow" style={{ display: "block" }}>{label}</span>
        <span className="stat-num" style={{ display: "block" }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: `var(--${deltaTone === "green" ? "green" : deltaTone === "orange" ? "orange" : "muted"})` }}>{delta}</span>
      </span>
    </button>
  );
}

function DepartmentCard({ area, onOpenArea, onOpenSub }) {
  const t = TONE[area.tone];
  return (
    <div className="card card-pad card-hover" style={{ display: "flex", flexDirection: "column" }}>
      <button onClick={() => onOpenArea(area.id)} style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", width: "100%" }}>
        <span className="area-ico" style={{ background: t.fg, color: "#fff" }}><area.icon size={20} strokeWidth={2.1} /></span>
        <span style={{ minWidth: 0 }}>
          <span className="h3" style={{ display: "block", textTransform: "uppercase", letterSpacing: ".4px", fontSize: 13 }}>{area.name}</span>
          <span className="mini" style={{ display: "block", marginTop: 3, lineHeight: 1.45 }}>{area.desc}</span>
        </span>
      </button>
      <hr className="divider" style={{ margin: "14px 0 8px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {itemsDeArea(area).map((it) => (
          <button key={it.id} className="row-link" onClick={() => onOpenSub(area.id, it)}>
            <it.icon size={15} strokeWidth={1.9} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
            <ChevronRight size={14} className="rc" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool, onOpen, compact = false }) {
  const inner = (
    <>
      <span style={{ width: compact ? 24 : 34, height: compact ? 24 : 34, borderRadius: compact ? 7 : 9, background: tool.color,
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 11 : 13, fontWeight: 800, flexShrink: 0 }}>
        {tool.letra}
      </span>
      <span style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
        <span style={{ display: "block", fontSize: compact ? 13 : 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.nombre}</span>
        {!compact && <span className="mini" style={{ display: "block", marginTop: 2 }}>{tool.desc}</span>}
      </span>
      <ExternalLink size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
    </>
  );
  if (compact) return <button className="row-link" onClick={() => onOpen(tool)} style={{ padding: "7px 9px" }}>{inner}</button>;
  return <button className="card card-pad card-hover" onClick={() => onOpen(tool)} style={{ display: "flex", gap: 12, alignItems: "center", width: "100%" }}>{inner}</button>;
}

function ClientCard({ cliente, onOpen }) {
  const e = ESTADO_CLIENTE[cliente.estado];
  return (
    <button className="card card-pad card-hover" onClick={() => onOpen(cliente.id)} style={{ textAlign: "left", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span className="area-ico" style={{ background: "var(--blue-soft)", color: "var(--blue)", fontSize: 15, fontWeight: 800 }}>
          {cliente.nombre.slice(0, 2).toUpperCase()}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="h3" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente.nombre}</div>
          <div className="mini" style={{ marginTop: 2 }}>{cliente.industria}</div>
        </div>
        <StatusBadge tone={e.tone} dot>{e.label}</StatusBadge>
      </div>
      <hr className="divider" style={{ margin: "14px 0 12px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {[["Plan", cliente.plan], ["A cargo", cliente.responsable], ["Proyectos", String(cliente.proyectos)], ["Reunión", cliente.reunion]].map(([k, v]) => (
          <div key={k}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

function TaskCard({ tarea, onToggle }) {
  const est = ESTADOS[tarea.estado];
  const pri = PRIORIDADES[tarea.prioridad];
  const cli = tarea.cliente ? services.clientes.get(tarea.cliente) : null;
  const done = tarea.estado === "completada";
  return (
    <div className="list-row">
      <button className={`check ${done ? "done" : ""}`} onClick={() => onToggle(tarea.id)} aria-label="Marcar como completada">
        {done && <Check size={13} strokeWidth={3} />}
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: done ? "line-through" : "none", opacity: done ? .55 : 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tarea.titulo}</div>
        <div className="mini" style={{ marginTop: 3, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span>{cli ? cli.nombre : "Interno"}</span><span>·</span><span>{tarea.area}</span><span>·</span><span>{tarea.responsable}</span>
        </div>
      </div>
      <StatusBadge tone={pri.tone}>{pri.label}</StatusBadge>
      <StatusBadge tone={est.tone} dot>{est.label}</StatusBadge>
      <span className="mini" style={{ width: 46, textAlign: "right", flexShrink: 0 }}>{tarea.fecha}</span>
    </div>
  );
}

function ProcessStep({ etapa, active, onClick }) {
  return (
    <button className={`step ${active ? "on" : ""}`} onClick={onClick} style={active ? { borderColor: "var(--blue)", boxShadow: "var(--shadow)" } : undefined}>
      <span className="step-n">{etapa.n}</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{etapa.nombre}</span>
        <span className="mini" style={{ display: "block", marginTop: 2 }}>{etapa.responsable}</span>
      </span>
      <ChevronRight size={16} style={{ color: "var(--muted)", opacity: .6 }} />
    </button>
  );
}

function QuickAction({ item, onClick }) {
  return (
    <button className="row-link" onClick={onClick}>
      <item.icon size={15} strokeWidth={1.9} style={{ color: "var(--blue)", flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</span>
      {item.meta && <span className="mini" style={{ marginLeft: "auto", flexShrink: 0 }}>{item.meta}</span>}
    </button>
  );
}

function SectionHead({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div className="eyebrow">{title}</div>
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

function Empty({ icon: Icon = Sparkles, titulo, texto, cta, onCta }) {
  return (
    <div className="empty">
      <span className="empty-ico"><Icon size={22} /></span>
      <div className="h3">{titulo}</div>
      <div className="mini" style={{ maxWidth: 340, lineHeight: 1.55 }}>{texto}</div>
      {cta && <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={onCta}><Plus size={14} />{cta}</button>}
    </div>
  );
}

function CopyButton({ text, label = "Copiar" }) {
  const [ok, setOk] = useState(false);
  const copiar = () => {
    const done = () => { setOk(true); setTimeout(() => setOk(false), 1600); };
    try {
      if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).then(done).catch(() => fallback()); }
      else fallback();
    } catch { fallback(); }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch {}
      document.body.removeChild(ta);
    }
  };
  return (
    <button className="btn btn-ghost btn-sm" onClick={copiar} style={ok ? { color: "var(--green)", borderColor: "var(--green)" } : undefined}>
      {ok ? <Check size={14} /> : <Copy size={14} />}{ok ? "Copiado" : label}
    </button>
  );
}

/* --- Buscador global --------------------------------------------------- */
function SearchModal({ open, onClose, onGo }) {
  const { clientesVisibles, rolActivo } = useApp();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);

  const index = useMemo(() => {
    const idx = [];
    clientesVisibles.forEach((c) => idx.push({ k: "Cliente", t: c.nombre, s: c.industria, icon: Users, to: { view: "cliente", id: c.id } }));
    /* Un cliente solo busca dentro de su propio espacio. */
    if (ROLES[rolActivo]?.tipo === "cliente") return idx;
    AREAS.forEach((a) => {
      idx.push({ k: "Área", t: a.name, s: a.desc, icon: a.icon, to: { view: "area", id: a.id } });
      a.items.forEach((it) => idx.push({ k: a.name, t: it.name, s: "Módulo", icon: it.icon, to: { view: "sub", areaId: a.id, subId: it.id } }));
    });
    services.procesos.list().forEach((p) => idx.push({ k: "Proceso", t: p.nombre, s: `${p.etapas.length} etapas · ${p.area}`, icon: Route, to: { view: "proceso", id: p.id } }));
    services.sops.list().forEach((s) => idx.push({ k: "SOP", t: s.nombre, s: `${s.area} · ${s.tiempo}`, icon: ListChecks, to: { view: "sop", id: s.id } }));
    services.prompts.list().forEach((p) => idx.push({ k: "Prompt", t: p.nombre, s: p.cat, icon: Sparkles, to: { view: "prompts" } }));
    services.tareas.list().forEach((t) => idx.push({ k: "Tarea", t: t.titulo, s: `${t.area} · ${t.responsable}`, icon: CheckSquare, to: { view: "tareas" } }));
    services.biblioteca.list().forEach((b) => idx.push({ k: b.tipo, t: b.nombre, s: b.area, icon: BookOpen, to: { view: "biblioteca" } }));
    TOOLS_INIT.forEach((t) => idx.push({ k: "Herramienta", t: t.nombre, s: t.desc, icon: Link2, to: { view: "herramientas" } }));
    services.automatizaciones.list().forEach((a) => idx.push({ k: "Automatización", t: a.nombre, s: a.desc, icon: Zap, to: { view: "automatizaciones" } }));
    idx.push({ k: "Vista", t: "Dashboard CEO", s: "Números de toda la agencia", icon: Crown, to: { view: "ceo" } });
    idx.push({ k: "Vista", t: "Calendario", s: "Reuniones, entregas y publicaciones", icon: Calendar, to: { view: "calendario" } });
    idx.push({ k: "Vista", t: "Configuración", s: "Herramientas, accesos rápidos y rol", icon: Settings, to: { view: "config" } });
    return idx;
  }, [clientesVisibles, rolActivo]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index.filter((r) => ["Cliente", "Vista", "Proceso"].includes(r.k)).slice(0, 7);
    return index.filter((r) => (r.t + " " + r.s + " " + r.k).toLowerCase().includes(term)).slice(0, 9);
  }, [q, index]);

  useEffect(() => { setSel(0); }, [q]);
  if (!open) return null;

  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[sel]) { onGo(results[sel].to); onClose(); }
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onKeyDown={key}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <Search size={18} style={{ color: "var(--muted)" }} />
          <input ref={inputRef} className="search-input" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar clientes, procesos, SOPs, prompts, tareas…" />
          <span className="kbd">Esc</span>
        </div>
        <div style={{ padding: 8, maxHeight: 380, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "34px 20px", textAlign: "center" }}>
              <div className="h3">Nada con ese nombre</div>
              <div className="mini" style={{ marginTop: 4 }}>Probá con el nombre de un cliente, un SOP o una herramienta.</div>
            </div>
          ) : results.map((r, i) => (
            <button key={i} className={`res ${i === sel ? "on" : ""}`} onMouseEnter={() => setSel(i)}
              onClick={() => { onGo(r.to); onClose(); }}>
              <r.icon size={16} style={{ color: i === sel ? "var(--blue)" : "var(--muted)", flexShrink: 0 }} />
              <span style={{ minWidth: 0, textAlign: "left" }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.t}</span>
                <span className="mini" style={{ display: "block" }}>{r.s}</span>
              </span>
              <span className="rk">{r.k}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "center" }}>
          <span className="mini" style={{ display: "flex", alignItems: "center", gap: 5 }}><CornerDownLeft size={12} /> abrir</span>
          <span className="mini">↑ ↓ moverse</span>
          <span className="mini" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}><Command size={11} /> K</span>
        </div>
      </div>
    </div>
  );
}

/* --- Panel de notificaciones ------------------------------------------- */
function NotificationPanel({ open, onClose, notis, onLeer, onLeerTodas }) {
  if (!open) return null;
  return (
    <>
      <div className="overlay" style={{ padding: 0, background: "rgba(11,27,51,.25)" }} onMouseDown={onClose} />
      <aside className="drawer">
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div className="h2">Notificaciones</div>
            <div className="mini" style={{ marginTop: 2 }}>{notis.filter((n) => !n.leida).length} sin leer</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {notis.length === 0 && <Empty icon={Bell} titulo="Nada nuevo" texto="Cuando el sistema tenga algo que avisarte, aparece acá." />}
          {notis.map((n) => (
            <button key={n.id} onClick={() => onLeer(n.id)} className="list-row" style={{ width: "100%", textAlign: "left", opacity: n.leida ? .55 : 1 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: TONE[n.tono].fg, flexShrink: 0, marginTop: 5 }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{n.titulo}</span>
                <span className="mini" style={{ display: "block", marginTop: 2 }}>{n.detalle}</span>
                <span className="mini" style={{ display: "block", marginTop: 4, opacity: .8 }}>{n.tiempo}</span>
              </span>
            </button>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onLeerTodas}>Marcar todas como leídas</button>
        </div>
      </aside>
    </>
  );
}

/* --- Visor de SOP ------------------------------------------------------- */
function SOPViewer({ sop, onBack }) {
  const [abierto, setAbierto] = useState(0);
  return (
    <div style={{ maxWidth: 820 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}><ArrowLeft size={14} /> Volver a la biblioteca</button>
      <div className="card">
        <div className="card-pad" style={{ padding: 22 }}>
          <StatusBadge tone="blue">SOP · {sop.area}</StatusBadge>
          <h1 className="h1" style={{ marginTop: 10 }}>{sop.nombre}</h1>
          <p className="sub" style={{ maxWidth: 620 }}>{sop.objetivo}</p>
          <div style={{ display: "flex", gap: 26, marginTop: 18, flexWrap: "wrap" }}>
            <div><div className="eyebrow">Responsable</div><div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{sop.responsable}</div></div>
            <div><div className="eyebrow">Tiempo estimado</div><div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{sop.tiempo}</div></div>
            <div><div className="eyebrow">Herramientas</div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                {sop.herramientas.map((h) => <StatusBadge key={h} tone="gray">{h}</StatusBadge>)}
              </div>
            </div>
          </div>
        </div>
        <hr className="divider" />
        <div style={{ padding: 18 }}>
          <SectionHead title={`Proceso · ${sop.pasos.length} pasos`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sop.pasos.map((p, i) => (
              <div key={i} className="card" style={{ boxShadow: "none", borderColor: abierto === i ? "var(--blue)" : "var(--border)" }}>
                <button onClick={() => setAbierto(abierto === i ? -1 : i)}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", width: "100%", textAlign: "left" }}>
                  <span className="step-n" style={{ width: 30, height: 30, fontSize: 12,
                    background: abierto === i ? "var(--blue)" : "var(--blue-soft)", color: abierto === i ? "#fff" : "var(--blue)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{p.t}</span>
                  <ChevronDown size={16} style={{ color: "var(--muted)", transform: abierto === i ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
                </button>
                {abierto === i && (
                  <div style={{ padding: "0 16px 14px 57px", fontSize: 13.2, color: "var(--muted)", lineHeight: 1.6 }}>{p.d}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Cinta del flujo (elemento de identidad) ---------------------------- */
function FlujoRibbon({ onGo }) {
  return (
    <div className="card card-pad" style={{ background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div className="eyebrow">El flujo de Marketing en Flujo</div>
        <div className="mini" style={{ marginLeft: "auto" }}>Todo lo que hacemos entra en alguna de estas etapas.</div>
      </div>
      <div className="flujo">
        {FLUJO.map((f, i) => (
          <React.Fragment key={f}>
            {i > 0 && <span className="flujo-arrow" />}
            <button className="flujo-node" onClick={onGo}>{f.toUpperCase()}</button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   5. VISTAS
   ========================================================================== */

/* --- Inicio ------------------------------------------------------------- */
function VistaInicio() {
  const { go, tools, abrirTool, quick, notis, perfil, rolActivo, clientesVisibles, version, now } = useApp();
  const activos = clientesVisibles.filter((c) => c.estado === "activo").length;
  const tareas = useMemo(() => services.tareas.list(), [version]);
  const proyectos = clientesVisibles.reduce((s, c) => s + c.proyectos, 0);
  const abiertas = tareas.filter((t) => t.estado !== "completada").length;
  const trabadas = tareas.filter((t) => t.estado === "bloqueada").length;
  const leads = clientesVisibles.reduce((s, c) => s + (typeof c.kpis.leads === "number" ? c.kpis.leads : 0), 0);

  const fecha = now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hora = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const saludo = now.getHours() < 13 ? "¡Buen día" : now.getHours() < 20 ? "¡Buenas tardes" : "¡Buenas noches";

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">{saludo}, {perfil.nombre}! 👋</h1>
          <p className="sub">Acá tenés el resumen general de Marketing en Flujo.</p>
        </div>
        <div className="card card-pad" style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "10px 14px" }}>
          <Calendar size={17} style={{ color: "var(--blue)" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{fecha}</div>
            <div className="mini">{hora}</div>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="col">
          <div className="grid g4" style={{ marginBottom: 22 }}>
            <DashboardCard icon={Users} label="Clientes activos" value={activos}
              delta={`${clientesVisibles.length} en total`} deltaTone="muted" onClick={() => go({ view: "clientes" })} />
            <DashboardCard icon={Folder} label="Proyectos activos" value={proyectos}
              delta="En curso" deltaTone="muted" onClick={() => go({ view: "sub", areaId: "operaciones", subId: "proyectos" })} />
            <DashboardCard icon={CheckSquare} label="Tareas abiertas" value={abiertas}
              delta={trabadas ? `${trabadas} trabadas` : "Ninguna trabada"} deltaTone={trabadas ? "orange" : "green"}
              onClick={() => go({ view: "tareas" })} />
            <DashboardCard icon={UserPlus} label="Leads del mes" value={leads || "—"}
              delta={leads ? "Según campañas cargadas" : "Conectá Meta Ads"} deltaTone="muted"
              onClick={() => go({ view: "sub", areaId: "ventas", subId: "leads" })} />
          </div>

          <SectionHead title="Áreas de trabajo" />
          <div className="grid g4" style={{ marginBottom: 22 }}>
            {AREAS.filter((a) => a.id !== "biblioteca")
              .filter((a) => ROLES[rolActivo].areas === "all" || ROLES[rolActivo].areas.includes(a.id))
              .map((a) => (
              <DepartmentCard key={a.id} area={a}
                onOpenArea={(id) => go({ view: "area", id })}
                onOpenSub={(areaId, it) => go(it.slug ? { view: "subarea", slug: it.slug } : { view: "sub", areaId, subId: it.id })} />
            ))}
          </div>

          <div className="card card-pad card-hover" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
            <span className="area-ico" style={{ background: "var(--blue)", color: "#fff" }}><BookOpen size={20} /></span>
            <div style={{ minWidth: 180, flex: 1 }}>
              <div className="h3" style={{ textTransform: "uppercase", letterSpacing: ".4px", fontSize: 13 }}>Biblioteca y sistema</div>
              <div className="mini" style={{ marginTop: 3 }}>Todo el conocimiento, procesos y recursos de Marketing en Flujo.</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["SOPs", ListChecks, { view: "biblioteca" }], ["Procesos", Route, { view: "procesos" }], ["Templates", Paperclip, { view: "biblioteca" }],
                ["Prompts", Sparkles, { view: "prompts" }], ["Manuales", BookOpen, { view: "biblioteca" }], ["Formación", Play, { view: "biblioteca" }]].map(([n, I, to]) => (
                <button key={n} className="pill" onClick={() => go(to)}><I size={14} />{n}</button>
              ))}
            </div>
          </div>

          <FlujoRibbon onGo={() => go({ view: "procesos" })} />
        </div>

        <aside className="rail">
          <div className="card">
            <div style={{ padding: "15px 16px 6px" }}><div className="eyebrow">Accesos rápidos</div></div>
            <div style={{ padding: "0 8px 10px" }}>
              {quick.filter((q) => q.on).map((q) => <QuickAction key={q.id} item={q} onClick={() => go(q.to)} />)}
            </div>
          </div>

          <div className="card">
            <div style={{ padding: "15px 16px 6px", display: "flex", alignItems: "center" }}>
              <div className="eyebrow">Herramientas</div>
              <button className="mini" style={{ marginLeft: "auto", color: "var(--blue)", fontWeight: 600 }} onClick={() => go({ view: "herramientas" })}>Ver todas</button>
            </div>
            <div style={{ padding: "0 8px 10px" }}>
              {tools.slice(0, 8).map((t) => <ToolCard key={t.id} tool={t} compact onOpen={abrirTool} />)}
            </div>
          </div>

          <div className="card">
            <div style={{ padding: "15px 16px 6px", display: "flex", alignItems: "center" }}>
              <div className="eyebrow">Notificaciones</div>
              <button className="mini" style={{ marginLeft: "auto", color: "var(--blue)", fontWeight: 600 }} onClick={() => go({ view: "ceo" })}>Qué necesita atención</button>
            </div>
            <div style={{ padding: "4px 0 6px" }}>
              {notis.length === 0 && <div className="mini" style={{ padding: "6px 16px 12px" }}>Nada nuevo por ahora.</div>}
              {notis.slice(0, 3).map((n) => (
                <div key={n.id} className="list-row" style={{ padding: "10px 16px", borderBottom: "none" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: TONE[n.tono].fg, flexShrink: 0 }} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 12.8, fontWeight: 600, lineHeight: 1.35 }}>{n.titulo}</span>
                    <span className="mini" style={{ display: "block", marginTop: 2 }}>{n.detalle}</span>
                  </span>
                  <span className="mini" style={{ flexShrink: 0, fontSize: 10.5 }}>{n.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/* --- Dashboard CEO ------------------------------------------------------ */
function VistaCEO() {
  const { go, clientesVisibles, usuarios, version } = useApp();

  /* Todo lo que se puede calcular con lo que hay cargado. Lo que todavía no
     tiene fuente se muestra como pendiente de conectar, no inventado. */
  const { metricas, atencion } = useMemo(() => {
    const clientes = clientesVisibles;
    const tareas = services.tareas.list();
    const activos = clientes.filter((c) => c.estado === "activo").length;
    const proyectos = clientes.reduce((s, c) => s + c.proyectos, 0);
    const leads = clientes.reduce((s, c) => s + (typeof c.kpis.leads === "number" ? c.kpis.leads : 0), 0);
    const roas = clientes.map((c) => parseFloat(c.kpis.roas)).filter((n) => !isNaN(n));
    const bloqueadas = tareas.filter((t) => t.estado === "bloqueada");
    const enRevision = tareas.filter((t) => t.estado === "revision");
    const abiertas = tareas.filter((t) => t.estado !== "completada").length;
    const equipo = usuarios.filter((u) => ROLES[u.rol]?.tipo === "interno" && u.estado === "activo").length;

    /* Si la consulta vuelve vacía es porque este usuario no es el CEO:
       la base no le entrega las finanzas, no las escondemos nosotros. */
    const plata = (clave) => {
      const v = services.finanzas.valor(clave);
      return v == null ? "—" : `USD ${Number(v).toLocaleString("es-AR")}`;
    };

    const metricas = [
      { l: "Clientes activos", v: String(activos), d: `${clientes.length} en total`, t: "green" },
      { l: "Proyectos en curso", v: String(proyectos), d: `${abiertas} tareas abiertas`, t: "muted" },
      { l: "Leads del mes", v: leads ? String(leads) : "—", d: leads ? "Según campañas cargadas" : "Conectá Meta Ads", t: leads ? "green" : "muted" },
      { l: "ROAS promedio", v: roas.length ? `${(roas.reduce((a, b) => a + b, 0) / roas.length).toFixed(1)}x` : "—", d: roas.length ? `${roas.length} cuentas con datos` : "Conectá Meta Ads", t: "green" },
      { l: "Equipo activo", v: String(equipo), d: `${usuarios.length} usuarios en total`, t: "muted" },
      { l: "Cuentas con alertas", v: String(clientes.filter((c) => c.estado === "atencion" || c.salud < 65).length), d: "Salud por debajo de 65%", t: "orange" },
      { l: "Tareas trabadas", v: String(bloqueadas.length), d: bloqueadas.length ? "Necesitan destrabarse" : "Ninguna", t: bloqueadas.length ? "orange" : "green" },
      { l: "Esperando aprobación", v: String(enRevision.length), d: "En revisión ahora", t: "muted" },
      /* Estas salen de la tabla de finanzas, que solo el CEO puede consultar. */
      { l: "Facturación del mes", v: plata("facturacion"), d: plata("facturacion") === "—" ? "Cargala en Dirección" : "Período actual", t: "green" },
      { l: "MRR", v: plata("mrr"), d: plata("mrr") === "—" ? "Cargalo en Dirección" : "Recurrente", t: "green" },
      { l: "Margen", v: services.finanzas.valor("margen") != null ? `${services.finanzas.valor("margen")}%` : "—", d: "Sobre facturación", t: "green" },
      { l: "Conversión a cierre", v: "—", d: "Pendiente de conectar", t: "muted" },
    ];

    const atencion = [
      ...bloqueadas.map((t) => ({ tono: "red", texto: `${t.titulo} — trabada`,
        accion: "Ver cuenta", to: t.cliente ? { view: "cliente", id: t.cliente } : { view: "tareas" } })),
      ...clientes.filter((c) => c.estado === "atencion").map((c) => ({ tono: "orange",
        texto: `${c.nombre} está marcada para atención`, accion: "Ver cliente", to: { view: "cliente", id: c.id } })),
      ...(enRevision.length ? [{ tono: "orange", texto: `${enRevision.length} ${enRevision.length === 1 ? "tarea espera" : "tareas esperan"} revisión`,
        accion: "Abrir tareas", to: { view: "tareas" } }] : []),
      ...clientes.filter((c) => c.estado === "pausado").map((c) => ({ tono: "red",
        texto: `${c.nombre} sigue pausado`, accion: "Ver cliente", to: { view: "cliente", id: c.id } })),
      ...clientes.filter((c) => c.estado === "onboarding").map((c) => ({ tono: "green",
        texto: `${c.nombre} está en onboarding`, accion: "Ver cliente", to: { view: "cliente", id: c.id } })),
    ];
    return { metricas, atencion };
  }, [clientesVisibles, usuarios, version]);
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 className="h1">Dashboard CEO</h1>
        <p className="sub">Los números de toda la agencia, en una pantalla.</p>
      </div>

      <div className="card" style={{ marginBottom: 22, borderColor: "var(--blue-light)" }}>
        <div style={{ padding: "16px 18px 10px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={17} style={{ color: "var(--blue)" }} />
          <div className="h2">Qué necesita mi atención</div>
          {atencion.filter((a) => a.tono === "red").length > 0 && <StatusBadge tone="red" dot>{atencion.filter((a) => a.tono === "red").length} urgentes</StatusBadge>}
        </div>
        <div>
          {atencion.length === 0 && <div className="list-row"><CheckCircle2 size={16} style={{ color: "var(--green)" }} /><span style={{ fontSize: 13.5 }}>Todo en orden. Nada pide tu atención ahora mismo.</span></div>}
          {atencion.map((a, i) => (
            <div key={i} className="list-row">
              <span style={{ width: 9, height: 9, borderRadius: 99, background: TONE[a.tono].fg, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, flex: 1, minWidth: 0 }}>{a.texto}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => go(a.to)}>{a.accion}<ChevronRight size={13} /></button>
            </div>
          ))}
        </div>
      </div>

      <SectionHead title="Números del mes" />
      <div className="grid g4" style={{ marginBottom: 22 }}>
        {metricas.map((m) => (
          <div key={m.l} className="card card-pad">
            <div className="eyebrow">{m.l}</div>
            <div className="stat-num">{m.v}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: m.t === "muted" ? "var(--muted)" : `var(--${m.t})` }}>{m.d}</div>
          </div>
        ))}
      </div>

      <SectionHead title="Salud de la cartera" action={<button className="btn btn-ghost btn-sm" onClick={() => go({ view: "clientes" })}>Ver clientes</button>} />
      <div className="card">
        {clientesVisibles.map((c) => (
          <button key={c.id} className="list-row" style={{ width: "100%", textAlign: "left" }} onClick={() => go({ view: "cliente", id: c.id })}>
            <span style={{ fontSize: 13.5, fontWeight: 600, width: 170, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</span>
            <StatusBadge tone={ESTADO_CLIENTE[c.estado].tone} dot>{ESTADO_CLIENTE[c.estado].label}</StatusBadge>
            <span className="mini" style={{ width: 70, flexShrink: 0 }}>{c.plan}</span>
            <span className="bar" style={{ flex: 1, minWidth: 60 }}>
              <span style={{ width: `${c.salud}%`, background: c.salud > 75 ? "var(--green)" : c.salud > 55 ? "var(--orange)" : "var(--red)" }} />
            </span>
            <span className="mini" style={{ width: 34, textAlign: "right", flexShrink: 0, fontWeight: 600 }}>{c.salud}%</span>
            <ChevronRight size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </>
  );
}

/* --- Clientes ----------------------------------------------------------- */
function VistaClientes() {
  const { go, perfil, clientesVisibles, crearCliente } = useApp();
  const [filtro, setFiltro] = useState("todos");
  const [q, setQ] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const puedeCrear = puede(perfil.rol, "clientes.todos");
  const lista = clientesVisibles
    .filter((c) => filtro === "todos" || c.estado === filtro)
    .filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Clientes</h1>
          <p className="sub">Cada cliente tiene su propio centro de operaciones.</p>
        </div>
        {puedeCrear && (
          <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setNuevo(true)}><Plus size={15} /> Nuevo cliente</button>
        )}
      </div>

      {!puedeCrear && (
        <div className="card card-pad" style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <ShieldCheck size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
          <span className="mini">Estás viendo únicamente las cuentas que tenés asignadas.</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {[["todos", "Todos"], ...Object.entries(ESTADO_CLIENTE).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} className={`pill ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>{l}</button>
        ))}
        <div className="searchbar" style={{ marginLeft: "auto", minWidth: 200 }}>
          <Search size={15} />
          <input className="search-input" style={{ fontSize: 13 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente" />
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="card"><Empty icon={Users} titulo="No hay clientes con ese filtro" texto="Probá con otro estado o limpiá la búsqueda." /></div>
      ) : (
        <div className="grid g3">
          {lista.map((c) => <ClientCard key={c.id} cliente={c} onOpen={(id) => go({ view: "cliente", id })} />)}
        </div>
      )}

      {nuevo && (
        <NuevoClienteModal
          onClose={() => setNuevo(false)}
          onCrear={(datos) => { const id = crearCliente(datos); setNuevo(false); go({ view: "cliente", id }); }}
        />
      )}
    </>
  );
}

function Campo({ label, children, ancho }) {
  return (
    <label style={{ display: "block", gridColumn: ancho ? "1 / -1" : "auto" }}>
      <span className="eyebrow" style={{ display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--border)",
  background: "var(--surface-2)", color: "var(--text)", fontSize: 13, outline: "none",
};

function NuevoClienteModal({ onClose, onCrear }) {
  const [f, setF] = useState({ nombre: "", industria: "", contacto: "", email: "", plan: "Growth", desde: "", responsable: "Facu", servicios: [] });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggleServicio = (s) => setF((x) => ({ ...x, servicios: x.servicios.includes(s) ? x.servicios.filter((y) => y !== s) : [...x.servicios, s] }));
  const listo = f.nombre.trim().length > 1;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div className="h2">Nuevo cliente</div>
            <div className="mini" style={{ marginTop: 2 }}>Al crearlo se arma su Client Hub y podés invitar a su equipo.</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
        </div>

        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxHeight: "56vh", overflowY: "auto" }}>
          <Campo label="Nombre de la empresa" ancho>
            <input style={inputStyle} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Empresa XYZ" autoFocus />
          </Campo>
          <Campo label="Rubro"><input style={inputStyle} value={f.industria} onChange={(e) => set("industria", e.target.value)} placeholder="Servicios B2B" /></Campo>
          <Campo label="Plan">
            <select style={inputStyle} value={f.plan} onChange={(e) => set("plan", e.target.value)}>
              {["Starter", "Growth", "Scale"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Campo>
          <Campo label="Contacto principal"><input style={inputStyle} value={f.contacto} onChange={(e) => set("contacto", e.target.value)} placeholder="Nombre y apellido" /></Campo>
          <Campo label="Email de contacto"><input style={inputStyle} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="nombre@empresa.com" /></Campo>
          <Campo label="Fecha de inicio"><input style={inputStyle} value={f.desde} onChange={(e) => set("desde", e.target.value)} placeholder="Ago 2026" /></Campo>
          <Campo label="Responsable interno">
            <select style={inputStyle} value={f.responsable} onChange={(e) => set("responsable", e.target.value)}>
              {services.usuarios.list().filter((u) => ROLES[u.rol].tipo === "interno" && u.estado === "activo").map((u) => <option key={u.id}>{u.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Servicios contratados" ancho>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["Estrategia", "Contenido", "Paid Media", "Research", "Ventas"].map((s) => (
                <button key={s} className={`pill ${f.servicios.includes(s) ? "on" : ""}`} onClick={() => toggleServicio(s)}>{s}</button>
              ))}
            </div>
          </Campo>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
          <span className="mini" style={{ flex: 1 }}>Se crea el Client Hub y queda listo para invitar al cliente.</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" disabled={!listo} style={!listo ? { opacity: .5, cursor: "not-allowed" } : undefined}
            onClick={() => listo && onCrear(f)}>Crear cliente</button>
        </div>
      </div>
    </div>
  );
}

/* --- Client Hub --------------------------------------------------------- */
const HUB_NAV = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard, solo: true },
  { id: "portal", label: "Portal del cliente", icon: Lock, solo: true },
  { g: "Estrategia", items: [
    { id: "diagnostico", label: "Diagnóstico" }, { id: "oferta", label: "Oferta" },
    { id: "posicionamiento", label: "Posicionamiento" }, { id: "arquitectura", label: "Arquitectura" }, { id: "roadmap", label: "Roadmap" }] },
  { g: "Contenido", items: [
    { id: "ideas", label: "Ideas" }, { id: "calendario", label: "Calendario" }, { id: "guiones", label: "Guiones" },
    { id: "produccion", label: "Producción" }, { id: "aprobaciones", label: "Aprobaciones" }, { id: "publicados", label: "Publicados" }] },
  { g: "Paid Media", items: [
    { id: "campanas", label: "Campañas" }, { id: "creatividades", label: "Creatividades" },
    { id: "presupuesto", label: "Presupuesto" }, { id: "resultados-ads", label: "Resultados" }, { id: "optimizaciones", label: "Optimizaciones" }] },
  { g: "Operaciones", items: [
    { id: "tareas", label: "Tareas" }, { id: "proyectos", label: "Proyectos" },
    { id: "reuniones", label: "Reuniones" }, { id: "entregables", label: "Entregables" }] },
  { g: "Resultados", items: [
    { id: "kpis", label: "KPIs" }, { id: "leads", label: "Leads" }, { id: "ventas", label: "Ventas" },
    { id: "roas", label: "ROAS" }, { id: "cac", label: "CAC" }, { id: "conversion", label: "Conversión" }] },
];

const HUB_DATA = {
  diagnostico: [{ t: "Auditoría de contenido y campañas", m: "Actualizado 04/08", e: "completada" }, { t: "Cuello de botella detectado: distribución", m: "Conclusión principal", e: "revision" }],
  oferta: [{ t: "Promesa principal en una línea", m: "Vigente desde julio", e: "completada" }, { t: "Prueba social cargada", m: "12 testimonios", e: "completada" }],
  posicionamiento: [{ t: "Territorio: autoridad técnica cercana", m: "Definido en kickoff", e: "completada" }, { t: "Tono de voz documentado", m: "Manual de marca", e: "completada" }],
  arquitectura: [{ t: "3 formatos por semana", m: "Reel, carrusel, historia", e: "completada" }, { t: "Distribución en 2 canales", m: "Instagram y web", e: "curso" }],
  roadmap: [{ t: "Fase 1 — volumen de contenido", m: "Agosto", e: "curso" }, { t: "Fase 2 — activación de paid", m: "Septiembre", e: "pendiente" }, { t: "Fase 3 — escala", m: "Octubre", e: "pendiente" }],
  ideas: [{ t: "5 errores frecuentes del rubro", m: "Aprobada", e: "completada" }, { t: "Detrás de escena del proceso", m: "En revisión", e: "revision" }, { t: "Preguntas que nos hacen siempre", m: "Nueva", e: "pendiente" }],
  calendario: [{ t: "Semana del 18/08 — 6 piezas", m: "3 publicadas", e: "curso" }, { t: "Semana del 25/08 — 6 piezas", m: "Planificada", e: "pendiente" }],
  guiones: [{ t: "Reel — objeciones de precio", m: "Nico", e: "curso" }, { t: "Carrusel — 5 errores", m: "Juli", e: "revision" }],
  produccion: [{ t: "Sesión del 14/08 — 12 piezas", m: "8 editadas", e: "curso" }, { t: "Sesión del 28/08", m: "Agendada", e: "pendiente" }],
  aprobaciones: [{ t: "Reel — objeciones de precio", m: "Enviado hace 2 días", e: "revision" }, { t: "Carrusel — 5 errores", m: "Enviado hace 2 días", e: "revision" }],
  publicados: [{ t: "Reel — cómo elegir revestimientos", m: "12/08 · 18.400 vistas", e: "completada" }, { t: "Carrusel — antes y después", m: "09/08 · 11.200 vistas", e: "completada" }],
  campanas: [{ t: "Captación showroom", m: "Activa · ROAS 4,2x", e: "curso" }, { t: "Remarketing web", m: "Activa · ROAS 6,1x", e: "curso" }],
  creatividades: [{ t: "Variante A — testimonio", m: "CTR 2,8%", e: "completada" }, { t: "Variante B — recorrido", m: "CTR 1,6%", e: "revision" }],
  presupuesto: [{ t: "Agosto", m: "USD 1.800 · 74% ejecutado", e: "curso" }, { t: "Julio", m: "USD 1.800 · cerrado", e: "completada" }],
  "resultados-ads": [{ t: "Costo por lead", m: "USD 38", e: "completada" }, { t: "Leads del mes", m: "142", e: "completada" }],
  optimizaciones: [{ t: "Subimos 20% el lookalike", m: "15/08 · sostuvo ROAS", e: "completada" }, { t: "Pausamos intereses amplios", m: "10/08 · CPL bajó", e: "completada" }],
  proyectos: [{ t: "Ecosistema de contenido agosto", m: "68% completado", e: "curso" }, { t: "Rediseño de landing", m: "En espera", e: "pendiente" }],
  reuniones: [{ t: "Reunión mensual", m: "22/08 · 15:00", e: "pendiente" }, { t: "Revisión de campaña", m: "08/08", e: "completada" }],
  entregables: [{ t: "24 piezas de agosto", m: "18 entregadas", e: "curso" }, { t: "Informe mensual", m: "31/08", e: "pendiente" }],
  archivos: [{ t: "Piezas aprobadas — agosto", m: "18 archivos", e: "completada" }, { t: "Material crudo de la sesión 14/08", m: "42 archivos", e: "completada" }, { t: "Manual de marca", m: "1 archivo", e: "completada" }],
  comunicacion: [{ t: "Devolución sobre el reel de precios", m: "Hace 2 días · María", e: "revision" }, { t: "Confirmación de la sesión del 28/08", m: "Hace 4 días · Facu", e: "completada" }],
};

function VistaClienteHub({ id, tabInicial, modoCliente = false }) {
  const { go, perfil, getCliente, accesoA, cambiarEstadoTarea, version } = useApp();
  const cliente = getCliente(id);
  const [sec, setSec] = useState(tabInicial || "resumen");
  const [abiertos, setAbiertos] = useState(["Contenido"]);
  useEffect(() => { if (tabInicial) setSec(tabInicial); }, [tabInicial]);

  /* La autorización se comprueba contra la membresía del usuario, nunca
     contra el id que venga en la ruta. La base repite este chequeo con RLS. */
  if (!accesoA(id)) return (
    <div className="card" style={{ maxWidth: 520 }}>
      <Empty icon={ShieldCheck} titulo="No tenés acceso a esta cuenta"
        texto="Esta organización no está asignada a tu usuario. Si necesitás entrar, pedile a Dirección que te sume como miembro."
        cta={puede(perfil.rol, "portal") ? undefined : "Ver mis clientes"} onCta={() => go({ view: "clientes" })} />
    </div>
  );
  if (!cliente) return <Empty icon={Users} titulo="Cliente no encontrado" texto="Volvé al listado y elegí otro." cta="Ver clientes" onCta={() => go({ view: "clientes" })} />;

  const e = ESTADO_CLIENTE[cliente.estado];
  const tareas = useMemo(() => services.tareas.byCliente(cliente.id), [cliente.id, version]);
  const contenido = useMemo(() => services.contenido.byCliente(cliente.id), [cliente.id, version]);
  const campanas = useMemo(() => services.campanas.byCliente(cliente.id), [cliente.id, version]);
  const reuniones = useMemo(() => services.reuniones.byCliente(cliente.id), [cliente.id, version]);
  const proyectos = useMemo(() => services.proyectos.byCliente(cliente.id), [cliente.id, version]);
  const equipo = services.membresias.porOrg(cliente.id);
  const toggle = (g) => setAbiertos((a) => a.includes(g) ? a.filter((x) => x !== g) : [...a, g]);

  /* El cliente ve su espacio, no la trastienda de la agencia. */
  const nav = modoCliente
    ? [...HUB_NAV.map((g) => g.solo ? g : { ...g, items: g.items.filter((i) => i.id !== "proyectos") }),
       { g: "Tu espacio", items: [{ id: "archivos", label: "Archivos" }, { id: "comunicacion", label: "Comunicación" }] }]
    : HUB_NAV;

  const contenidoSeccion = () => {
    if (sec === "resumen") return <HubResumen cliente={cliente} tareas={tareas} equipo={equipo} onGo={setSec} />;
    if (sec === "portal") return <HubPortal cliente={cliente} />;
    if (sec === "tareas") return tareas.length
      ? <div className="card">{tareas.map((t) => <TaskCard key={t.id} tarea={t} onToggle={(id) => cambiarEstadoTarea(id, t.estado === "completada" ? "curso" : "completada")} />)}</div>
      : <div className="card"><Empty icon={CheckSquare} titulo="Sin tareas abiertas" texto="Cuando se asigne trabajo para este cliente, va a aparecer acá." cta="Crear tarea" /></div>;
    if (["kpis", "leads", "ventas", "roas", "cac", "conversion"].includes(sec)) return <HubResultados cliente={cliente} foco={sec} />;

    /* Lo que ya vive en la base se lee de la base; el resto queda como
       estructura del hub hasta que le carguemos su tabla. */
    const deLaBase = {
      ideas: () => contenido.filter((c) => c.etapa === "idea"),
      guiones: () => contenido.filter((c) => c.etapa === "guion"),
      produccion: () => contenido.filter((c) => ["grabacion", "edicion"].includes(c.etapa)),
      aprobaciones: () => contenido.filter((c) => c.etapa === "aprobacion"),
      publicados: () => contenido.filter((c) => c.etapa === "publicado"),
      campanas: () => campanas,
      reuniones: () => reuniones,
      proyectos: () => proyectos,
    }[sec];

    if (deLaBase) {
      const filas = deLaBase().map((x) => ({
        t: x.titulo || x.nombre,
        m: x.publicado ? `Publicado el ${x.publicado}` : x.inicio ? new Date(x.inicio).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : x.presupuesto ? `Presupuesto USD ${Number(x.presupuesto).toLocaleString("es-AR")}` : x.formato || "—",
        e: x.estado === "activa" || x.etapa === "publicado" ? "completada" : x.etapa === "aprobacion" || x.estado === "revision" ? "revision" : x.estado === "bloqueada" ? "bloqueada" : "curso",
      }));
      if (!filas.length) return <div className="card"><Empty titulo="Todavía no hay nada acá" texto="Cuando cargues el primer registro de esta sección, lo vas a ver en esta pantalla." cta="Agregar" /></div>;
      return (
        <div className="card">
          {filas.map((r, i) => (
            <div key={i} className="list-row">
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{r.t}</span>
                <span className="mini" style={{ display: "block", marginTop: 2 }}>{r.m}</span>
              </span>
              <StatusBadge tone={ESTADOS[r.e].tone} dot>{ESTADOS[r.e].label}</StatusBadge>
            </div>
          ))}
        </div>
      );
    }

    const rows = HUB_DATA[sec];
    if (!rows) return <div className="card"><Empty titulo="Todavía no hay nada acá" texto="Cargá el primer registro de esta sección para este cliente." cta="Agregar" /></div>;
    return (
      <div className="card">
        {rows.map((r, i) => (
          <div key={i} className="list-row">
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{r.t}</span>
              <span className="mini" style={{ display: "block", marginTop: 2 }}>{r.m}</span>
            </span>
            <StatusBadge tone={ESTADOS[r.e].tone} dot>{ESTADOS[r.e].label}</StatusBadge>
          </div>
        ))}
      </div>
    );
  };

  const label = nav.flatMap((g) => g.solo ? [g] : g.items).find((i) => i.id === sec);

  return (
    <>
      {modoCliente ? (
        <div style={{ marginBottom: 18 }}>
          <h1 className="h1">Hola, {perfil.nombre} 👋</h1>
          <p className="sub">Este es el espacio de {cliente.nombre}. Acá está todo lo que estamos haciendo con tu marca.</p>
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={() => go({ view: "clientes" })} style={{ marginBottom: 16 }}><ArrowLeft size={14} /> Todos los clientes</button>
      )}

      <div className="card card-pad" style={{ marginBottom: 20, padding: 22 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <span className="area-ico" style={{ width: 52, height: 52, background: "var(--blue-soft)", color: "var(--blue)", fontSize: 18, fontWeight: 800 }}>
            {cliente.nombre.slice(0, 2).toUpperCase()}
          </span>
          <div style={{ minWidth: 200, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 className="h1" style={{ fontSize: 22 }}>{cliente.nombre}</h1>
              <StatusBadge tone={e.tone} dot>{e.label}</StatusBadge>
            </div>
            <p className="sub" style={{ maxWidth: 560 }}>{cliente.objetivo}</p>
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {[["Plan", cliente.plan], ["A cargo", cliente.responsable], ["Cliente desde", cliente.desde], ["Próxima reunión", cliente.reunion]].map(([k, v]) => (
              <div key={k}><div className="eyebrow">{k}</div><div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{v}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <nav className="card" style={{ width: 210, flexShrink: 0, padding: 8, position: "sticky", top: 22 }}>
          <button className="row-link" style={sec === "resumen" ? { background: "var(--blue-soft)", color: "var(--blue)", fontWeight: 600 } : undefined}
            onClick={() => setSec("resumen")}>
            <LayoutDashboard size={15} /> Resumen
          </button>
          {!modoCliente && (
            <button className="row-link" style={sec === "portal" ? { background: "var(--blue-soft)", color: "var(--blue)", fontWeight: 600 } : undefined}
              onClick={() => setSec("portal")}>
              <Lock size={15} /> Portal del cliente
            </button>
          )}
          {nav.filter((g) => !g.solo).map((g) => (
            <div key={g.g}>
              <button className="row-link" onClick={() => toggle(g.g)} style={{ fontWeight: 600, fontSize: 12.5 }}>
                <span style={{ textTransform: "uppercase", letterSpacing: ".5px", fontSize: 10.5, color: "var(--muted)" }}>{g.g}</span>
                <ChevronDown size={13} style={{ marginLeft: "auto", color: "var(--muted)", transform: abiertos.includes(g.g) ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>
              {abiertos.includes(g.g) && (
                <div style={{ paddingLeft: 8 }}>
                  {g.items.map((it) => (
                    <button key={it.id} className="row-link" style={{ fontSize: 12.5, padding: "6px 9px", ...(sec === it.id ? { background: "var(--blue-soft)", color: "var(--blue)", fontWeight: 600 } : {}) }}
                      onClick={() => setSec(it.id)}>{it.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div style={{ flex: 1, minWidth: 280 }}>
          {sec !== "resumen" && <SectionHead title={label ? label.label : sec} />}
          {contenidoSeccion()}
        </div>
      </div>
    </>
  );
}

function HubResumen({ cliente, tareas, equipo = [], onGo }) {
  const k = cliente.kpis;
  return (
    <>
      <div className="grid g3" style={{ marginBottom: 18 }}>
        {[["Leads", k.leads, UserPlus], ["Ventas atribuidas", k.ventas, DollarSign], ["ROAS", k.roas, TrendingUp]].map(([l, v, I]) => (
          <div key={l} className="card card-pad" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="stat-ico" style={{ width: 40, height: 40, background: "var(--blue-soft)", color: "var(--blue)" }}><I size={18} /></span>
            <div><div className="eyebrow">{l}</div><div className="stat-num" style={{ fontSize: 20 }}>{v}</div></div>
          </div>
        ))}
      </div>

      <div className="grid g2">
        <div className="card">
          <div style={{ padding: "15px 16px 8px", display: "flex", alignItems: "center" }}>
            <div className="eyebrow">Tareas del cliente</div>
            <button className="mini" style={{ marginLeft: "auto", color: "var(--blue)", fontWeight: 600 }} onClick={() => onGo("tareas")}>Ver todas</button>
          </div>
          {tareas.length === 0 ? <Empty icon={CheckSquare} titulo="Sin tareas abiertas" texto="Todo al día por acá." />
            : tareas.slice(0, 4).map((t) => (
              <div key={t.id} className="list-row" style={{ padding: "11px 16px" }}>
                <span style={{ minWidth: 0, flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titulo}</span>
                <StatusBadge tone={ESTADOS[t.estado].tone} dot>{ESTADOS[t.estado].label}</StatusBadge>
              </div>
            ))}
        </div>

        <div className="card">
          <div style={{ padding: "15px 16px 8px" }}><div className="eyebrow">Salud de la cuenta</div></div>
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="stat-num" style={{ fontSize: 30 }}>{cliente.salud}%</span>
              <span className="mini">de indicadores en verde</span>
            </div>
            <span className="bar" style={{ display: "block", marginTop: 10 }}>
              <span style={{ width: `${cliente.salud}%`, background: cliente.salud > 75 ? "var(--green)" : cliente.salud > 55 ? "var(--orange)" : "var(--red)" }} />
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
              {[["CAC", cliente.kpis.cac], ["Conversión", cliente.kpis.conversion], ["Proyectos", String(cliente.proyectos)], ["Plan", cliente.plan]].map(([a, b]) => (
                <div key={a}><div className="eyebrow">{a}</div><div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{b}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {equipo.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ padding: "15px 16px 8px" }}>
            <div className="eyebrow">Quiénes trabajan en esta cuenta</div>
          </div>
          <div style={{ padding: "0 8px 10px" }}>
            {equipo.map((m) => (
              <div key={m.id} className="row-link" style={{ cursor: "default" }}>
                <span className="avatar" style={{ width: 26, height: 26, fontSize: 10,
                  background: ROLES[m.perfil.rol].tipo === "cliente" ? "linear-gradient(150deg,#94A3B8,#5F6673)" : undefined }}>
                  {m.perfil.nombre[0]}{m.perfil.apellido[0]}
                </span>
                <span style={{ fontSize: 13 }}>{m.perfil.nombre} {m.perfil.apellido}</span>
                <span style={{ marginLeft: "auto" }}>
                  <StatusBadge tone={ROLES[m.perfil.rol].tipo === "cliente" ? "gray" : "blue"}>{m.rolOrg}</StatusBadge>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function HubResultados({ cliente, foco }) {
  const k = cliente.kpis;
  const items = [["Leads", k.leads, "leads"], ["Ventas", k.ventas, "ventas"], ["ROAS", k.roas, "roas"], ["CAC", k.cac, "cac"], ["Conversión", k.conversion, "conversion"]];
  return (
    <div className="grid g3">
      {items.map(([l, v, id]) => (
        <div key={id} className="card card-pad" style={foco === id ? { borderColor: "var(--blue)" } : undefined}>
          <div className="eyebrow">{l}</div>
          <div className="stat-num">{v}</div>
          <div className="mini">Mes en curso</div>
        </div>
      ))}
    </div>
  );
}

/* --- Área y submódulos -------------------------------------------------- */
function VistaArea({ id }) {
  const { go } = useApp();
  const area = AREAS.find((a) => a.id === id);
  if (!area) return null;
  const t = TONE[area.tone];
  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
        <span className="area-ico" style={{ width: 50, height: 50, background: t.fg, color: "#fff" }}><area.icon size={23} /></span>
        <div>
          <h1 className="h1">{area.name}</h1>
          <p className="sub">{area.desc}</p>
        </div>
      </div>
      <SectionHead title={`${itemsDeArea(area).length} etapas`} />
      <div className="grid g3">
        {itemsDeArea(area).map((it) => (
          <button key={it.id} className="card card-pad card-hover" style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}
            onClick={() => go(it.slug ? { view: "subarea", slug: it.slug } : it.view ? { view: it.view } : { view: "sub", areaId: area.id, subId: it.id })}>
            <span className="stat-ico" style={{ width: 40, height: 40, background: t.bg, color: t.fg }}><it.icon size={18} /></span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{it.name}</span>
              <span className="mini" style={{ display: "block", marginTop: 2 }}>{area.name}</span>
            </span>
            <ChevronRight size={16} style={{ color: "var(--muted)" }} />
          </button>
        ))}
      </div>
    </>
  );
}

function VistaSubmodulo({ areaId, subId }) {
  const { go } = useApp();
  const area = AREAS.find((a) => a.id === areaId);
  const sub = area?.items.find((i) => i.id === subId);
  const data = services.modulos.get(areaId, subId);
  if (!area || !sub) return null;
  const t = TONE[area.tone];

  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
        <span className="area-ico" style={{ background: t.bg, color: t.fg }}><sub.icon size={20} /></span>
        <div>
          <h1 className="h1" style={{ fontSize: 22 }}>{sub.name}</h1>
          <p className="sub">{area.name} · {area.desc}</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }}><Plus size={15} /> Agregar</button>
      </div>

      {!data ? (
        <div className="card">
          <Empty titulo="Todavía no hay nada acá" texto={`Cuando cargues el primer registro de ${sub.name.toLowerCase()}, lo vas a ver en esta pantalla.`} cta="Cargar el primero" />
        </div>
      ) : (
        <div className="card">
          <div className="list-row" style={{ background: "var(--surface-2)", padding: "10px 16px" }}>
            <span className="eyebrow" style={{ flex: 1 }}>{data.col}</span>
            <span className="eyebrow" style={{ width: 110, textAlign: "right" }}>Estado</span>
            <span className="eyebrow" style={{ width: 120, textAlign: "right" }}>Detalle</span>
          </div>
          {data.rows.map((r, i) => (
            <div key={i} className="list-row">
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 500 }}>{r.t}</span>
                <span className="mini" style={{ display: "block", marginTop: 2 }}>{r.meta}</span>
              </span>
              <span style={{ width: 110, textAlign: "right", flexShrink: 0 }}>
                <StatusBadge tone={ESTADOS[r.estado].tone} dot>{ESTADOS[r.estado].label}</StatusBadge>
              </span>
              <span style={{ width: 120, textAlign: "right", flexShrink: 0, fontSize: 13, fontWeight: 600 }}>{r.extra}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <SectionHead title="Relacionado" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {area.items.filter((i) => i.id !== subId).slice(0, 5).map((i) => (
            <button key={i.id} className="pill" onClick={() => go(i.view ? { view: i.view } : { view: "sub", areaId, subId: i.id })}>
              <i.icon size={14} />{i.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* --- Procesos ----------------------------------------------------------- */
function VistaProcesos() {
  const { go } = useApp();
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 className="h1">Procesos</h1>
        <p className="sub">Cómo se hace cada cosa, etapa por etapa.</p>
      </div>
      <div className="grid g3">
        {services.procesos.list().map((p) => {
          const t = TONE[p.tone];
          return (
            <button key={p.id} className="card card-pad card-hover" style={{ textAlign: "left" }} onClick={() => go({ view: "proceso", id: p.id })}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="area-ico" style={{ background: t.fg, color: "#fff" }}><Route size={19} /></span>
                <div style={{ minWidth: 0 }}>
                  <div className="h3">{p.nombre}</div>
                  <div className="mini" style={{ marginTop: 2 }}>{p.area} · {p.etapas.length} etapas</div>
                </div>
              </div>
              <p className="mini" style={{ marginTop: 12, lineHeight: 1.55 }}>{p.desc}</p>
              <div style={{ display: "flex", gap: 4, marginTop: 14, flexWrap: "wrap" }}>
                {p.etapas.slice(0, 5).map((e) => <span key={e.n} className="badge" style={{ background: "var(--bg)", color: "var(--muted)", fontSize: 10.5 }}>{e.nombre}</span>)}
                {p.etapas.length > 5 && <span className="badge" style={{ background: "var(--bg)", color: "var(--muted)", fontSize: 10.5 }}>+{p.etapas.length - 5}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function VistaProceso({ id }) {
  const { go } = useApp();
  const proceso = services.procesos.get(id);
  const [sel, setSel] = useState(0);
  if (!proceso) return null;
  const et = proceso.etapas[sel];
  const t = TONE[proceso.tone];

  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={() => go({ view: "procesos" })} style={{ marginBottom: 16 }}><ArrowLeft size={14} /> Todos los procesos</button>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
        <span className="area-ico" style={{ width: 50, height: 50, background: t.fg, color: "#fff" }}><Route size={22} /></span>
        <div>
          <h1 className="h1">{proceso.nombre}</h1>
          <p className="sub">{proceso.desc}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 300, flexShrink: 0 }}>
          <SectionHead title={`${proceso.etapas.length} etapas`} />
          {proceso.etapas.map((e, i) => (
            <React.Fragment key={e.n}>
              {i > 0 && <div className="step-line" />}
              <ProcessStep etapa={e} active={i === sel} onClick={() => setSel(i)} />
            </React.Fragment>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="card" style={{ position: "sticky", top: 22 }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="step-n" style={{ background: "var(--blue)", color: "#fff" }}>{et.n}</span>
                <div>
                  <div className="h2">{et.nombre}</div>
                  <div className="mini" style={{ marginTop: 2 }}>Responsable: {et.responsable}</div>
                </div>
              </div>
              <div className="grid g2" style={{ marginTop: 18, gap: 14 }}>
                <div><div className="eyebrow">Qué entra</div><div style={{ fontSize: 13.2, marginTop: 4, lineHeight: 1.5 }}>{et.entra}</div></div>
                <div><div className="eyebrow">Qué sale</div><div style={{ fontSize: 13.2, marginTop: 4, lineHeight: 1.5 }}>{et.sale}</div></div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="eyebrow">Herramientas</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {et.herramientas.map((h) => <StatusBadge key={h} tone="gray">{h}</StatusBadge>)}
                </div>
              </div>
            </div>
            <hr className="divider" />
            <div style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Checklist</div>
              {et.checklist.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
                  <Circle size={15} style={{ color: "var(--border-strong)", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13.2, lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>
            {(et.sop || et.auto) && <hr className="divider" />}
            <div style={{ padding: et.sop || et.auto ? 20 : 0, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {et.sop && (
                <button className="btn btn-ghost btn-sm" onClick={() => go({ view: "sop", id: et.sop })}>
                  <ListChecks size={14} /> Ver SOP completo
                </button>
              )}
              {et.auto && (
                <span className="badge" style={{ background: "var(--violet-soft)", color: "var(--violet)", padding: "7px 11px" }}>
                  <Zap size={13} /> {et.auto}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* --- Tareas ------------------------------------------------------------- */
function VistaTareas() {
  const { cambiarEstadoTarea, version } = useApp();
  const tareas = useMemo(() => services.tareas.list(), [version]);
  const [estado, setEstado] = useState("abiertas");
  const [q, setQ] = useState("");

  const toggle = (id) => {
    const t = tareas.find((x) => x.id === id);
    cambiarEstadoTarea(id, t.estado === "completada" ? "curso" : "completada");
  };

  const lista = tareas
    .filter((t) => estado === "todas" ? true : estado === "abiertas" ? t.estado !== "completada" : t.estado === estado)
    .filter((t) => t.titulo.toLowerCase().includes(q.toLowerCase()));

  const conteo = (k) => tareas.filter((t) => k === "abiertas" ? t.estado !== "completada" : t.estado === k).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Tareas</h1>
          <p className="sub">Lo que hay que hacer, sin vueltas.</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }}><Plus size={15} /> Nueva tarea</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button className={`pill ${estado === "abiertas" ? "on" : ""}`} onClick={() => setEstado("abiertas")}>Abiertas · {conteo("abiertas")}</button>
        {Object.entries(ESTADOS).map(([k, v]) => (
          <button key={k} className={`pill ${estado === k ? "on" : ""}`} onClick={() => setEstado(k)}>{v.label} · {conteo(k)}</button>
        ))}
        <button className={`pill ${estado === "todas" ? "on" : ""}`} onClick={() => setEstado("todas")}>Todas</button>
        <div className="searchbar" style={{ marginLeft: "auto", minWidth: 190 }}>
          <Search size={15} />
          <input className="search-input" style={{ fontSize: 13 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar tarea" />
        </div>
      </div>

      <div className="card">
        {lista.length === 0
          ? <Empty icon={CheckCircle2} titulo="Todo en orden" texto="No hay tareas que coincidan con este filtro." />
          : lista.map((t) => <TaskCard key={t.id} tarea={t} onToggle={toggle} />)}
      </div>
    </>
  );
}

/* --- Calendario --------------------------------------------------------- */
function VistaCalendario() {
  const { now } = useApp();
  const [filtro, setFiltro] = useState("todos");
  const year = now.getFullYear(), month = now.getMonth();
  const primero = new Date(year, month, 1);
  const offset = (primero.getDay() + 6) % 7; // lunes primero
  const dias = new Date(year, month + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= dias; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const eventos = services.eventos.list().filter((e) => filtro === "todos" || e.tipo === filtro);
  const mes = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Calendario</h1>
          <p className="sub" style={{ textTransform: "capitalize" }}>{mes}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button className={`pill ${filtro === "todos" ? "on" : ""}`} onClick={() => setFiltro("todos")}>Todos</button>
        {Object.entries(TIPO_EVENTO).map(([k, v]) => (
          <button key={k} className={`pill ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: TONE[v.tone].fg }} />{v.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div className="cal">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => <div key={d} className="cal-h">{d}</div>)}
          {celdas.map((d, i) => {
            const evs = d ? eventos.filter((e) => e.d === d) : [];
            const hoy = d === now.getDate();
            return (
              <div key={i} className={`cal-d ${d ? "" : "off"}`}>
                {d && <span className={`cal-n ${hoy ? "today" : ""}`}>{d}</span>}
                {evs.map((e, j) => {
                  const t = TONE[TIPO_EVENTO[e.tipo].tone];
                  return <span key={j} className="ev" style={{ background: t.bg, color: t.fg }} title={`${e.h} · ${e.t}`}>{e.h} {e.t}</span>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* --- Herramientas ------------------------------------------------------- */
function VistaHerramientas() {
  const { tools, abrirTool, go } = useApp();
  const sinUrl = tools.filter((t) => !t.url).length;
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Herramientas</h1>
          <p className="sub">Todo lo que usamos a diario, a un clic.</p>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: "auto" }} onClick={() => go({ view: "config" })}><Settings size={15} /> Configurar enlaces</button>
      </div>

      {sinUrl > 0 && (
        <div className="card card-pad" style={{ marginBottom: 18, display: "flex", gap: 11, alignItems: "center", borderColor: "var(--orange)", background: "var(--orange-soft)" }}>
          <AlertCircle size={17} style={{ color: "var(--orange)", flexShrink: 0 }} />
          <span style={{ fontSize: 13.2, flex: 1 }}>
            {sinUrl} {sinUrl === 1 ? "herramienta todavía no tiene enlace cargado" : "herramientas todavía no tienen enlace cargado"}. Cargalos en Configuración y se abren desde acá.
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => go({ view: "config" })}>Cargar enlaces</button>
        </div>
      )}

      <div className="grid g3">
        {tools.map((t) => <ToolCard key={t.id} tool={t} onOpen={abrirTool} />)}
      </div>
    </>
  );
}

/* --- Biblioteca --------------------------------------------------------- */
function VistaBiblioteca() {
  const { go } = useApp();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");

  const sops = services.sops.list().map((s) => ({ id: s.id, nombre: s.nombre, tipo: "SOP", area: s.area, to: { view: "sop", id: s.id } }));
  const procesos = services.procesos.list().map((p) => ({ id: p.id, nombre: p.nombre, tipo: "Proceso", area: p.area, to: { view: "proceso", id: p.id } }));
  const prompts = services.prompts.list().map((p) => ({ id: p.id, nombre: p.nombre, tipo: "Prompt", area: p.cat, to: { view: "prompts" } }));
  const otros = services.biblioteca.list().map((b) => ({ ...b, to: null }));
  const todo = [...sops, ...procesos, ...prompts, ...otros];
  const tipos = ["todos", ...Array.from(new Set(todo.map((x) => x.tipo)))];

  const lista = todo
    .filter((x) => tipo === "todos" || x.tipo === tipo)
    .filter((x) => (x.nombre + " " + x.area).toLowerCase().includes(q.toLowerCase()));

  const ICONO = { SOP: ListChecks, Proceso: Route, Prompt: Sparkles, Template: Paperclip, Manual: BookOpen, Formación: Play, Checklist: ListChecks };

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <h1 className="h1">Biblioteca</h1>
        <p className="sub">Todo el conocimiento de la agencia, buscable.</p>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18, display: "flex", gap: 11, alignItems: "center" }}>
        <Search size={18} style={{ color: "var(--muted)" }} />
        <input className="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en toda la biblioteca…" />
        {q && <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setQ("")}><X size={15} /></button>}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tipos.map((t) => (
          <button key={t} className={`pill ${tipo === t ? "on" : ""}`} onClick={() => setTipo(t)}>{t === "todos" ? "Todo" : t}</button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="card"><Empty icon={BookOpen} titulo="Nada con ese nombre" texto="Probá con otra palabra, o buscá por área: Contenido, Paid Media, Ventas." /></div>
      ) : (
        <div className="grid g2">
          {lista.map((x) => {
            const I = ICONO[x.tipo] || FileText;
            return (
              <button key={x.tipo + x.id} className="card card-pad card-hover" style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}
                onClick={() => x.to && go(x.to)}>
                <span className="stat-ico" style={{ width: 38, height: 38, background: "var(--blue-soft)", color: "var(--blue)" }}><I size={17} /></span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.7, fontWeight: 600 }}>{x.nombre}</span>
                  <span className="mini" style={{ display: "block", marginTop: 2 }}>{x.tipo} · {x.area}</span>
                </span>
                {x.to && <ChevronRight size={16} style={{ color: "var(--muted)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* --- Prompts ------------------------------------------------------------ */
function VistaPrompts() {
  const [cat, setCat] = useState("todas");
  const [abierto, setAbierto] = useState(null);
  const cats = ["todas", ...Array.from(new Set(PROMPTS.map((p) => p.cat)))];
  const lista = PROMPTS.filter((p) => cat === "todas" || p.cat === cat);

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <h1 className="h1">Prompts</h1>
        <p className="sub">Los prompts que ya sabemos que funcionan. Copiá y usá.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map((c) => <button key={c} className={`pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c === "todas" ? "Todas" : c}</button>)}
      </div>

      <div className="grid g2">
        {lista.map((p) => (
          <div key={p.id} className="card card-pad">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="stat-ico" style={{ width: 38, height: 38, background: "var(--violet-soft)", color: "var(--violet)" }}><Sparkles size={17} /></span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="h3">{p.nombre}</div>
                <div className="mini" style={{ marginTop: 2 }}>{p.cat} · {p.herramienta}</div>
              </div>
            </div>
            <p className="mini" style={{ marginTop: 11, lineHeight: 1.55 }}>{p.objetivo}</p>
            {abierto === p.id && <div className="code" style={{ marginTop: 12 }}>{p.prompt}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                <Eye size={14} />{abierto === p.id ? "Ocultar" : "Ver prompt"}
              </button>
              <CopyButton text={p.prompt} label="Copiar prompt" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* --- Automatizaciones --------------------------------------------------- */
function VistaAutomatizaciones() {
  const [sel, setSel] = useState(AUTOMATIZACIONES[0].id);
  const a = AUTOMATIZACIONES.find((x) => x.id === sel);
  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <h1 className="h1">Automatizaciones</h1>
        <p className="sub">Lo que el sistema hace solo, mientras el equipo hace otra cosa.</p>
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {AUTOMATIZACIONES.map((x) => (
            <button key={x.id} className="card card-pad" onClick={() => setSel(x.id)}
              style={{ textAlign: "left", borderColor: sel === x.id ? "var(--blue)" : "var(--border)", padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="stat-ico" style={{ width: 32, height: 32, background: "var(--violet-soft)", color: "var(--violet)" }}><Zap size={15} /></span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.3, fontWeight: 600 }}>{x.nombre}</span>
                  <span className="mini" style={{ display: "block", marginTop: 2 }}>{x.corridas}</span>
                </span>
                <StatusBadge tone={x.estado === "activa" ? "green" : "gray"} dot>{x.estado === "activa" ? "Activa" : "Pausada"}</StatusBadge>
              </div>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="card card-pad" style={{ padding: 22 }}>
            <div className="h2">{a.nombre}</div>
            <p className="sub" style={{ maxWidth: 520 }}>{a.desc}</p>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column" }}>
              {a.pasos.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="step-line" style={{ height: 18 }} />}
                  <div className="step" style={{ cursor: "default" }}>
                    <span className="step-n" style={{
                      background: p.tipo === "Disparador" ? "var(--violet)" : "var(--blue-soft)",
                      color: p.tipo === "Disparador" ? "#fff" : "var(--blue)" }}>
                      {p.tipo === "Disparador" ? <Zap size={15} /> : String(i).padStart(2, "0")}
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span className="eyebrow" style={{ display: "block", fontSize: 9.5 }}>{p.tipo}</span>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{p.t}</span>
                      <span className="mini" style={{ display: "block", marginTop: 2 }}>{p.d}</span>
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* --- Configuración ------------------------------------------------------ */
function VistaConfig() {
  const { tools, setTools, quick, setQuick, perfil, verComo, setVerComo, salir, dark, setDark } = useApp();
  const admin = puede(perfil.rol, "config");
  const [tab, setTab] = useState(admin ? "herramientas" : "cuenta");
  const [cambiando, setCambiando] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [resultado, setResultado] = useState(null);

  const guardarContrasena = async () => {
    if (pass1.length < 8) return setResultado({ ok: false, msg: "Tiene que tener al menos 8 caracteres." });
    if (pass1 !== pass2) return setResultado({ ok: false, msg: "Las dos no coinciden." });
    const { error } = await auth.cambiarContrasena(pass1);
    if (error) return setResultado({ ok: false, msg: error });
    setResultado({ ok: true, msg: "Listo. La próxima vez entrás con la nueva." });
    setCambiando(false); setPass1(""); setPass2("");
  };

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <h1 className="h1">Configuración</h1>
        <p className="sub">Enlaces de herramientas, accesos rápidos y rol de usuario.</p>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {(admin ? [["herramientas", "Herramientas"], ["accesos", "Accesos rápidos"], ["cuenta", "Mi cuenta"]] : [["cuenta", "Mi cuenta"]]).map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "herramientas" && (
        <div style={{ maxWidth: 760 }}>
          <p className="mini" style={{ marginBottom: 14, lineHeight: 1.55 }}>
            Pegá el enlace exacto de cada herramienta (por ejemplo, la cuenta publicitaria específica que usás). El sistema no inventa direcciones: abre lo que cargues acá.
          </p>
          <div className="card">
            {tools.map((t) => (
              <div key={t.id} className="list-row">
                <span style={{ width: 30, height: 30, borderRadius: 8, background: t.color, color: "#fff", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{t.letra}</span>
                <span style={{ width: 168, flexShrink: 0, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13.3, fontWeight: 600 }}>{t.nombre}</span>
                  <span className="mini" style={{ display: "block" }}>{t.desc}</span>
                </span>
                <input value={t.url} placeholder="Pegá el enlace acá"
                  onChange={(e) => setTools((ts) => ts.map((x) => x.id === t.id ? { ...x, url: e.target.value } : x))}
                  style={{ flex: 1, minWidth: 120, padding: "8px 11px", borderRadius: 9, border: "1px solid var(--border)",
                    background: "var(--surface-2)", color: "var(--text)", fontSize: 12.5, outline: "none" }} />
                {t.url ? <StatusBadge tone="green" dot>Listo</StatusBadge> : <StatusBadge tone="gray">Sin cargar</StatusBadge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "accesos" && (
        <div style={{ maxWidth: 620 }}>
          <p className="mini" style={{ marginBottom: 14 }}>Elegí qué aparece en Accesos rápidos, en la pantalla de inicio.</p>
          <div className="card">
            {quick.map((q) => (
              <div key={q.id} className="list-row">
                <q.icon size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{q.nombre}</span>
                <button className={`pill ${q.on ? "on" : ""}`} onClick={() => setQuick((qs) => qs.map((x) => x.id === q.id ? { ...x, on: !x.on } : x))}>
                  {q.on ? <><Check size={13} /> Visible</> : "Oculto"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cuenta" && (
        <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card card-pad" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span className="avatar" style={{ width: 46, height: 46, fontSize: 16 }}>{perfil.nombre[0]}{perfil.apellido[0]}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="h3">{perfil.nombre} {perfil.apellido}</div>
              <div className="mini" style={{ marginTop: 2 }}>{perfil.email} · {ROLES[perfil.rol].label}</div>
            </div>
            <StatusBadge tone={perfil.estado === "activo" ? "green" : "gray"} dot>{perfil.estado === "activo" ? "Activa" : "Inactiva"}</StatusBadge>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 4 }}>Contraseña</div>
            <p className="mini" style={{ marginBottom: 12, lineHeight: 1.55 }}>
              La contraseña la maneja Supabase Auth: nosotros nunca la guardamos ni la vemos.
            </p>
            {!cambiando ? (
              <button className="btn btn-ghost btn-sm" onClick={() => { setCambiando(true); setResultado(null); }}>
                Cambiar contraseña
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 11, maxWidth: 340 }}>
                <Campo label="Nueva contraseña">
                  <input style={inputStyle} type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} autoFocus />
                </Campo>
                <Campo label="Repetila">
                  <input style={inputStyle} type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
                </Campo>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={guardarContrasena}>Guardar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setCambiando(false); setPass1(""); setPass2(""); }}>Cancelar</button>
                </div>
              </div>
            )}
            {resultado && (
              <div className="mini" style={{ marginTop: 10, fontWeight: 600, color: resultado.ok ? "var(--green)" : "var(--red)" }}>
                {resultado.msg}
              </div>
            )}
          </div>

          {puede(perfil.rol, "*") && (
            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 4 }}>Ver el sistema como</div>
              <p className="mini" style={{ marginBottom: 12, lineHeight: 1.55 }}>
                Simulá cualquier rol para revisar qué ve cada persona. Es solo visual: no cambia tus permisos reales ni los datos que la base te deja consultar.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(ROLES).map(([k, r]) => (
                  <button key={k} className={`pill ${(verComo || perfil.rol) === k ? "on" : ""}`} onClick={() => setVerComo(k === perfil.rol ? null : k)}>{r.label}</button>
                ))}
              </div>
            </div>
          )}
          <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="h3">Modo oscuro</div>
              <div className="mini" style={{ marginTop: 2 }}>Mismo sistema visual, menos luz.</div>
            </div>
            <button className={`pill ${dark ? "on" : ""}`} onClick={() => setDark(!dark)}>{dark ? <><Moon size={13} /> Activado</> : <><Sun size={13} /> Desactivado</>}</button>
          </div>
          <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="h3">Cerrar sesión</div>
              <div className="mini" style={{ marginTop: 2 }}>Se cierra en este dispositivo.</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={salir}>Cerrar sesión</button>
          </div>
        </div>
      )}
    </>
  );
}

/* --- Portal del cliente -------------------------------------------------
   El cliente ve el recorrido completo desde el primer día: sabe dónde está,
   qué ya hicimos y qué viene después. Los candados son reales: el contenido
   de un módulo cerrado ni siquiera llega a su navegador (lo frena RLS).   */
function VistaPortalCliente() {
  const { perfil, mostrar } = useApp();
  const misOrgs = services.membresias.porUsuario(perfil.id);
  const [orgId, setOrgId] = useState(misOrgs[0]?.org.id || null);
  const [abierto, setAbierto] = useState(null);

  if (!orgId) return (
    <div className="card" style={{ maxWidth: 520 }}>
      <Empty icon={Building2} titulo="Tu cuenta todavía no está vinculada"
        texto="Tu usuario existe, pero no está asociado a ninguna organización. Escribinos y lo resolvemos en el día." />
    </div>
  );

  const cliente = services.clientes.get(orgId);
  const modulos = services.modulosCliente.byOrg(orgId);
  const grupos = [...new Set(modulos.map((m) => m.grupo))];
  const listos = modulos.filter((m) => m.estado === "disponible").length;
  const pct = modulos.length ? Math.round((listos / modulos.length) * 100) : 0;
  const pendientesDeEl = modulos.filter((m) => m.requiereCliente && m.estado === "disponible");

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 className="h1">Hola, {perfil.nombre} 👋</h1>
        <p className="sub">Este es el espacio de {cliente?.nombre}. Acá está todo lo que estamos haciendo con tu marca.</p>
      </div>

      {misOrgs.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {misOrgs.map((m) => (
            <button key={m.org.id} className={`pill ${orgId === m.org.id ? "on" : ""}`}
              onClick={() => { setOrgId(m.org.id); setAbierto(null); }}>{m.org.nombre}</button>
          ))}
        </div>
      )}

      {pendientesDeEl.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 18, borderColor: "var(--blue-light)", background: "var(--blue-soft)" }}>
          <div style={{ display: "flex", gap: 11, alignItems: "center", flexWrap: "wrap" }}>
            <Flag size={17} style={{ color: "var(--blue)", flexShrink: 0 }} />
            <span style={{ fontSize: 13.4, flex: 1, minWidth: 200 }}>
              {pendientesDeEl.length === 1
                ? `Necesitamos algo de tu lado: ${pendientesDeEl[0].nombre.toLowerCase()}.`
                : `Necesitamos ${pendientesDeEl.length} cosas de tu lado para poder avanzar.`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => setAbierto(pendientesDeEl[0].id)}>
              Ver qué falta
            </button>
          </div>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          <div className="eyebrow">Tu proceso con nosotros</div>
          <span className="mini" style={{ marginLeft: "auto" }}>{listos} de {modulos.length} etapas abiertas</span>
        </div>
        <span className="bar" style={{ display: "block" }}>
          <span style={{ width: `${pct}%` }} />
        </span>
      </div>

      {grupos.map((g) => (
        <div key={g} style={{ marginBottom: 22 }}>
          <SectionHead title={g} />
          <div className="grid g3">
            {modulos.filter((m) => m.grupo === g).map((m) => {
              const e = ESTADOS_MODULO[m.estado] || ESTADOS_MODULO.bloqueado;
              const cerrado = m.estado === "bloqueado";
              return (
                <button key={m.id} className="card card-pad card-hover" onClick={() => !cerrado && setAbierto(m.id)}
                  style={{ textAlign: "left", opacity: cerrado ? .62 : 1, cursor: cerrado ? "default" : "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <span className="stat-ico" style={{ width: 34, height: 34, background: TONE[e.tone].bg, color: TONE[e.tone].fg }}>
                      <e.icon size={16} />
                    </span>
                    <StatusBadge tone={e.tone} dot>{e.label}</StatusBadge>
                  </div>
                  <div className="h3">{m.nombre}</div>
                  <div className="mini" style={{ marginTop: 4, lineHeight: 1.5 }}>{m.descripcion}</div>
                  {m.requiereCliente && !cerrado && (
                    <div className="mini" style={{ marginTop: 8, color: "var(--blue)", fontWeight: 600 }}>Necesitamos algo tuyo</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {abierto && <ModuloClienteModal moduloId={abierto} onClose={() => setAbierto(null)} onAviso={mostrar} />}
    </>
  );
}

function ModuloClienteModal({ moduloId, onClose, onAviso }) {
  const m = services.modulosCliente.get(moduloId);
  const bloques = services.contenidoModulo.byModulo(moduloId);
  if (!m) return null;
  const e = ESTADOS_MODULO[m.estado] || ESTADOS_MODULO.bloqueado;

  return (
    <div className="overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <StatusBadge tone={e.tone} dot>{e.label}</StatusBadge>
            <div className="h2" style={{ marginTop: 7 }}>{m.nombre}</div>
            <div className="mini" style={{ marginTop: 3 }}>{m.descripcion}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
        </div>

        <div style={{ padding: 20, maxHeight: "56vh", overflowY: "auto" }}>
          {m.accionTexto && (
            <button className="btn btn-primary" style={{ width: "100%", marginBottom: bloques.length ? 18 : 0 }}
              onClick={() => {
                if (!m.accionUrl) { onAviso("Todavía estamos preparando este paso. Te avisamos apenas esté listo."); return; }
                window.open(m.accionUrl, "_blank", "noopener,noreferrer");
              }}>
              <ExternalLink size={15} /> {m.accionTexto}
            </button>
          )}

          {bloques.length === 0 ? (
            <Empty icon={Clock} titulo="Estamos preparando esta parte"
              texto="Cuando esté lista la vas a ver acá, y te avisamos." />
          ) : bloques.map((b) => (
            <div key={b.id} style={{ marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 5 }}>{b.bloque}</div>
              <p style={{ fontSize: 13.6, lineHeight: 1.65, margin: 0 }}>{b.cuerpo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Administración (solo CEO / Admin) ---------------------------------- */
function VistaAdmin() {
  const { perfil, go, invitaciones, invitar, usuarios, clientesVisibles, cambiarEstadoUsuario, cambiarRolUsuario } = useApp();
  const [tab, setTab] = useState("usuarios");
  const [invitando, setInvitando] = useState(false);

  if (!puede(perfil.rol, "admin")) return (
    <div className="card" style={{ maxWidth: 520 }}>
      <Empty icon={ShieldCheck} titulo="Esta sección es de Dirección"
        texto="Administración maneja usuarios, organizaciones y permisos. Tu rol no tiene acceso." cta="Volver al inicio" onCta={() => go({ view: "inicio" })} />
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Administración</h1>
          <p className="sub">Quién entra, a qué organización y con qué permisos.</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setInvitando(true)}><Plus size={15} /> Invitar usuario</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["usuarios", `Usuarios · ${usuarios.length}`], ["organizaciones", "Organizaciones"], ["roles", "Roles y permisos"],
          ["invitaciones", `Invitaciones · ${invitaciones.filter((i) => i.estado === "pendiente").length}`]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "usuarios" && (
        <div className="card">
          <div className="list-row" style={{ background: "var(--surface-2)", padding: "10px 16px" }}>
            <span className="eyebrow" style={{ flex: 1 }}>Persona</span>
            <span className="eyebrow" style={{ width: 140 }}>Rol</span>
            <span className="eyebrow" style={{ width: 150 }}>Organizaciones</span>
            <span className="eyebrow" style={{ width: 110, textAlign: "right" }}>Último acceso</span>
            <span className="eyebrow" style={{ width: 96, textAlign: "right" }}>Estado</span>
          </div>
          {usuarios.map((u) => {
            const orgs = services.membresias.porUsuario(u.id);
            return (
              <div key={u.id} className="list-row" style={{ opacity: u.estado === "activo" ? 1 : .55 }}>
                <span className="avatar" style={{ width: 32, height: 32, flexShrink: 0,
                  background: ROLES[u.rol].tipo === "cliente" ? "linear-gradient(150deg,#94A3B8,#5F6673)" : undefined }}>
                  {u.nombre[0]}{u.apellido[0]}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{u.nombre} {u.apellido}</span>
                  <span className="mini" style={{ display: "block", marginTop: 2 }}>{u.email}</span>
                </span>
                <span style={{ width: 140, flexShrink: 0 }}>
                  <select value={u.rol} onChange={(e) => cambiarRolUsuario(u.id, e.target.value)}
                    disabled={u.id === perfil.id}
                    style={{ ...inputStyle, padding: "6px 8px", fontSize: 12.5, opacity: u.id === perfil.id ? .6 : 1 }}>
                    {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                  </select>
                </span>
                <span className="mini" style={{ width: 150, flexShrink: 0 }}>
                  {ROLES[u.rol].perm.includes("*") || ROLES[u.rol].perm.includes("clientes.todos")
                    ? "Todas" : orgs.length ? orgs.map((o) => o.org.nombre).join(", ") : "Ninguna asignada"}
                </span>
                <span className="mini" style={{ width: 110, textAlign: "right", flexShrink: 0 }}>{u.ultimo}</span>
                <span style={{ width: 96, textAlign: "right", flexShrink: 0 }}>
                  <button className={`pill ${u.estado === "activo" ? "on" : ""}`} disabled={u.id === perfil.id}
                    onClick={() => cambiarEstadoUsuario(u.id)}
                    style={u.id === perfil.id ? { opacity: .6, cursor: "not-allowed" } : undefined}>
                    {u.estado === "activo" ? "Activo" : "Inactivo"}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "organizaciones" && (
        <div className="grid g2">
          {clientesVisibles.map((c) => {
            const miembros = services.membresias.porOrg(c.id);

            return (
              <div key={c.id} className="card card-pad">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="area-ico" style={{ background: "var(--blue-soft)", color: "var(--blue)", fontSize: 14, fontWeight: 800 }}>
                    {c.nombre.slice(0, 2).toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="h3">{c.nombre}</div>
                    <div className="mini" style={{ marginTop: 2 }}>{c.plan} · desde {c.desde}</div>
                  </div>
                  <StatusBadge tone={ESTADO_CLIENTE[c.estado].tone} dot>{ESTADO_CLIENTE[c.estado].label}</StatusBadge>
                </div>
                <hr className="divider" style={{ margin: "13px 0" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><div className="eyebrow">Contacto</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.contacto}</div></div>
                  <div><div className="eyebrow">Renovación</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.renovacion}</div></div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>Miembros · {miembros.length}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {miembros.map((m) => (
                      <StatusBadge key={m.id} tone={ROLES[m.perfil.rol].tipo === "cliente" ? "gray" : "blue"}>
                        {m.perfil.nombre} · {m.rolOrg}
                      </StatusBadge>
                    ))}
                    {miembros.length === 0 && <span className="mini">Sin miembros asignados todavía.</span>}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => go({ view: "cliente", id: c.id })}>
                  Abrir Client Hub <ChevronRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "roles" && (
        <>
          <p className="mini" style={{ marginBottom: 14, maxWidth: 620, lineHeight: 1.6 }}>
            Cada rol define qué áreas ve y qué puede hacer. Estos permisos se aplican también en la base de datos con Row Level Security:
            si alguien cambia un id en la URL, la consulta vuelve vacía.
          </p>
          <div className="card">
            <div className="list-row" style={{ background: "var(--surface-2)", padding: "10px 16px" }}>
              <span className="eyebrow" style={{ width: 130 }}>Rol</span>
              <span className="eyebrow" style={{ flex: 1 }}>Áreas que ve</span>
              <span className="eyebrow" style={{ width: 190 }}>Alcance de clientes</span>
            </div>
            {Object.entries(ROLES).map(([k, r]) => (
              <div key={k} className="list-row">
                <span style={{ width: 130, flexShrink: 0 }}>
                  <StatusBadge tone={r.tipo === "cliente" ? "gray" : "blue"}>{r.label}</StatusBadge>
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {r.areas === "all" ? <span className="mini">Todas las áreas</span>
                    : r.areas.length === 0 ? <span className="mini">Solo su propio espacio</span>
                    : r.areas.map((a) => <span key={a} className="badge" style={{ background: "var(--bg)", color: "var(--muted)" }}>{AREAS.find((x) => x.id === a)?.name}</span>)}
                </span>
                <span className="mini" style={{ width: 190, flexShrink: 0 }}>
                  {r.perm.includes("*") || r.perm.includes("clientes.todos") ? "Todas las organizaciones"
                    : r.perm.includes("clientes.asignados") ? "Solo las asignadas"
                    : "Solo su organización"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "invitaciones" && (
        <div className="card">
          {invitaciones.length === 0 ? (
            <Empty icon={Send} titulo="No hay invitaciones pendientes"
              texto="Cuando invites a alguien, va a aparecer acá hasta que cree su contraseña." cta="Invitar usuario" onCta={() => setInvitando(true)} />
          ) : invitaciones.map((i) => (
            <div key={i.id} className="list-row">
              <span className="stat-ico" style={{ width: 32, height: 32, background: "var(--blue-soft)", color: "var(--blue)" }}><Send size={15} /></span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{i.nombre} {i.apellido}</span>
                <span className="mini" style={{ display: "block", marginTop: 2 }}>{i.email}</span>
              </span>
              <StatusBadge tone="blue">{ROLES[i.rol].label}</StatusBadge>
              <span className="mini" style={{ width: 130, flexShrink: 0 }}>
                {i.org ? services.clientes.get(i.org)?.nombre : "Equipo interno"}
              </span>
              <span className="mini" style={{ width: 90, textAlign: "right", flexShrink: 0 }}>{i.enviada}</span>
              <StatusBadge tone={i.estado === "pendiente" ? "orange" : "green"} dot>
                {i.estado === "pendiente" ? "Pendiente" : "Aceptada"}
              </StatusBadge>
            </div>
          ))}
        </div>
      )}

      {invitando && <InvitarUsuarioModal onClose={() => setInvitando(false)} onInvitar={(d) => { invitar(d); setInvitando(false); setTab("invitaciones"); }} />}
    </>
  );
}

function InvitarUsuarioModal({ onClose, onInvitar }) {
  const [f, setF] = useState({ nombre: "", apellido: "", email: "", rol: "contenido", org: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const esCliente = ROLES[f.rol].tipo === "cliente";
  const listo = f.email.includes("@") && f.nombre.trim() && (!esCliente || f.org);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div className="h2">Invitar usuario</div>
            <div className="mini" style={{ marginTop: 2 }}>Recibe un mail y crea su propia contraseña. Vos no ves ni manejás contraseñas.</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
        </div>

        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Campo label="Nombre"><input style={inputStyle} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} autoFocus /></Campo>
          <Campo label="Apellido"><input style={inputStyle} value={f.apellido} onChange={(e) => set("apellido", e.target.value)} /></Campo>
          <Campo label="Email" ancho><input style={inputStyle} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="nombre@empresa.com" /></Campo>
          <Campo label="Rol">
            <select style={inputStyle} value={f.rol} onChange={(e) => set("rol", e.target.value)}>
              {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
          </Campo>
          <Campo label={esCliente ? "Organización (obligatoria)" : "Organización (opcional)"}>
            <select style={inputStyle} value={f.org} onChange={(e) => set("org", e.target.value)}>
              <option value="">{esCliente ? "Elegí una" : "Sin asignar todavía"}</option>
              {services.clientes.list().map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <div className="card card-pad" style={{ background: "var(--blue-soft)", borderColor: "var(--blue-light)", padding: 13 }}>
            <span style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              {esCliente
                ? "Como cliente, solo va a ver el espacio de esa organización. No accede al sistema interno."
                : `Como ${ROLES[f.rol].label.toLowerCase()}, va a ver ${ROLES[f.rol].perm.includes("clientes.todos") || ROLES[f.rol].perm.includes("*") ? "todas las cuentas" : "únicamente las cuentas que le asignes"}.`}
            </span>
          </div>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" disabled={!listo} style={!listo ? { opacity: .5, cursor: "not-allowed" } : undefined}
            onClick={() => listo && onInvitar(f)}>Enviar invitación</button>
        </div>
      </div>
    </div>
  );
}


/* --- Subárea: el patrón "centro de control" -----------------------------
   Responde siempre las cuatro preguntas: qué, cómo, dónde y en qué estado.
   El OS no ejecuta el trabajo: dice qué hay que hacer y abre la herramienta
   donde se hace.                                                          */
const ESTADOS_MODULO = {
  bloqueado:    { label: "Bloqueado",      tone: "gray",   icon: Lock },
  preparacion:  { label: "En preparación", tone: "orange", icon: Clock },
  progreso:     { label: "En progreso",    tone: "blue",   icon: Activity },
  revision:     { label: "En revisión",    tone: "violet", icon: Eye },
  disponible:   { label: "Disponible",     tone: "green",  icon: CheckCircle2 },
};

function VistaSubarea({ slug }) {
  const { go, perfil, clientesVisibles, guardarAvance, version, mostrar } = useApp();
  const sub = services.subareas.get(slug);
  const [orgId, setOrgId] = useState(clientesVisibles[0]?.id || null);
  const [guardando, setGuardando] = useState(false);

  if (!sub) return <SinAcceso texto="Esta subárea todavía no está definida en el sistema." onVolver={() => go({ view: "inicio" })} />;

  const area = AREAS.find((a) => a.id === sub.area);
  const tone = TONE[area?.tone || "blue"];
  const cliente = clientesVisibles.find((c) => c.id === orgId);
  const avance = orgId ? services.estados.get(orgId, sub.id) : null;
  const hechos = avance?.hechos || [];
  const estado = avance?.estado || "pendiente";
  const listos = hechos.length;
  const total = sub.checklist.length;
  const pct = total ? Math.round((listos / total) * 100) : 0;

  /* La herramienta y los documentos salen de Recursos: enlaces configurables,
     nunca escritos en el código. */
  const herramienta = sub.herramienta ? services.recursos.porNombre(sub.herramienta) : null;
  const documentos = orgId ? services.recursos.deSubarea(sub.slug, orgId) : [];

  const marcar = async (i) => {
    if (!orgId) return;
    const nuevos = hechos.includes(i) ? hechos.filter((x) => x !== i) : [...hechos, i].sort((a, b) => a - b);
    const nuevoEstado = nuevos.length === 0 ? "pendiente" : nuevos.length === total ? "completada" : "curso";
    setGuardando(true);
    try { await guardarAvance(orgId, sub.id, { hechos: nuevos, estado: nuevoEstado }); }
    finally { setGuardando(false); }
  };

  const cambiarEstado = async (nuevo) => {
    if (!orgId) return;
    setGuardando(true);
    try { await guardarAvance(orgId, sub.id, { estado: nuevo }); }
    finally { setGuardando(false); }
  };

  const abrir = (r) => {
    if (!r?.url) { mostrar(`${r?.nombre || "Esa herramienta"} todavía no tiene enlace cargado. Cargalo en Configuración → Recursos.`); return; }
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
        <span className="area-ico" style={{ width: 48, height: 48, background: tone.fg, color: "#fff" }}>
          <ListChecks size={22} />
        </span>
        <div style={{ minWidth: 220, flex: 1 }}>
          <h1 className="h1" style={{ fontSize: 23 }}>{sub.nombre}</h1>
          <p className="sub">{sub.descripcion}</p>
        </div>
        {clientesVisibles.length > 0 && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Para qué cuenta</div>
            <select style={{ ...inputStyle, minWidth: 190 }} value={orgId || ""} onChange={(e) => setOrgId(e.target.value)}>
              {clientesVisibles.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="split">
        <div className="col">
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="grid g2" style={{ gap: 18 }}>
              <div>
                <div className="eyebrow">Objetivo</div>
                <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.55 }}>{sub.objetivo}</div>
              </div>
              <div>
                <div className="eyebrow">Responsable</div>
                <div style={{ fontSize: 13.5, marginTop: 4, fontWeight: 600 }}>{ROLES[sub.rol]?.label || "Sin asignar"}</div>
              </div>
              <div>
                <div className="eyebrow">Qué entra</div>
                <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.55 }}>{sub.entra}</div>
              </div>
              <div>
                <div className="eyebrow">Qué tiene que quedar</div>
                <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.55 }}>{sub.resultado}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: "15px 18px 10px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="eyebrow">Checklist{cliente ? ` · ${cliente.nombre}` : ""}</div>
              <span className="mini" style={{ marginLeft: "auto" }}>{listos} de {total}</span>
              <span className="bar" style={{ width: 90 }}>
                <span style={{ width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--blue)" }} />
              </span>
            </div>
            <div style={{ padding: "0 8px 10px" }}>
              {sub.checklist.map((paso, i) => {
                const hecho = hechos.includes(i);
                return (
                  <button key={i} className="row-link" onClick={() => marcar(i)} disabled={!orgId || guardando}
                    style={{ padding: "9px 10px", opacity: guardando ? .6 : 1 }}>
                    <span className={`check ${hecho ? "done" : ""}`} style={{ width: 18, height: 18 }}>
                      {hecho && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: 13.3, textDecoration: hecho ? "line-through" : "none", opacity: hecho ? .55 : 1 }}>
                      {paso}
                    </span>
                  </button>
                );
              })}
            </div>
            <hr className="divider" />
            <div style={{ padding: "12px 18px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="eyebrow">Estado</span>
              {Object.entries(ESTADOS).map(([k, v]) => (
                <button key={k} className={`pill ${estado === k ? "on" : ""}`} disabled={!orgId || guardando}
                  onClick={() => cambiarEstado(k)}>{v.label}</button>
              ))}
            </div>
          </div>
        </div>

        <aside className="rail">
          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Dónde se ejecuta</div>
            {herramienta ? (
              <>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => abrir(herramienta)}>
                  <ExternalLink size={15} /> Abrir {herramienta.nombre}
                </button>
                {!herramienta.url && (
                  <p className="mini" style={{ marginTop: 9, lineHeight: 1.5 }}>
                    Todavía sin enlace. Cargalo una vez en Configuración → Recursos y queda para siempre.
                  </p>
                )}
              </>
            ) : (
              <p className="mini" style={{ lineHeight: 1.5 }}>
                Esta etapa no depende de una herramienta externa: se resuelve dentro del OS.
              </p>
            )}
          </div>

          <div className="card">
            <div style={{ padding: "15px 16px 6px", display: "flex", alignItems: "center" }}>
              <div className="eyebrow">Documentos de la cuenta</div>
              <button className="mini" style={{ marginLeft: "auto", color: "var(--blue)", fontWeight: 600 }}
                onClick={() => go({ view: "recursos" })}>Administrar</button>
            </div>
            <div style={{ padding: "0 8px 10px" }}>
              {documentos.length === 0 ? (
                <p className="mini" style={{ padding: "6px 10px 10px", lineHeight: 1.5 }}>
                  Sin documentos cargados para {cliente ? cliente.nombre : "esta cuenta"}. Podés sumar la planilla, la carpeta o el template que se use acá.
                </p>
              ) : documentos.map((d) => (
                <button key={d.id} className="row-link" onClick={() => abrir(d)}>
                  <FileText size={15} style={{ color: "var(--muted)" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.nombre}</span>
                  <ExternalLink size={13} className="rc" />
                </button>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Otras etapas de {area?.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {services.subareas.byArea(sub.area).filter((x) => x.slug !== slug).map((x) => (
                <button key={x.slug} className="row-link" style={{ fontSize: 12.8 }}
                  onClick={() => go({ view: "subarea", slug: x.slug })}>
                  {x.nombre}<ChevronRight size={13} className="rc" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}


/* --- Recursos: los enlaces del sistema, editables sin tocar código ------ */
function VistaRecursos() {
  const { go, perfil, clientesVisibles, recursos, guardarRecurso, crearRecurso, borrarRecurso, mostrar } = useApp();
  const [ambito, setAmbito] = useState("global");
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState("");
  const [nuevo, setNuevo] = useState(false);

  const lista = ambito === "global"
    ? recursos.filter((r) => !r.org)
    : recursos.filter((r) => r.org === ambito);
  const sinEnlace = lista.filter((r) => !r.url).length;

  const guardar = async (r) => {
    try { await guardarRecurso(r.id, { url: borrador.trim() || null }); setEditando(null); mostrar(`Enlace de ${r.nombre} guardado.`); }
    catch (e) { mostrar(e.message); }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Recursos</h1>
          <p className="sub">Cada enlace del sistema vive acá. Cambiás uno y cambia en todas las pantallas.</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setNuevo(true)}>
          <Plus size={15} /> Nuevo recurso
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button className={`pill ${ambito === "global" ? "on" : ""}`} onClick={() => setAmbito("global")}>
          Herramientas de la agencia
        </button>
        {clientesVisibles.map((c) => (
          <button key={c.id} className={`pill ${ambito === c.id ? "on" : ""}`} onClick={() => setAmbito(c.id)}>{c.nombre}</button>
        ))}
      </div>

      {sinEnlace > 0 && (
        <div className="card card-pad" style={{ marginBottom: 16, display: "flex", gap: 11, alignItems: "center",
          borderColor: "var(--orange)", background: "var(--orange-soft)" }}>
          <AlertCircle size={17} style={{ color: "var(--orange)", flexShrink: 0 }} />
          <span style={{ fontSize: 13.2, flex: 1 }}>
            {sinEnlace} {sinEnlace === 1 ? "recurso todavía no tiene enlace" : "recursos todavía no tienen enlace"}. Hasta que lo cargues, el botón de abrir no lleva a ningún lado.
          </span>
        </div>
      )}

      <div className="card">
        {lista.length === 0 ? (
          <Empty icon={Link2} titulo="Todavía no hay recursos acá"
            texto="Sumá la carpeta de Drive, la planilla de presupuesto o el formulario de onboarding de esta cuenta."
            cta="Nuevo recurso" onCta={() => setNuevo(true)} />
        ) : lista.map((r) => (
          <div key={r.id} className="list-row" style={{ alignItems: "flex-start" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: r.color, color: "#fff", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
              {r.nombre.slice(0, 1)}
            </span>
            <span style={{ width: 170, flexShrink: 0, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.3, fontWeight: 600 }}>{r.nombre}</span>
              <span className="mini" style={{ display: "block" }}>{r.descripcion || r.tipo}</span>
            </span>
            <span style={{ flex: 1, minWidth: 140 }}>
              {editando === r.id ? (
                <div style={{ display: "flex", gap: 7 }}>
                  <input style={inputStyle} value={borrador} autoFocus placeholder="Pegá el enlace exacto"
                    onChange={(e) => setBorrador(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && guardar(r)} />
                  <button className="btn btn-primary btn-sm" onClick={() => guardar(r)}>Guardar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              ) : (
                <button className="row-link" style={{ padding: "6px 9px" }}
                  onClick={() => { setEditando(r.id); setBorrador(r.url); }}>
                  {r.url
                    ? <span className="mini" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</span>
                    : <span className="mini" style={{ fontStyle: "italic" }}>Sin enlace — clic para cargarlo</span>}
                </button>
              )}
            </span>
            {r.url && <StatusBadge tone="green" dot>Listo</StatusBadge>}
            {r.org && (
              <button className={`pill ${r.visibleCliente ? "on" : ""}`}
                onClick={() => guardarRecurso(r.id, { visible_cliente: !r.visibleCliente }).catch((e) => mostrar(e.message))}>
                {r.visibleCliente ? "Lo ve el cliente" : "Solo interno"}
              </button>
            )}
            {puede(perfil.rol, "*") && (
              <button className="icon-btn" style={{ width: 30, height: 30 }} title="Borrar"
                onClick={() => borrarRecurso(r.id)}><X size={14} /></button>
            )}
          </div>
        ))}
      </div>

      {nuevo && (
        <NuevoRecursoModal
          clientes={clientesVisibles}
          ambito={ambito}
          onClose={() => setNuevo(false)}
          onCrear={async (d) => { try { await crearRecurso(d); setNuevo(false); } catch (e) { mostrar(e.message); } }}
        />
      )}
    </>
  );
}

function NuevoRecursoModal({ clientes, ambito, onClose, onCrear }) {
  const [f, setF] = useState({
    nombre: "", tipo: "documento", url: "", descripcion: "",
    org: ambito === "global" ? "" : ambito, area: "", subarea: "", visibleCliente: false,
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const subareas = f.area ? services.subareas.byArea(f.area) : [];
  const listo = f.nombre.trim().length > 1;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div className="h2">Nuevo recurso</div>
            <div className="mini" style={{ marginTop: 2 }}>Un documento, una carpeta o una herramienta que el equipo necesita abrir.</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
        </div>

        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxHeight: "56vh", overflowY: "auto" }}>
          <Campo label="Nombre" ancho>
            <input style={inputStyle} value={f.nombre} onChange={(e) => set("nombre", e.target.value)}
              placeholder="Presupuesto campañas agosto" autoFocus />
          </Campo>
          <Campo label="Tipo">
            <select style={inputStyle} value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
              {["documento", "sheet", "doc", "pdf", "carpeta", "formulario", "herramienta", "enlace"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Campo>
          <Campo label="De quién es">
            <select style={inputStyle} value={f.org} onChange={(e) => set("org", e.target.value)}>
              <option value="">De la agencia</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Enlace" ancho>
            <input style={inputStyle} value={f.url} onChange={(e) => set("url", e.target.value)}
              placeholder="Pegá la dirección exacta" />
          </Campo>
          <Campo label="Área">
            <select style={inputStyle} value={f.area} onChange={(e) => { set("area", e.target.value); set("subarea", ""); }}>
              <option value="">Sin área</option>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Campo>
          <Campo label="Etapa">
            <select style={inputStyle} value={f.subarea} onChange={(e) => set("subarea", e.target.value)} disabled={!subareas.length}>
              <option value="">{subareas.length ? "Sin etapa" : "Elegí un área primero"}</option>
              {subareas.map((x) => <option key={x.slug} value={x.slug}>{x.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Para qué sirve" ancho>
            <input style={inputStyle} value={f.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Una línea alcanza" />
          </Campo>
          {f.org && (
            <Campo label="¿Lo ve el cliente?" ancho>
              <button className={`pill ${f.visibleCliente ? "on" : ""}`} onClick={() => set("visibleCliente", !f.visibleCliente)}>
                {f.visibleCliente ? "Sí, aparece en su portal" : "No, solo lo ve el equipo"}
              </button>
            </Campo>
          )}
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" disabled={!listo} style={!listo ? { opacity: .5, cursor: "not-allowed" } : undefined}
            onClick={() => listo && onCrear(f)}>Crear recurso</button>
        </div>
      </div>
    </div>
  );
}


/* --- Qué ve el cliente: el equipo abre y cierra cada módulo ------------- */
function HubPortal({ cliente }) {
  const { cambiarEstadoModulo, version, mostrar } = useApp();
  const modulos = useMemo(() => services.modulosCliente.byOrg(cliente.id), [cliente.id, version]);
  const abiertos = modulos.filter((m) => m.estado === "disponible").length;

  if (!modulos.length) return (
    <div className="card"><Empty icon={Lock} titulo="Este cliente todavía no tiene portal"
      texto="Se crea solo al dar de alta la organización. Si falta, avisá a Dirección." /></div>
  );

  return (
    <>
      <div className="card card-pad" style={{ marginBottom: 16, display: "flex", gap: 11, alignItems: "center", flexWrap: "wrap" }}>
        <Eye size={17} style={{ color: "var(--blue)", flexShrink: 0 }} />
        <span style={{ fontSize: 13.3, flex: 1, minWidth: 220 }}>
          Esto es exactamente lo que ve {cliente.nombre} al entrar. Lo que dejes en bloqueado no le llega, ni siquiera por debajo.
        </span>
        <StatusBadge tone="green" dot>{abiertos} de {modulos.length} abiertos</StatusBadge>
      </div>

      <div className="card">
        {modulos.map((m) => (
          <div key={m.id} className="list-row" style={{ alignItems: "center" }}>
            <span style={{ width: 190, flexShrink: 0, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.4, fontWeight: 600 }}>{m.nombre}</span>
              <span className="mini" style={{ display: "block", marginTop: 2 }}>{m.grupo}</span>
            </span>
            <span className="mini" style={{ flex: 1, minWidth: 120 }}>{m.descripcion}</span>
            <span style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {Object.entries(ESTADOS_MODULO).map(([k, v]) => (
                <button key={k} className={`pill ${m.estado === k ? "on" : ""}`}
                  style={{ padding: "5px 9px", fontSize: 11.5 }}
                  onClick={() => cambiarEstadoModulo(m.id, k)}>{v.label}</button>
              ))}
            </span>
          </div>
        ))}
      </div>

      <p className="mini" style={{ marginTop: 12, lineHeight: 1.55, maxWidth: 620 }}>
        El cliente nunca puede abrir un módulo por su cuenta. El recorrido avanza cuando el equipo lo decide.
      </p>
    </>
  );
}

function SinAcceso({ texto, onVolver }) {
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <Empty icon={ShieldCheck} titulo="Esto no está en tu alcance" texto={texto} cta="Volver al inicio" onCta={onVolver} />
    </div>
  );
}

/* --- Inicio de sesión --------------------------------------------------- */
function LoginScreen({ onEntrar }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setCargando(true); setError(null);
    const { session, error } = await auth.signIn(email, pass);
    setCargando(false);
    if (error) { setError(error); return; }
    onEntrar(session);
  };

  const recuperar = async () => {
    setCargando(true); setError(null);
    const { mensaje } = await auth.recuperar(email);
    setCargando(false); setAviso(mensaje);
  };

  const demo = [
    { email: "facu@marketingenflujo.com", quien: "Facu · CEO", detalle: "Ve las 6 cuentas y los números" },
    { email: "juli@marketingenflujo.com", quien: "Juli · Editor", detalle: "Contenido y 2 cuentas asignadas" },
    { email: "sofi@marketingenflujo.com", quien: "Sofi · Media Buyer", detalle: "Paid y 2 cuentas asignadas" },
    { email: "maria@nordikastudio.com", quien: "María · Cliente", detalle: "Solo el espacio de Nórdika" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28 }}>
            <span className="brand-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 15c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 9c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
              </svg>
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.15, letterSpacing: ".3px" }}>MARKETING<br />EN FLUJO</span>
          </div>

          <h1 className="h1" style={{ fontSize: 24 }}>{modo === "login" ? "Entrá a tu cuenta" : "Recuperar contraseña"}</h1>
          <p className="sub" style={{ marginBottom: 22 }}>
            {modo === "login" ? "Cada persona tiene su propio acceso y ve lo que le corresponde." : "Te mandamos un enlace para crear una contraseña nueva."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Campo label="Email">
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && modo === "login" && entrar()} placeholder="nombre@marketingenflujo.com" autoFocus />
            </Campo>
            {modo === "login" && (
              <Campo label="Contraseña">
                <input style={inputStyle} type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entrar()} placeholder="••••••••" />
              </Campo>
            )}

            {error && (
              <div className="card card-pad" style={{ padding: 12, background: "var(--red-soft)", borderColor: "var(--red)", display: "flex", gap: 9, alignItems: "center" }}>
                <AlertCircle size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5 }}>{error}</span>
              </div>
            )}
            {aviso && (
              <div className="card card-pad" style={{ padding: 12, background: "var(--green-soft)", borderColor: "var(--green)", display: "flex", gap: 9, alignItems: "center" }}>
                <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5 }}>{aviso}</span>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%", padding: "11px 15px" }} disabled={cargando}
              onClick={() => (modo === "login" ? entrar() : recuperar())}>
              {cargando ? "Un segundo…" : modo === "login" ? "Entrar" : "Enviar enlace"}
            </button>

            <button className="mini" style={{ color: "var(--blue)", fontWeight: 600 }}
              onClick={() => { setModo(modo === "login" ? "recuperar" : "login"); setError(null); setAviso(null); }}>
              {modo === "login" ? "Olvidé mi contraseña" : "Volver a entrar"}
            </button>
          </div>

          <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <div className="eyebrow" style={{ marginBottom: 9 }}>Cuentas cargadas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {demo.map((d) => (
                <button key={d.email} className="row-link" onClick={() => { setEmail(d.email); setPass("FlujoOS2026!"); setError(null); }}>
                  <span className="avatar" style={{ width: 24, height: 24, fontSize: 9.5 }}>{d.quien[0]}</span>
                  <span style={{ minWidth: 0, textAlign: "left" }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{d.quien}</span>
                    <span className="mini" style={{ display: "block", fontSize: 11 }}>{d.detalle}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mini" style={{ marginTop: 10, fontSize: 11, lineHeight: 1.5 }}>
              Contraseña provisional para todas: FlujoOS2026! — cambiala en cuanto entres.
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }} className="login-art">
        <div style={{ maxWidth: 360, color: "#fff" }}>
          <div className="eyebrow" style={{ color: "rgba(255,255,255,.45)" }}>Marketing en Flujo OS</div>
          <p style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-.3px", margin: "12px 0 26px" }}>
            Una sola plataforma. Una experiencia distinta para cada persona que entra.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FLUJO.map((f, i) => (
              <React.Fragment key={f}>
                {i > 0 && <span style={{ width: 1.5, height: 12, background: "rgba(255,255,255,.2)", marginLeft: 15 }} />}
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".7px", padding: "6px 13px", borderRadius: 99,
                  background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.82)", alignSelf: "flex-start" }}>
                  {f.toUpperCase()}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6. SHELL — layout, navegación y permisos
   ========================================================================== */

function Sidebar({ open, onClose }) {
  const { route, go, perfil, rolActivo, notis, setNotisOpen, dark, setDark, clientesVisibles } = useApp();
  const [abiertas, setAbiertas] = useState([]);
  const rol = ROLES[rolActivo];
  const visibles = rol.areas === "all" ? AREAS : AREAS.filter((a) => rol.areas.includes(a.id));
  const ver = (p) => puede(rolActivo, p);
  const esCliente = rol.tipo === "cliente";
  const sinLeer = notis.filter((n) => !n.leida).length;

  const toggle = (id) => setAbiertas((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);
  const nav = (to) => { go(to); onClose(); };

  const esActivo = (v) => route.view === v;

  return (
    <aside className={`side ${open ? "open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 15c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M3 9c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
          </svg>
        </span>
        <span className="brand-name">MARKETING<br />EN FLUJO</span>
      </div>

      <div className="side-scroll">
        {esCliente ? (
          <button className={`nav-item ${esActivo("portal") ? "active" : ""}`} onClick={() => nav({ view: "portal" })}>
            <Home size={17} strokeWidth={2} /> Mi espacio
          </button>
        ) : (
          <button className={`nav-item ${esActivo("inicio") ? "active" : ""}`} onClick={() => nav({ view: "inicio" })}>
            <Home size={17} strokeWidth={2} /> Inicio
          </button>
        )}
        {ver("*") && (
          <button className={`nav-item ${esActivo("ceo") ? "active" : ""}`} onClick={() => nav({ view: "ceo" })}>
            <Crown size={17} strokeWidth={2} /> Dashboard CEO
          </button>
        )}
        {!esCliente && (
          <button className={`nav-item ${esActivo("clientes") || esActivo("cliente") ? "active" : ""}`} onClick={() => nav({ view: "clientes" })}>
            <Users size={17} strokeWidth={2} /> Clientes
            {clientesVisibles.length > 0 && <span className="nav-count">{clientesVisibles.length}</span>}
          </button>
        )}
        {ver("calendario") && (
          <button className={`nav-item ${esActivo("calendario") ? "active" : ""}`} onClick={() => nav({ view: "calendario" })}>
            <Calendar size={17} strokeWidth={2} /> Calendario
          </button>
        )}
        <button className="nav-item" onClick={() => { setNotisOpen(true); onClose(); }}>
          <Bell size={17} strokeWidth={2} /> Notificaciones
          {sinLeer > 0 && <span className="nav-count">{sinLeer}</span>}
        </button>

        {visibles.length > 0 && <div className="nav-label">NAVEGACIÓN</div>}
        {visibles.map((a) => {
          const abierta = abiertas.includes(a.id);
          const activo = (route.view === "area" && route.id === a.id) || (route.view === "sub" && route.areaId === a.id);
          return (
            <div key={a.id}>
              <button className={`nav-item ${activo && !abierta ? "active" : ""}`} onClick={() => toggle(a.id)}>
                <a.icon size={17} strokeWidth={2} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                <ChevronDown size={15} className={`chev ${abierta ? "open" : ""}`} />
              </button>
              {abierta && (
                <div className="nav-sub">
                  <button onClick={() => nav({ view: "area", id: a.id })}>Ver todo</button>
                  {itemsDeArea(a).map((it) => (
                    <button key={it.id}
                      className={(route.view === "subarea" && route.slug === it.slug)
                        || (route.view === "sub" && route.subId === it.id && route.areaId === a.id) ? "active" : ""}
                      onClick={() => nav(it.slug ? { view: "subarea", slug: it.slug }
                        : it.view ? { view: it.view } : { view: "sub", areaId: a.id, subId: it.id })}>
                      {it.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {ver("herramientas") && (
          <button className={`nav-item ${esActivo("herramientas") ? "active" : ""}`} style={{ marginTop: 6 }} onClick={() => nav({ view: "herramientas" })}>
            <Link2 size={17} strokeWidth={2} /> Herramientas
          </button>
        )}
        {ver("herramientas") && (
          <button className={`nav-item ${esActivo("recursos") ? "active" : ""}`} onClick={() => nav({ view: "recursos" })}>
            <Layers size={17} strokeWidth={2} /> Recursos
          </button>
        )}
        {ver("admin") && (
          <button className={`nav-item ${esActivo("admin") ? "active" : ""}`} onClick={() => nav({ view: "admin" })}>
            <ShieldCheck size={17} strokeWidth={2} /> Administración
          </button>
        )}
      </div>

      <div className="side-foot">
        <button className="user-chip" onClick={() => nav({ view: "config" })}>
          <span className="avatar">{perfil.nombre[0]}{perfil.apellido[0]}</span>
          <span style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{perfil.nombre} {perfil.apellido}</span>
            <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.5)" }}>
              {ROLES[rolActivo].label}{rolActivo !== perfil.rol ? " (simulado)" : ""}
            </span>
          </span>
          <ChevronDown size={14} style={{ opacity: .5 }} />
        </button>
        <button className="nav-item" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>
    </aside>
  );
}

function Header({ onMenu, onSearch }) {
  const { route, go, notis, setNotisOpen } = useApp();
  const sinLeer = notis.filter((n) => !n.leida).length;

  const crumbs = useMemo(() => {
    const c = [{ l: "Inicio", to: { view: "inicio" } }];
    const area = route.areaId || (route.view === "area" ? route.id : null);
    const a = AREAS.find((x) => x.id === area);
    switch (route.view) {
      case "inicio": return [{ l: "Inicio", now: true }];
      case "ceo": c.push({ l: "Dirección", to: { view: "area", id: "direccion" } }, { l: "Dashboard CEO", now: true }); break;
      case "clientes": c.push({ l: "Clientes", now: true }); break;
      case "cliente": c.push({ l: "Clientes", to: { view: "clientes" } }, { l: services.clientes.get(route.id)?.nombre || "Cliente", now: true }); break;
      case "portal": c.push({ l: "Mi cuenta", now: true }); break;
      case "area": c.push({ l: a?.name || "Área", now: true }); break;
      case "sub": c.push({ l: a?.name || "Área", to: { view: "area", id: area } }, { l: a?.items.find((i) => i.id === route.subId)?.name || "", now: true }); break;
      case "procesos": c.push({ l: "Biblioteca", to: { view: "biblioteca" } }, { l: "Procesos", now: true }); break;
      case "proceso": c.push({ l: "Procesos", to: { view: "procesos" } }, { l: services.procesos.get(route.id)?.nombre || "", now: true }); break;
      case "sop": c.push({ l: "Biblioteca", to: { view: "biblioteca" } }, { l: services.sops.get(route.id)?.nombre || "", now: true }); break;
      case "tareas": c.push({ l: "Operaciones", to: { view: "area", id: "operaciones" } }, { l: "Tareas", now: true }); break;
      case "calendario": c.push({ l: "Calendario", now: true }); break;
      case "herramientas": c.push({ l: "Herramientas", now: true }); break;
      case "biblioteca": c.push({ l: "Biblioteca", now: true }); break;
      case "prompts": c.push({ l: "Biblioteca", to: { view: "biblioteca" } }, { l: "Prompts", now: true }); break;
      case "automatizaciones": c.push({ l: "Automatización / IA", to: { view: "area", id: "ia" } }, { l: "Automatizaciones", now: true }); break;
      case "subarea": {
        const sa = services.subareas.get(route.slug);
        const ar = AREAS.find((x) => x.id === sa?.area);
        c.push({ l: ar?.name || "Área", to: { view: "area", id: sa?.area } }, { l: sa?.nombre || "", now: true });
        break;
      }
      case "recursos": c.push({ l: "Recursos", now: true }); break;
      case "admin": c.push({ l: "Administración", now: true }); break;
      case "config": c.push({ l: "Configuración", now: true }); break;
      default: break;
    }
    return c;
  }, [route]);

  return (
    <header className="header">
      <button className="icon-btn" onClick={onMenu} style={{ display: "none" }} id="mef-menu" aria-label="Abrir menú"><Menu size={18} /></button>
      <nav className="crumb" aria-label="Ruta">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={13} style={{ opacity: .5 }} />}
            {c.now ? <span className="now">{c.l}</span> : <button onClick={() => go(c.to)}>{c.l}</button>}
          </React.Fragment>
        ))}
      </nav>
      <button className="searchbar" onClick={onSearch}>
        <Search size={15} /><span>Buscar en todo el sistema</span><span className="kbd">Ctrl K</span>
      </button>
      <button className="icon-btn" onClick={() => setNotisOpen(true)} aria-label="Notificaciones">
        <Bell size={17} />{sinLeer > 0 && <span className="dot" />}
      </button>
    </header>
  );
}

export default function MarketingEnFlujoOS() {
  const [route, setRoute] = useState({ view: "inicio" });
  const [dark, setDark] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notisOpen, setNotisOpen] = useState(false);
  const [notis, setNotis] = useState([]);
  const [tools, setTools] = useState(TOOLS_INIT);
  const [quick, setQuick] = useState(QUICK_INIT);
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [verComo, setVerComo] = useState(null);
  const [version, setVersion] = useState(0);
  const [now, setNow] = useState(new Date());
  const [aviso, setAviso] = useState(null);
  const canvasRef = useRef(null);

  /* Sesión: la fuente de verdad es Supabase, no el estado de React.
     onChange cubre login, logout, refresh del token y cambios en otra pestaña. */
  useEffect(() => {
    let vivo = true;
    auth.getSession().then((s) => { if (vivo) setSession(s); if (vivo && !s) setCargando(false); });
    const cortar = auth.onChange((s) => {
      setSession(s);
      if (!s) { setPerfil(null); setVerComo(null); setRoute({ view: "inicio" }); setCargando(false); }
    });
    return () => { vivo = false; cortar(); };
  }, []);

  /* Con sesión válida: perfil primero, después todo lo que RLS deje ver. */
  useEffect(() => {
    if (!session) return;
    let vivo = true;
    (async () => {
      setCargando(true); setErrorCarga(null);
      try {
        const p = await auth.perfilDe(session);
        if (!vivo) return;
        if (!p) { await auth.signOut(); setErrorCarga("Tu usuario no tiene perfil cargado. Avisale a Dirección."); setCargando(false); return; }
        if (p.estado !== "activo") { await auth.signOut(); setErrorCarga("Esta cuenta está desactivada."); setCargando(false); return; }
        setPerfil(p);
        setRoute({ view: ROLES[p.rol]?.tipo === "cliente" ? "portal" : "inicio" });
        const datos = await cargarDatos();
        if (!vivo) return;
        setUsuarios(datos.usuarios);
        setInvitaciones(datos.invitaciones);
        setNotis(datos.notificaciones);
        setRecursos(datos.recursos);
        setVersion((v) => v + 1);
        auth.registrarAcceso(p.id);
      } catch (e) {
        if (vivo) setErrorCarga("No pudimos traer los datos. Revisá tu conexión y volvé a entrar.");
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, [session]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setNotisOpen(false); setSideOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const go = (to) => {
    if (!to) return;
    setRoute(to);
    setSideOpen(false);
    if (canvasRef.current) canvasRef.current.scrollTop = 0;
    window.scrollTo?.({ top: 0, behavior: "auto" });
  };

  const abrirTool = (tool) => {
    if (tool.url) { window.open(tool.url, "_blank", "noopener,noreferrer"); return; }
    setAviso(`${tool.nombre} todavía no tiene enlace cargado. Cargalo en Configuración y se abre desde acá.`);
    setTimeout(() => setAviso(null), 4200);
  };

  /* rolActivo permite al CEO simular otros roles sin cambiar sus permisos reales.
     Es solo visual: la base sigue respondiendo según el rol real. */
  const rolActivo = perfil ? (verComo || perfil.rol) : null;

  const clientesVisibles = useMemo(() => {
    if (!perfil) return [];
    return services.clientes.visiblesPara({ ...perfil, rol: rolActivo });
  }, [perfil, rolActivo, version]);

  const getCliente = (id) => services.clientes.get(id);
  const accesoA = (orgId) => (perfil ? services.clientes.accesoA({ ...perfil, rol: rolActivo }, orgId) : false);

  const mostrar = (texto, ms = 4200) => { setAviso(texto); setTimeout(() => setAviso(null), ms); };

  const crearCliente = async (d) => {
    try {
      const cliente = await acciones.crearCliente(d, perfil.id);
      setVersion((v) => v + 1);
      mostrar(`${cliente.nombre} ya tiene su Client Hub. Invitá a su equipo desde Administración.`);
      return cliente.id;
    } catch (e) { mostrar(e.message); return null; }
  };

  const invitar = async (d) => {
    try {
      const { invitacion, enviada } = await acciones.invitar(d, perfil.id);
      setInvitaciones((is) => [invitacion, ...is]);
      mostrar(enviada
        ? `Invitación enviada a ${d.email}. Va a crear su propia contraseña desde el mail.`
        : `Invitación registrada, pero el mail no salió: falta desplegar la función invitar-usuario.`, 6000);
    } catch (e) { mostrar(e.message); }
  };

  const cambiarEstadoUsuario = async (id) => {
    try { await acciones.cambiarEstadoUsuario(id); setUsuarios([...services.usuarios.list()]); }
    catch (e) { mostrar(e.message); }
  };

  const cambiarRolUsuario = async (id, rol) => {
    try { await acciones.cambiarRolUsuario(id, rol); setUsuarios([...services.usuarios.list()]); }
    catch (e) { mostrar(e.message); }
  };

  const guardarAvance = async (orgId, subareaId, cambios) => {
    try { await acciones.guardarAvance(orgId, subareaId, cambios); setVersion((v) => v + 1); }
    catch (e) { mostrar(e.message); }
  };

  const guardarRecurso = async (id, campos) => {
    await acciones.guardarRecurso(id, campos);
    setRecursos([...services.recursos.list()]);
  };

  const crearRecurso = async (d) => {
    await acciones.crearRecurso(d);
    setRecursos([...services.recursos.list()]);
    mostrar("Recurso creado. Ya aparece en la etapa donde lo asignaste.");
  };

  const borrarRecurso = async (id) => {
    try { await acciones.borrarRecurso(id); setRecursos([...services.recursos.list()]); }
    catch (e) { mostrar(e.message); }
  };

  const cambiarEstadoModulo = async (moduleId, estado) => {
    try { await acciones.cambiarEstadoModulo(moduleId, estado); setVersion((v) => v + 1); }
    catch (e) { mostrar(e.message); }
  };

  const cambiarEstadoTarea = async (id, estado) => {
    try { await acciones.cambiarEstadoTarea(id, estado); setVersion((v) => v + 1); }
    catch (e) { mostrar(e.message); }
  };

  const salir = async () => {
    await auth.signOut();
    setSession(null); setPerfil(null); setVerComo(null); setRoute({ view: "inicio" });
  };

  const ctx = {
    route, go, dark, setDark, notis, setNotis, notisOpen, setNotisOpen,
    tools, setTools, quick, setQuick, abrirTool, now, mostrar,
    session, perfil, rolActivo, setVerComo, verComo, salir,
    usuarios, invitaciones, invitar, cambiarEstadoUsuario, cambiarRolUsuario, cambiarEstadoTarea,
    clientesVisibles, getCliente, accesoA, crearCliente, version,
    recursos, guardarAvance, guardarRecurso, crearRecurso, borrarRecurso, cambiarEstadoModulo,
  };

  const esCliente = perfil ? ROLES[rolActivo].tipo === "cliente" : false;
  const bloqueado = esCliente && !["portal", "config"].includes(route.view);

  const areaPermitida = (areaId) => {
    const a = ROLES[rolActivo].areas;
    return a === "all" || a.includes(areaId);
  };

  const vista = () => {
    if (bloqueado) return <VistaPortalCliente />;
    switch (route.view) {
      case "inicio": return <VistaInicio />;
      case "ceo": return puede(rolActivo, "*") ? <VistaCEO />
        : <SinAcceso texto="El Dashboard CEO incluye facturación y rentabilidad. Solo Dirección lo ve." onVolver={() => go({ view: "inicio" })} />;
      case "clientes": return <VistaClientes />;
      case "cliente": return <VistaClienteHub id={route.id} tabInicial={route.tab} />;
      case "portal": return <VistaPortalCliente />;
      case "area": return areaPermitida(route.id) ? <VistaArea id={route.id} />
        : <SinAcceso texto="Esta área no forma parte de tu rol. Si la necesitás, pedile acceso a Dirección." onVolver={() => go({ view: "inicio" })} />;
      case "sub": return areaPermitida(route.areaId) ? <VistaSubmodulo areaId={route.areaId} subId={route.subId} />
        : <SinAcceso texto="Esta área no forma parte de tu rol. Si la necesitás, pedile acceso a Dirección." onVolver={() => go({ view: "inicio" })} />;
      case "procesos": return <VistaProcesos />;
      case "proceso": return <VistaProceso id={route.id} />;
      case "sop": {
        const s = services.sops.get(route.id);
        return s ? <SOPViewer sop={s} onBack={() => go({ view: "biblioteca" })} /> : null;
      }
      case "tareas": return <VistaTareas />;
      case "calendario": return <VistaCalendario />;
      case "herramientas": return <VistaHerramientas />;
      case "biblioteca": return <VistaBiblioteca />;
      case "prompts": return <VistaPrompts />;
      case "automatizaciones": return <VistaAutomatizaciones />;
      case "subarea": return <VistaSubarea slug={route.slug} />;
      case "recursos": return puede(rolActivo, "herramientas")
        ? <VistaRecursos />
        : <SinAcceso texto="Los recursos los administra el equipo interno." onVolver={() => go({ view: "inicio" })} />;
      case "admin": return <VistaAdmin />;
      case "config": return <VistaConfig />;
      default: return <VistaInicio />;
    }
  };

  if (cargando) {
    return (
      <div className={`mef ${dark ? "dark" : ""}`}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span className="brand-mark" style={{ width: 44, height: 44 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 15c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M3 9c3-5 6 5 9 0s6-5 9 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
            </svg>
          </span>
          <span className="mini">Abriendo tu sistema…</span>
        </div>
      </div>
    );
  }

  if (!session || !perfil) {
    return (
      <div className={`mef ${dark ? "dark" : ""}`}>
        {errorCarga && (
          <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 120,
            background: "var(--navy)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13,
            boxShadow: "var(--shadow-lg)", maxWidth: "90vw", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />{errorCarga}
          </div>
        )}
        {/* La sesión la establece Supabase: acá solo esperamos a que onChange avise. */}
        <LoginScreen onEntrar={() => setCargando(true)} />
      </div>
    );
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className={`mef ${dark ? "dark" : ""}`}>
        <div className="shell">
          <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />
          {sideOpen && <div className="scrim" onClick={() => setSideOpen(false)} />}

          <div className="main">
            <Header onMenu={() => setSideOpen(true)} onSearch={() => setSearchOpen(true)} />
            <main className="canvas" ref={canvasRef}>
              {verComo && (
                <div className="card card-pad" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "center", background: "var(--blue-soft)", borderColor: "var(--blue-light)" }}>
                  <Eye size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.2 }}>
                    Estás viendo el sistema como <strong>{ROLES[rolActivo].label}</strong>. Es una simulación visual: tus permisos reales no cambiaron.
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => { setVerComo(null); go({ view: "inicio" }); }}>Volver a mi rol</button>
                </div>
              )}
              {vista()}
              <footer style={{ marginTop: 34, paddingTop: 18, borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>
                  Marketing en Flujo © {now.getFullYear()} &nbsp;·&nbsp; Sistema operativo de crecimiento
                </span>
              </footer>
            </main>
          </div>
        </div>

        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onGo={go} />
        <NotificationPanel open={notisOpen} onClose={() => setNotisOpen(false)} notis={notis}
          onLeer={(id) => setNotis((ns) => ns.map((n) => n.id === id ? { ...n, leida: true } : n))}
          onLeerTodas={() => setNotis((ns) => ns.map((n) => ({ ...n, leida: true })))} />

        {aviso && (
          <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 120,
            background: "var(--navy)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13,
            boxShadow: "var(--shadow-lg)", maxWidth: "90vw", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />{aviso}
          </div>
        )}

        <style>{`@media (max-width:1024px){#mef-menu{display:flex !important}}`}</style>
      </div>
    </AppCtx.Provider>
  );
}
