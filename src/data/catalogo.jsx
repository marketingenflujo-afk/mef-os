/* ============================================================================
   CATÁLOGO DE LA INTERFAZ
   ---------------------------------------------------------------------------
   Todo lo que define cómo se ve y se navega el sistema, no lo que pasa dentro
   de él: áreas, estados, herramientas, prompts y accesos rápidos.
   Los datos de trabajo (clientes, tareas, campañas) vienen de Supabase.
   ========================================================================== */
import {
  Home, Crown, Settings, Target, Clapperboard, Megaphone, Search, DollarSign, Bot, BookOpen,
  Link2, Bell, Calendar, ChevronRight, ChevronDown, Users, Folder, CheckSquare, BarChart3,
  TrendingUp, UserPlus, ExternalLink, Copy, Check, X, Menu, Moon, Sun, Plus, ArrowLeft,
  Clock, AlertCircle, CheckCircle2, Circle, FileText, Zap, Sparkles, LayoutDashboard,
  PieChart, Wallet, GitBranch, Lightbulb, Mic, Scissors, ThumbsUp, Send, Image as ImageIcon,
  Wrench, Library, Route, ListChecks, MessageSquare, Paperclip, Video, Eye, Gauge, Flag,
  Building2, Star, Command, CornerDownLeft, Filter, Layers, Compass, Beaker, Activity,
  ClipboardList, Rocket, Share2, ShieldCheck, Award, Play, Download
} from "lucide-react";

export const TONE = {
  blue:   { bg: "var(--blue-soft)",   fg: "var(--blue)" },
  green:  { bg: "var(--green-soft)",  fg: "var(--green)" },
  orange: { bg: "var(--orange-soft)", fg: "var(--orange)" },
  red:    { bg: "var(--red-soft)",    fg: "var(--red)" },
  violet: { bg: "var(--violet-soft)", fg: "var(--violet)" },
  gray:   { bg: "var(--bg)",          fg: "var(--muted)" },
};

export const ESTADOS = {
  pendiente:  { label: "Pendiente",   tone: "gray" },
  curso:      { label: "En curso",    tone: "blue" },
  revision:   { label: "En revisión", tone: "orange" },
  bloqueada:  { label: "Bloqueada",   tone: "red" },
  completada: { label: "Completada",  tone: "green" },
};

export const PRIORIDADES = {
  alta:  { label: "Alta",  tone: "red" },
  media: { label: "Media", tone: "orange" },
  baja:  { label: "Baja",  tone: "gray" },
};

/* --- Áreas de trabajo: la columna vertebral de la navegación --- */
export const AREAS = [
  {
    id: "direccion", name: "Dirección", icon: Crown, tone: "blue",
    desc: "Visión general del negocio y toma de decisiones.",
    items: [
      { id: "ceo", name: "Dashboard CEO", icon: LayoutDashboard, view: "ceo" },
      { id: "objetivos", name: "Objetivos", icon: Target },
      { id: "kpis", name: "KPIs", icon: BarChart3 },
      { id: "finanzas", name: "Finanzas", icon: Wallet },
      { id: "pipeline", name: "Pipeline comercial", icon: GitBranch },
      { id: "decisiones", name: "Decisiones", icon: Compass },
    ],
  },
  {
    id: "operaciones", name: "Operaciones", icon: Settings, tone: "green",
    desc: "Gestión de proyectos, tareas y equipos.",
    items: [
      { id: "clientes", name: "Clientes", icon: Users, view: "clientes" },
      { id: "proyectos", name: "Proyectos", icon: Folder },
      { id: "tareas", name: "Tareas", icon: CheckSquare, view: "tareas" },
      { id: "calendario", name: "Calendario", icon: Calendar, view: "calendario" },
      { id: "produccion", name: "Producción", icon: Activity },
      { id: "calidad", name: "Control de calidad", icon: ShieldCheck },
    ],
  },
  {
    id: "estrategia", name: "Estrategia", icon: Target, tone: "violet",
    desc: "Planificación estratégica y arquitectura.",
    items: [
      { id: "diagnosticos", name: "Diagnósticos", icon: Beaker },
      { id: "arquitectura", name: "Arquitectura de marketing", icon: Layers },
      { id: "roadmaps", name: "Roadmaps", icon: Route },
      { id: "ofertas", name: "Ofertas", icon: Award },
      { id: "estrategias", name: "Estrategias por cliente", icon: ClipboardList },
    ],
  },
  {
    id: "contenido", name: "Contenido", icon: Clapperboard, tone: "orange",
    desc: "De la idea a la publicación, todo el proceso.",
    items: [
      { id: "ideas", name: "Ideas", icon: Lightbulb },
      { id: "research-c", name: "Research", icon: Search },
      { id: "guiones", name: "Guiones", icon: FileText },
      { id: "grabaciones", name: "Grabaciones", icon: Mic },
      { id: "edicion", name: "Edición", icon: Scissors },
      { id: "aprobaciones", name: "Aprobaciones", icon: ThumbsUp },
      { id: "publicados", name: "Publicados", icon: Send },
    ],
  },
  {
    id: "paid", name: "Paid Media", icon: Megaphone, tone: "blue",
    desc: "Campañas, anuncios y optimización.",
    items: [
      { id: "campanas", name: "Campañas", icon: Megaphone },
      { id: "creatividades", name: "Creatividades", icon: ImageIcon },
      { id: "presupuestos", name: "Presupuestos", icon: Wallet },
      { id: "metricas", name: "Métricas", icon: BarChart3 },
      { id: "tests", name: "Tests A/B", icon: Beaker },
      { id: "optimizaciones", name: "Optimizaciones", icon: Gauge },
    ],
  },
  {
    id: "research", name: "Research", icon: Search, tone: "orange",
    desc: "Investigación para crear mejores estrategias.",
    items: [
      { id: "tendencias", name: "Tendencias", icon: TrendingUp },
      { id: "competidores", name: "Competidores", icon: Building2 },
      { id: "mercado", name: "Mercado", icon: PieChart },
      { id: "hooks", name: "Hooks", icon: Zap },
      { id: "referencias", name: "Referencias", icon: Star },
    ],
  },
  {
    id: "ventas", name: "Ventas", icon: DollarSign, tone: "green",
    desc: "Prospección, reuniones y cierres.",
    items: [
      { id: "leads", name: "Leads", icon: UserPlus },
      { id: "prospeccion", name: "Prospección", icon: Compass },
      { id: "setters", name: "Setters", icon: Users },
      { id: "reuniones", name: "Reuniones", icon: Video },
      { id: "propuestas", name: "Propuestas", icon: FileText },
      { id: "cierres", name: "Cierres", icon: Flag },
    ],
  },
  {
    id: "ia", name: "Automatización / IA", icon: Bot, tone: "violet",
    desc: "Sistemas, automatizaciones e inteligencia artificial.",
    items: [
      { id: "automatizaciones", name: "Automatizaciones", icon: Zap, view: "automatizaciones" },
      { id: "agentes", name: "Agentes", icon: Bot },
      { id: "prompts", name: "Prompts", icon: Sparkles, view: "prompts" },
      { id: "integraciones", name: "Integraciones", icon: Link2 },
      { id: "sistemas", name: "Sistemas", icon: Layers },
    ],
  },
  {
    id: "biblioteca", name: "Biblioteca", icon: BookOpen, tone: "blue",
    desc: "Todo el conocimiento de Marketing en Flujo.",
    items: [
      { id: "sops", name: "SOPs", icon: ListChecks, view: "biblioteca" },
      { id: "procesos", name: "Procesos", icon: Route, view: "procesos" },
      { id: "templates", name: "Templates", icon: Paperclip, view: "biblioteca" },
      { id: "prompts-b", name: "Prompts", icon: Sparkles, view: "prompts" },
      { id: "manuales", name: "Manuales", icon: BookOpen, view: "biblioteca" },
      { id: "formacion", name: "Formación", icon: Play, view: "biblioteca" },
    ],
  },
];

export const ESTADO_CLIENTE = {
  activo:     { label: "Activo",     tone: "green" },
  atencion:   { label: "Atención",   tone: "orange" },
  onboarding: { label: "Onboarding", tone: "blue" },
  pausado:    { label: "Pausado",    tone: "gray" },
};

/* --- Herramientas (URLs configurables desde Configuración) --- */
export const TOOLS_INIT = [
  { id: "canva", nombre: "Canva", desc: "Diseño de piezas y creatividades", url: "", color: "#00C4CC", letra: "C" },
  { id: "drive", nombre: "Google Drive", desc: "Archivos, material crudo y entregas", url: "", color: "#1FA463", letra: "D" },
  { id: "metaads", nombre: "Meta Ads Manager", desc: "Campañas y anuncios", url: "", color: "#0866FF", letra: "M" },
  { id: "metabm", nombre: "Meta Business Manager", desc: "Accesos, activos y permisos", url: "", color: "#0064E0", letra: "B" },
  { id: "ga", nombre: "Google Analytics", desc: "Tráfico y conversiones del sitio", url: "", color: "#E8710A", letra: "A" },
  { id: "apollo", nombre: "Apollo", desc: "Prospección y bases de contactos", url: "", color: "#3B4EFF", letra: "A" },
  { id: "make", nombre: "Make", desc: "Automatizaciones entre plataformas", url: "", color: "#6D00CC", letra: "M" },
  { id: "slack", nombre: "Slack", desc: "Comunicación del equipo", url: "", color: "#4A154B", letra: "S" },
  { id: "airtable", nombre: "Airtable", desc: "Base de datos de producción", url: "", color: "#FCB400", letra: "A" },
  { id: "whatsapp", nombre: "WhatsApp", desc: "Contacto directo con clientes", url: "", color: "#25D366", letra: "W" },
  { id: "linkedin", nombre: "LinkedIn", desc: "Prospección y presencia B2B", url: "", color: "#0A66C2", letra: "in" },
  { id: "gcal", nombre: "Google Calendar", desc: "Reuniones y agenda del equipo", url: "", color: "#1A73E8", letra: "31" },
  { id: "chatgpt", nombre: "ChatGPT", desc: "Asistente de redacción y análisis", url: "", color: "#10A37F", letra: "G" },
  { id: "claude", nombre: "Claude", desc: "Asistente de estrategia y guiones", url: "", color: "#D97757", letra: "C" },
];

/* --- Prompts --- */
export const PROMPTS = [
  { id: "p1", nombre: "10 hooks para un reel", cat: "Contenido", herramienta: "Claude", objetivo: "Generar hooks de 1 línea que funcionen sin audio.",
    prompt: "Actuá como estratega de contenido de una agencia.\n\nCliente: [NOMBRE]\nNicho: [NICHO]\nAudiencia: [AUDIENCIA]\nTema del reel: [TEMA]\n\nGenerá 10 hooks de máximo 12 palabras.\nCondiciones:\n- Que se entiendan sin audio\n- Que abran un bucle, no que resuman el video\n- Nada de preguntas genéricas\n- Español rioplatense, tono directo\n\nDevolvé solo la lista numerada." },
  { id: "p2", nombre: "Análisis de campaña Meta", cat: "Ads", herramienta: "Claude", objetivo: "Interpretar métricas y decidir qué cortar y qué escalar.",
    prompt: "Analizá esta campaña de Meta Ads.\n\nObjetivo: [OBJETIVO]\nPresupuesto diario: [MONTO]\nDías activos: [DÍAS]\nDatos por conjunto: [PEGAR TABLA]\n\nDevolvé:\n1. Qué conjuntos cortar y por qué\n2. Qué escalar y en qué porcentaje\n3. Qué creatividad está agotada (mirá frecuencia y CTR)\n4. Una decisión concreta para las próximas 48 h\n\nSé específico, sin recomendaciones genéricas." },
  { id: "p3", nombre: "Diagnóstico de cuenta", cat: "Estrategia", herramienta: "Claude", objetivo: "Detectar el cuello de botella real del cliente.",
    prompt: "Sos consultor de marketing. Analizá esta cuenta.\n\nCliente: [NOMBRE]\nQué vende: [OFERTA]\nTicket: [TICKET]\nVolumen de contenido: [PIEZAS/MES]\nTráfico: [DATOS]\nLeads: [DATOS]\nCierre: [DATOS]\n\nIdentificá en qué punto del flujo se rompe:\ncontenido → distribución → tráfico → oportunidades → ventas.\n\nDevolvé el cuello de botella principal, la evidencia y las 3 acciones que lo destraban." },
  { id: "p4", nombre: "Guion de reel en 3 bloques", cat: "Contenido", herramienta: "Claude", objetivo: "Pasar de ángulo aprobado a guion grabable.",
    prompt: "Escribí un guion de reel de máximo 45 segundos.\n\nÁngulo: [ÁNGULO]\nCliente: [CLIENTE]\nAcción final: [QUÉ QUEREMOS QUE HAGA]\n\nEstructura:\n- Hook (1 línea, primeros 2 segundos)\n- Bloque 1, 2 y 3 (una idea cada uno)\n- Cierre con una sola acción\n\nEscribilo como se habla, no como se escribe. Español rioplatense." },
  { id: "p5", nombre: "Research de competidores", cat: "Research", herramienta: "Claude", objetivo: "Sacar patrones, no opiniones.",
    prompt: "Tengo estas 10 piezas de competidores del nicho [NICHO]:\n\n[PEGAR DESCRIPCIONES Y MÉTRICAS]\n\nDetectá:\n1. Qué tipo de hook se repite en las que más rinden\n2. Qué formato predomina\n3. Qué temas están saturados\n4. Qué hueco hay sin cubrir\n\nDevolvé 3 ángulos aprovechables, cada uno con la referencia que lo respalda." },
  { id: "p6", nombre: "Mensaje de prospección en frío", cat: "Ventas", herramienta: "ChatGPT", objetivo: "Abrir conversación sin sonar a plantilla.",
    prompt: "Escribí un mensaje de LinkedIn para prospección en frío.\n\nA quién: [CARGO] de [TIPO DE EMPRESA]\nQué ofrecemos: ecosistemas de contenido de alto volumen\nSeñal detectada: [ALGO CONCRETO DE SU CUENTA]\n\nReglas:\n- Máximo 60 palabras\n- Empezar por la señal concreta, no por nosotros\n- Sin adjetivos vacíos\n- Cerrar con una pregunta simple\n\nDevolvé 3 variantes." },
  { id: "p7", nombre: "Respuesta a objeción de precio", cat: "Ventas", herramienta: "Claude", objetivo: "Contestar sin bajar el precio.",
    prompt: "Un prospecto dice: \"[OBJECIÓN]\".\n\nContexto: [SITUACIÓN DEL PROSPECTO]\nNuestro servicio: [SERVICIO Y PRECIO]\n\nEscribí una respuesta que:\n- Reconozca la objeción sin dramatizarla\n- Reencuadre hacia el costo de no resolverlo\n- Termine en una pregunta que avance la conversación\n\nTono directo, español rioplatense. Máximo 100 palabras." },
  { id: "p8", nombre: "Resumen de reunión con cliente", cat: "Clientes", herramienta: "Claude", objetivo: "Convertir una reunión en tareas concretas.",
    prompt: "Tomá estas notas de reunión:\n\n[PEGAR NOTAS]\n\nDevolvé:\n1. Resumen en 5 líneas\n2. Decisiones tomadas\n3. Tareas con responsable y fecha\n4. Temas pendientes de definir\n\nNada de relleno. Solo lo accionable." },
  { id: "p9", nombre: "Auditar un proceso interno", cat: "Operaciones", herramienta: "Claude", objetivo: "Encontrar dónde se traba el proceso.",
    prompt: "Este es nuestro proceso actual de [PROCESO]:\n\n[PEGAR ETAPAS]\n\nAnalizá:\n1. Qué etapa acumula demoras y por qué\n2. Qué paso es redundante\n3. Qué se puede automatizar\n4. Qué falta documentar\n\nProponé una versión simplificada con menos etapas." },
  { id: "p10", nombre: "Copy para el post de un reel", cat: "Contenido", herramienta: "ChatGPT", objetivo: "Sostener la promesa del video en el texto.",
    prompt: "Escribí el copy del post para este reel.\n\nHook del video: [HOOK]\nTema: [TEMA]\nAcción buscada: [ACCIÓN]\nCliente: [CLIENTE]\n\nReglas:\n- Primera línea que continúe el hook, no que lo repita\n- Máximo 4 líneas de desarrollo\n- Llamada a la acción concreta\n- 5 hashtags del nicho\n\nEspañol rioplatense." },
];

/* --- Automatizaciones --- */
export const AUTOMATIZACIONES = [
  {
    id: "a1", nombre: "Nuevo lead → CRM", estado: "activa", corridas: "312 este mes",
    desc: "Cada lead que entra queda cargado, asignado y notificado en menos de un minuto.",
    pasos: [
      { tipo: "Disparador", t: "Entra un lead nuevo", d: "Formulario de Meta Ads o web" },
      { tipo: "Acción", t: "Crear contacto", d: "Se carga en el CRM con origen y campaña" },
      { tipo: "Acción", t: "Asignar setter", d: "Por turno rotativo del equipo de ventas" },
      { tipo: "Acción", t: "Enviar notificación", d: "Mensaje al canal de ventas en Slack" },
      { tipo: "Acción", t: "Registrar actividad", d: "Queda el registro en el Client Hub" },
    ],
  },
  {
    id: "a2", nombre: "Contenido aprobado → Publicación", estado: "activa", corridas: "148 este mes",
    desc: "Cuando el cliente aprueba, la pieza se programa sola en el horario definido.",
    pasos: [
      { tipo: "Disparador", t: "El cliente aprueba una pieza", d: "Desde el Client Hub" },
      { tipo: "Acción", t: "Mover a Publicados", d: "Cambia de estado en el sistema" },
      { tipo: "Acción", t: "Programar en Metricool", d: "Usa el horario del cliente" },
      { tipo: "Acción", t: "Avisar al equipo", d: "Notificación en Slack" },
    ],
  },
  {
    id: "a3", nombre: "Campaña sin conversiones → Alerta", estado: "activa", corridas: "9 este mes",
    desc: "Avisa antes de que se queme el presupuesto, no después.",
    pasos: [
      { tipo: "Disparador", t: "24 h sin conversiones", d: "Con más de USD 50 gastados" },
      { tipo: "Acción", t: "Chequear el píxel", d: "Verifica que el evento esté disparando" },
      { tipo: "Acción", t: "Crear tarea urgente", d: "Asignada al media buyer del cliente" },
      { tipo: "Acción", t: "Notificar a Dirección", d: "Aparece en Qué necesita mi atención" },
    ],
  },
  {
    id: "a4", nombre: "Cliente nuevo → Onboarding", estado: "pausada", corridas: "3 este mes",
    desc: "Arma toda la estructura del cliente apenas se firma.",
    pasos: [
      { tipo: "Disparador", t: "Se firma un contrato", d: "Desde Ventas" },
      { tipo: "Acción", t: "Crear Client Hub", d: "Con plan, responsable y objetivo" },
      { tipo: "Acción", t: "Crear carpetas en Drive", d: "Estructura estándar de la agencia" },
      { tipo: "Acción", t: "Cargar tareas de onboarding", d: "Las 5 etapas del proceso" },
      { tipo: "Acción", t: "Agendar kickoff", d: "En Google Calendar" },
    ],
  },
];



export const TIPO_EVENTO = {
  cliente:   { label: "Cliente",   tone: "blue" },
  contenido: { label: "Contenido", tone: "orange" },
  ventas:    { label: "Ventas",    tone: "green" },
  ads:       { label: "Ads",       tone: "violet" },
  interno:   { label: "Interno",   tone: "gray" },
};

/* --- Biblioteca --- */
export const BIBLIOTECA = [
  { id: "b1", nombre: "Checklist de lanzamiento de campaña", tipo: "Checklist", area: "Paid Media" },
  { id: "b2", nombre: "Template de briefing de cliente", tipo: "Template", area: "Estrategia" },
  { id: "b3", nombre: "Manual de marca de Marketing en Flujo", tipo: "Manual", area: "Interno" },
  { id: "b4", nombre: "Template de informe mensual", tipo: "Template", area: "Dirección" },
  { id: "b5", nombre: "Formación: cómo escribir hooks", tipo: "Formación", area: "Contenido" },
  { id: "b6", nombre: "Template de propuesta comercial", tipo: "Template", area: "Ventas" },
  { id: "b7", nombre: "Manual de estilo de subtítulos", tipo: "Manual", area: "Contenido" },
  { id: "b8", nombre: "Formación: estructura de cuentas en Meta", tipo: "Formación", area: "Paid Media" },
  { id: "b9", nombre: "Checklist de onboarding de cliente", tipo: "Checklist", area: "Operaciones" },
];

/* --- Accesos rápidos configurables --- */
export const QUICK_INIT = [
  { id: "q1", nombre: "Reunión diaria", icon: Video, meta: "10:00", on: true, to: { view: "calendario" } },
  { id: "q2", nombre: "Informe semanal", icon: FileText, meta: "Viernes", on: true, to: { view: "ceo" } },
  { id: "q3", nombre: "Revisar campañas", icon: Megaphone, meta: "", on: true, to: { view: "area", id: "paid" } },
  { id: "q4", nombre: "Aprobar contenidos", icon: ThumbsUp, meta: "3", on: true, to: { view: "sub", areaId: "contenido", subId: "aprobaciones" } },
  { id: "q5", nombre: "Dashboard financiero", icon: Wallet, meta: "", on: true, to: { view: "sub", areaId: "direccion", subId: "finanzas" } },
  { id: "q6", nombre: "Nuevo cliente", icon: UserPlus, meta: "", on: false, to: { view: "clientes" } },
  { id: "q7", nombre: "Nueva tarea", icon: Plus, meta: "", on: false, to: { view: "tareas" } },
];

export const FLUJO = ["Contenido", "Distribución", "Tráfico", "Oportunidades", "Ventas", "Datos", "Optimización", "Crecimiento"];

/* --- Registros demo por submódulo (los que no tienen vista propia) --- */
const MODULOS = {
  "direccion/objetivos": { col: "Objetivo", rows: [
    { t: "Llegar a 15 clientes activos", meta: "Q3 2026", estado: "curso", extra: "12 de 15" },
    { t: "MRR de USD 25.000", meta: "Q3 2026", estado: "curso", extra: "USD 18.450" },
    { t: "Churn por debajo de 5%", meta: "Anual", estado: "completada", extra: "3,1%" },
    { t: "Documentar los 12 procesos core", meta: "Sep 2026", estado: "curso", extra: "8 de 12" },
  ]},
  "direccion/kpis": { col: "Indicador", rows: [
    { t: "Costo por lead promedio", meta: "Objetivo: USD 30", estado: "completada", extra: "USD 27" },
    { t: "Tiempo de aprobación de contenido", meta: "Objetivo: 48 h", estado: "revision", extra: "62 h" },
    { t: "Piezas publicadas por cliente", meta: "Objetivo: 24/mes", estado: "completada", extra: "27" },
    { t: "Conversión de propuesta a cierre", meta: "Objetivo: 30%", estado: "curso", extra: "26%" },
  ]},
  "direccion/finanzas": { col: "Concepto", rows: [
    { t: "Facturación de agosto", meta: "Ingresos", estado: "curso", extra: "USD 18.450" },
    { t: "Costos de equipo", meta: "Egresos", estado: "curso", extra: "USD 7.900" },
    { t: "Herramientas y software", meta: "Egresos", estado: "curso", extra: "USD 640" },
    { t: "Margen del mes", meta: "Resultado", estado: "completada", extra: "52%" },
  ]},
  "direccion/pipeline": { col: "Oportunidad", rows: [
    { t: "Estudio jurídico Rivas", meta: "Propuesta enviada", estado: "revision", extra: "USD 2.400/mes" },
    { t: "Clínica Sur", meta: "Reunión agendada", estado: "curso", extra: "USD 1.800/mes" },
    { t: "Distribuidora Norte", meta: "Primer contacto", estado: "pendiente", extra: "USD 1.200/mes" },
    { t: "Marca de indumentaria", meta: "Negociación", estado: "curso", extra: "USD 3.000/mes" },
  ]},
  "direccion/decisiones": { col: "Decisión", rows: [
    { t: "Subir el piso de ticket a USD 1.500", meta: "Tomada el 04/08", estado: "completada", extra: "Dirección" },
    { t: "Sumar un editor part time", meta: "Tomada el 11/08", estado: "curso", extra: "Operaciones" },
    { t: "Cortar el plan Starter para nuevos", meta: "En evaluación", estado: "revision", extra: "Dirección" },
  ]},
  "operaciones/proyectos": { col: "Proyecto", rows: [
    { t: "Ecosistema de contenido agosto", meta: "Nórdika Studio", estado: "curso", extra: "68%" },
    { t: "Campaña Q3", meta: "Vitalis Salud", estado: "curso", extra: "45%" },
    { t: "Preventa desarrollo nuevo", meta: "Casa Campo", estado: "bloqueada", extra: "20%" },
    { t: "Onboarding completo", meta: "Altair Consultora", estado: "curso", extra: "35%" },
    { t: "Contenido orgánico mensual", meta: "Brotes Orgánico", estado: "curso", extra: "80%" },
  ]},
  "operaciones/produccion": { col: "Lote", rows: [
    { t: "12 reels — sesión del 14/08", meta: "Vitalis Salud", estado: "curso", extra: "8 editados" },
    { t: "8 carruseles de agosto", meta: "Nórdika Studio", estado: "revision", extra: "En revisión" },
    { t: "6 reels de producto", meta: "Brotes Orgánico", estado: "pendiente", extra: "Sin grabar" },
  ]},
  "operaciones/calidad": { col: "Revisión", rows: [
    { t: "Chequeo de marca en piezas de agosto", meta: "Nórdika Studio", estado: "completada", extra: "Sin observaciones" },
    { t: "Auditoría de tracking", meta: "Casa Campo", estado: "bloqueada", extra: "Falta acceso" },
    { t: "Revisión de subtítulos", meta: "Vitalis Salud", estado: "revision", extra: "2 correcciones" },
  ]},
  "estrategia/diagnosticos": { col: "Diagnóstico", rows: [
    { t: "Auditoría inicial de cuenta", meta: "Altair Consultora", estado: "curso", extra: "Facu" },
    { t: "Revisión de embudo", meta: "Casa Campo", estado: "revision", extra: "Sofi" },
    { t: "Diagnóstico de contenido", meta: "Brotes Orgánico", estado: "completada", extra: "Facu" },
  ]},
  "estrategia/arquitectura": { col: "Arquitectura", rows: [
    { t: "Ecosistema de 3 formatos", meta: "Nórdika Studio", estado: "completada", extra: "Vigente" },
    { t: "Embudo de turnos por sede", meta: "Vitalis Salud", estado: "completada", extra: "Vigente" },
    { t: "Arquitectura inicial", meta: "Altair Consultora", estado: "curso", extra: "En armado" },
  ]},
  "estrategia/roadmaps": { col: "Roadmap", rows: [
    { t: "Plan de 90 días", meta: "Altair Consultora", estado: "curso", extra: "Día 12" },
    { t: "Preventa hasta octubre", meta: "Casa Campo", estado: "curso", extra: "Fase 2 de 4" },
    { t: "Escala de volumen orgánico", meta: "Brotes Orgánico", estado: "pendiente", extra: "Arranca en Sep" },
  ]},
  "estrategia/ofertas": { col: "Oferta", rows: [
    { t: "Primera consulta sin cargo", meta: "Vitalis Salud", estado: "completada", extra: "Convierte 9,1%" },
    { t: "Visita guiada al desarrollo", meta: "Casa Campo", estado: "revision", extra: "A ajustar" },
    { t: "Combo de bienvenida", meta: "Brotes Orgánico", estado: "curso", extra: "En prueba" },
  ]},
  "estrategia/estrategias": { col: "Estrategia", rows: [
    { t: "Autoridad + prueba social", meta: "Nórdika Studio", estado: "curso", extra: "Vigente" },
    { t: "Volumen + captación local", meta: "Vitalis Salud", estado: "curso", extra: "Vigente" },
    { t: "Educación previa a la preventa", meta: "Casa Campo", estado: "revision", extra: "En ajuste" },
  ]},
  "contenido/ideas": { col: "Idea", rows: [
    { t: "Los 5 errores al reformar un ambiente", meta: "Nórdika Studio", estado: "completada", extra: "Aprobada" },
    { t: "Cuánto tarda realmente un turno", meta: "Vitalis Salud", estado: "curso", extra: "En guion" },
    { t: "De la huerta a tu casa en 24 h", meta: "Brotes Orgánico", estado: "pendiente", extra: "Sin revisar" },
    { t: "Qué mirar antes de comprar en pozo", meta: "Casa Campo", estado: "revision", extra: "En revisión" },
  ]},
  "contenido/research-c": { col: "Hallazgo", rows: [
    { t: "Los antes y después rinden 3x en interiorismo", meta: "Nórdika Studio", estado: "completada", extra: "10 referencias" },
    { t: "Formato pregunta-respuesta domina en salud", meta: "Vitalis Salud", estado: "completada", extra: "8 referencias" },
    { t: "Saturación de contenido de recetas", meta: "Brotes Orgánico", estado: "revision", extra: "Evitar" },
  ]},
  "contenido/guiones": { col: "Guion", rows: [
    { t: "Reel — objeciones de precio", meta: "Nórdika Studio", estado: "curso", extra: "Nico" },
    { t: "Reel — cómo es la primera consulta", meta: "Vitalis Salud", estado: "completada", extra: "Listo" },
    { t: "Carrusel — 5 errores al reformar", meta: "Nórdika Studio", estado: "revision", extra: "Juli" },
  ]},
  "contenido/grabaciones": { col: "Sesión", rows: [
    { t: "Sede Centro — 12 piezas", meta: "19/08 · 14:00", estado: "pendiente", extra: "Vitalis Salud" },
    { t: "Showroom — 8 piezas", meta: "14/08", estado: "completada", extra: "Nórdika Studio" },
    { t: "Depósito — 6 piezas", meta: "28/08 · 10:00", estado: "pendiente", extra: "Brotes Orgánico" },
  ]},
  "contenido/edicion": { col: "Pieza", rows: [
    { t: "Reel 04 — primera consulta", meta: "Vitalis Salud", estado: "curso", extra: "Juli" },
    { t: "Reel 05 — turnos online", meta: "Vitalis Salud", estado: "pendiente", extra: "Sin asignar" },
    { t: "Carrusel — antes y después", meta: "Nórdika Studio", estado: "completada", extra: "Exportado" },
  ]},
  "contenido/aprobaciones": { col: "Pieza esperando", rows: [
    { t: "Reel — objeciones de precio", meta: "Nórdika Studio · enviado 16/08", estado: "revision", extra: "2 días" },
    { t: "Carrusel — 5 errores al reformar", meta: "Nórdika Studio · enviado 16/08", estado: "revision", extra: "2 días" },
    { t: "Reel — antes y después", meta: "Nórdika Studio · enviado 17/08", estado: "revision", extra: "1 día" },
  ]},
  "contenido/publicados": { col: "Publicado", rows: [
    { t: "Reel — cómo elegir revestimientos", meta: "Nórdika Studio · 12/08", estado: "completada", extra: "18.400 vistas" },
    { t: "Reel — turnos en el día", meta: "Vitalis Salud · 13/08", estado: "completada", extra: "32.100 vistas" },
    { t: "Carrusel — huerta propia", meta: "Brotes Orgánico · 15/08", estado: "completada", extra: "6.800 vistas" },
  ]},
  "paid/campanas": { col: "Campaña", rows: [
    { t: "Primavera — turnos", meta: "Vitalis Salud", estado: "curso", extra: "ROAS 5,6x" },
    { t: "Preventa desarrollo", meta: "Casa Campo", estado: "bloqueada", extra: "Sin conversiones" },
    { t: "Captación showroom", meta: "Nórdika Studio", estado: "curso", extra: "ROAS 4,2x" },
    { t: "Primera compra", meta: "Brotes Orgánico", estado: "revision", extra: "ROAS 3,1x" },
  ]},
  "paid/creatividades": { col: "Creatividad", rows: [
    { t: "Variante A — testimonio", meta: "Vitalis Salud", estado: "completada", extra: "CTR 2,8%" },
    { t: "Variante B — precio", meta: "Vitalis Salud", estado: "curso", extra: "CTR 1,4%" },
    { t: "Variante C — recorrido", meta: "Casa Campo", estado: "revision", extra: "Frecuencia alta" },
  ]},
  "paid/presupuestos": { col: "Presupuesto", rows: [
    { t: "Agosto — Vitalis Salud", meta: "USD 4.200", estado: "curso", extra: "68% ejecutado" },
    { t: "Agosto — Casa Campo", meta: "USD 2.000", estado: "revision", extra: "41% ejecutado" },
    { t: "Agosto — Nórdika Studio", meta: "USD 1.800", estado: "curso", extra: "74% ejecutado" },
  ]},
  "paid/metricas": { col: "Métrica", rows: [
    { t: "ROAS general de la agencia", meta: "Agosto", estado: "completada", extra: "4,4x" },
    { t: "Costo por lead promedio", meta: "Agosto", estado: "completada", extra: "USD 27" },
    { t: "Inversión total gestionada", meta: "Agosto", estado: "curso", extra: "USD 8.000" },
  ]},
  "paid/tests": { col: "Test", rows: [
    { t: "Hook testimonial vs. dato duro", meta: "Vitalis Salud", estado: "curso", extra: "Día 4 de 7" },
    { t: "Video vertical vs. carrusel", meta: "Nórdika Studio", estado: "completada", extra: "Ganó vertical" },
    { t: "Landing corta vs. larga", meta: "Casa Campo", estado: "pendiente", extra: "Sin arrancar" },
  ]},
  "paid/optimizaciones": { col: "Optimización", rows: [
    { t: "Pausamos el conjunto de intereses amplios", meta: "16/08 · Vitalis", estado: "completada", extra: "CPL bajó 22%" },
    { t: "Subimos 20% el conjunto lookalike", meta: "15/08 · Nórdika", estado: "completada", extra: "Sostuvo ROAS" },
    { t: "Falta revisar el píxel", meta: "18/08 · Casa Campo", estado: "bloqueada", extra: "Urgente" },
  ]},
  "research/tendencias": { col: "Tendencia", rows: [
    { t: "Formato \"día en la vida\" en servicios", meta: "Detectada en agosto", estado: "curso", extra: "Alta tracción" },
    { t: "Audios en tendencia con voz en off", meta: "Detectada en agosto", estado: "curso", extra: "Media" },
    { t: "Carruseles largos perdiendo alcance", meta: "Detectada en julio", estado: "completada", extra: "Confirmado" },
  ]},
  "research/competidores": { col: "Competidor", rows: [
    { t: "5 estudios de interiorismo del rubro", meta: "Nórdika Studio", estado: "completada", extra: "Actualizado 12/08" },
    { t: "4 centros de salud de la zona", meta: "Vitalis Salud", estado: "completada", extra: "Actualizado 10/08" },
    { t: "6 desarrolladoras locales", meta: "Casa Campo", estado: "revision", extra: "Desactualizado" },
  ]},
  "research/mercado": { col: "Informe", rows: [
    { t: "Estacionalidad de turnos en salud", meta: "Vitalis Salud", estado: "completada", extra: "Julio 2026" },
    { t: "Ticket promedio en reformas", meta: "Nórdika Studio", estado: "completada", extra: "Junio 2026" },
    { t: "Demanda de vivienda en pozo", meta: "Casa Campo", estado: "curso", extra: "En armado" },
  ]},
  "research/hooks": { col: "Hook", rows: [
    { t: "\"Esto lo hacen mal el 90% de las reformas\"", meta: "Interiorismo", estado: "completada", extra: "Retención 68%" },
    { t: "\"Vas a esperar 3 semanas por esto\"", meta: "Salud", estado: "completada", extra: "Retención 74%" },
    { t: "\"Nadie te dice esto antes de comprar\"", meta: "Inmobiliaria", estado: "curso", extra: "En prueba" },
  ]},
  "research/referencias": { col: "Referencia", rows: [
    { t: "Cuenta de interiorismo nórdico", meta: "Guardada 12/08", estado: "completada", extra: "12 piezas" },
    { t: "Clínica con formato pregunta-respuesta", meta: "Guardada 10/08", estado: "completada", extra: "8 piezas" },
    { t: "Marca de alimentos con voz propia", meta: "Guardada 08/08", estado: "completada", extra: "10 piezas" },
  ]},
  "ventas/leads": { col: "Lead", rows: [
    { t: "Estudio jurídico Rivas", meta: "Origen: Apollo", estado: "curso", extra: "Contactado" },
    { t: "Clínica Sur", meta: "Origen: Instagram", estado: "curso", extra: "Reunión agendada" },
    { t: "Distribuidora Norte", meta: "Origen: Referido", estado: "pendiente", extra: "Sin contactar" },
    { t: "Marca de indumentaria", meta: "Origen: LinkedIn", estado: "revision", extra: "Negociando" },
  ]},
  "ventas/prospeccion": { col: "Campaña de prospección", rows: [
    { t: "Estudios profesionales — LinkedIn", meta: "120 contactos", estado: "curso", extra: "18% respuesta" },
    { t: "Salud privada — mail", meta: "80 contactos", estado: "completada", extra: "12% respuesta" },
    { t: "Retail local — Instagram", meta: "60 contactos", estado: "pendiente", extra: "Sin arrancar" },
  ]},
  "ventas/setters": { col: "Setter", rows: [
    { t: "Facu", meta: "22 conversaciones", estado: "curso", extra: "8 reuniones" },
    { t: "Sofi", meta: "18 conversaciones", estado: "curso", extra: "5 reuniones" },
  ]},
  "ventas/reuniones": { col: "Reunión", rows: [
    { t: "Demo con lead de Apollo", meta: "22/08 · 17:30", estado: "pendiente", extra: "Facu" },
    { t: "Clínica Sur — primera reunión", meta: "26/08 · 11:00", estado: "pendiente", extra: "Facu" },
    { t: "Marca de indumentaria — cierre", meta: "15/08", estado: "completada", extra: "Avanza" },
  ]},
  "ventas/propuestas": { col: "Propuesta", rows: [
    { t: "Estudio jurídico Rivas", meta: "Enviada 14/08", estado: "revision", extra: "USD 2.400/mes" },
    { t: "Marca de indumentaria", meta: "Enviada 12/08", estado: "curso", extra: "USD 3.000/mes" },
    { t: "Clínica Sur", meta: "Sin enviar", estado: "pendiente", extra: "USD 1.800/mes" },
  ]},
  "ventas/cierres": { col: "Cierre", rows: [
    { t: "Altair Consultora", meta: "Cerrado 05/08", estado: "completada", extra: "USD 2.200/mes" },
    { t: "Brotes Orgánico", meta: "Cerrado 12/06", estado: "completada", extra: "USD 900/mes" },
  ]},
  "ia/agentes": { col: "Agente", rows: [
    { t: "Agente de guiones", meta: "Contenido", estado: "curso", extra: "Activo" },
    { t: "Agente de análisis de campañas", meta: "Paid Media", estado: "curso", extra: "Activo" },
    { t: "Agente de research de competidores", meta: "Research", estado: "revision", extra: "En prueba" },
  ]},
  "ia/integraciones": { col: "Integración", rows: [
    { t: "Meta Ads → Sistema", meta: "Métricas cada 6 h", estado: "curso", extra: "Conectada" },
    { t: "Metricool → Sistema", meta: "Publicaciones y alcance", estado: "curso", extra: "Conectada" },
    { t: "CRM → Sistema", meta: "Leads y oportunidades", estado: "revision", extra: "Parcial" },
    { t: "Google Analytics → Sistema", meta: "Tráfico y conversiones", estado: "pendiente", extra: "Sin conectar" },
  ]},
  "ia/sistemas": { col: "Sistema", rows: [
    { t: "Sistema de producción de contenido", meta: "10 etapas documentadas", estado: "completada", extra: "Vigente" },
    { t: "Sistema de adquisición", meta: "7 etapas documentadas", estado: "curso", extra: "En revisión" },
    { t: "Sistema de onboarding", meta: "5 etapas documentadas", estado: "completada", extra: "Vigente" },
  ]},
};

/* --- Registros demo por submódulo (los que no tienen vista propia) --- */
export const MODULOS = {
  "direccion/objetivos": { col: "Objetivo", rows: [
    { t: "Llegar a 15 clientes activos", meta: "Q3 2026", estado: "curso", extra: "12 de 15" },
    { t: "MRR de USD 25.000", meta: "Q3 2026", estado: "curso", extra: "USD 18.450" },
    { t: "Churn por debajo de 5%", meta: "Anual", estado: "completada", extra: "3,1%" },
    { t: "Documentar los 12 procesos core", meta: "Sep 2026", estado: "curso", extra: "8 de 12" },
  ]},
  "direccion/kpis": { col: "Indicador", rows: [
    { t: "Costo por lead promedio", meta: "Objetivo: USD 30", estado: "completada", extra: "USD 27" },
    { t: "Tiempo de aprobación de contenido", meta: "Objetivo: 48 h", estado: "revision", extra: "62 h" },
    { t: "Piezas publicadas por cliente", meta: "Objetivo: 24/mes", estado: "completada", extra: "27" },
    { t: "Conversión de propuesta a cierre", meta: "Objetivo: 30%", estado: "curso", extra: "26%" },
  ]},
  "direccion/finanzas": { col: "Concepto", rows: [
    { t: "Facturación de agosto", meta: "Ingresos", estado: "curso", extra: "USD 18.450" },
    { t: "Costos de equipo", meta: "Egresos", estado: "curso", extra: "USD 7.900" },
    { t: "Herramientas y software", meta: "Egresos", estado: "curso", extra: "USD 640" },
    { t: "Margen del mes", meta: "Resultado", estado: "completada", extra: "52%" },
  ]},
  "direccion/pipeline": { col: "Oportunidad", rows: [
    { t: "Estudio jurídico Rivas", meta: "Propuesta enviada", estado: "revision", extra: "USD 2.400/mes" },
    { t: "Clínica Sur", meta: "Reunión agendada", estado: "curso", extra: "USD 1.800/mes" },
    { t: "Distribuidora Norte", meta: "Primer contacto", estado: "pendiente", extra: "USD 1.200/mes" },
    { t: "Marca de indumentaria", meta: "Negociación", estado: "curso", extra: "USD 3.000/mes" },
  ]},
  "direccion/decisiones": { col: "Decisión", rows: [
    { t: "Subir el piso de ticket a USD 1.500", meta: "Tomada el 04/08", estado: "completada", extra: "Dirección" },
    { t: "Sumar un editor part time", meta: "Tomada el 11/08", estado: "curso", extra: "Operaciones" },
    { t: "Cortar el plan Starter para nuevos", meta: "En evaluación", estado: "revision", extra: "Dirección" },
  ]},
  "operaciones/proyectos": { col: "Proyecto", rows: [
    { t: "Ecosistema de contenido agosto", meta: "Nórdika Studio", estado: "curso", extra: "68%" },
    { t: "Campaña Q3", meta: "Vitalis Salud", estado: "curso", extra: "45%" },
    { t: "Preventa desarrollo nuevo", meta: "Casa Campo", estado: "bloqueada", extra: "20%" },
    { t: "Onboarding completo", meta: "Altair Consultora", estado: "curso", extra: "35%" },
    { t: "Contenido orgánico mensual", meta: "Brotes Orgánico", estado: "curso", extra: "80%" },
  ]},
  "operaciones/produccion": { col: "Lote", rows: [
    { t: "12 reels — sesión del 14/08", meta: "Vitalis Salud", estado: "curso", extra: "8 editados" },
    { t: "8 carruseles de agosto", meta: "Nórdika Studio", estado: "revision", extra: "En revisión" },
    { t: "6 reels de producto", meta: "Brotes Orgánico", estado: "pendiente", extra: "Sin grabar" },
  ]},
  "operaciones/calidad": { col: "Revisión", rows: [
    { t: "Chequeo de marca en piezas de agosto", meta: "Nórdika Studio", estado: "completada", extra: "Sin observaciones" },
    { t: "Auditoría de tracking", meta: "Casa Campo", estado: "bloqueada", extra: "Falta acceso" },
    { t: "Revisión de subtítulos", meta: "Vitalis Salud", estado: "revision", extra: "2 correcciones" },
  ]},
  "estrategia/diagnosticos": { col: "Diagnóstico", rows: [
    { t: "Auditoría inicial de cuenta", meta: "Altair Consultora", estado: "curso", extra: "Facu" },
    { t: "Revisión de embudo", meta: "Casa Campo", estado: "revision", extra: "Sofi" },
    { t: "Diagnóstico de contenido", meta: "Brotes Orgánico", estado: "completada", extra: "Facu" },
  ]},
  "estrategia/arquitectura": { col: "Arquitectura", rows: [
    { t: "Ecosistema de 3 formatos", meta: "Nórdika Studio", estado: "completada", extra: "Vigente" },
    { t: "Embudo de turnos por sede", meta: "Vitalis Salud", estado: "completada", extra: "Vigente" },
    { t: "Arquitectura inicial", meta: "Altair Consultora", estado: "curso", extra: "En armado" },
  ]},
  "estrategia/roadmaps": { col: "Roadmap", rows: [
    { t: "Plan de 90 días", meta: "Altair Consultora", estado: "curso", extra: "Día 12" },
    { t: "Preventa hasta octubre", meta: "Casa Campo", estado: "curso", extra: "Fase 2 de 4" },
    { t: "Escala de volumen orgánico", meta: "Brotes Orgánico", estado: "pendiente", extra: "Arranca en Sep" },
  ]},
  "estrategia/ofertas": { col: "Oferta", rows: [
    { t: "Primera consulta sin cargo", meta: "Vitalis Salud", estado: "completada", extra: "Convierte 9,1%" },
    { t: "Visita guiada al desarrollo", meta: "Casa Campo", estado: "revision", extra: "A ajustar" },
    { t: "Combo de bienvenida", meta: "Brotes Orgánico", estado: "curso", extra: "En prueba" },
  ]},
  "estrategia/estrategias": { col: "Estrategia", rows: [
    { t: "Autoridad + prueba social", meta: "Nórdika Studio", estado: "curso", extra: "Vigente" },
    { t: "Volumen + captación local", meta: "Vitalis Salud", estado: "curso", extra: "Vigente" },
    { t: "Educación previa a la preventa", meta: "Casa Campo", estado: "revision", extra: "En ajuste" },
  ]},
  "contenido/ideas": { col: "Idea", rows: [
    { t: "Los 5 errores al reformar un ambiente", meta: "Nórdika Studio", estado: "completada", extra: "Aprobada" },
    { t: "Cuánto tarda realmente un turno", meta: "Vitalis Salud", estado: "curso", extra: "En guion" },
    { t: "De la huerta a tu casa en 24 h", meta: "Brotes Orgánico", estado: "pendiente", extra: "Sin revisar" },
    { t: "Qué mirar antes de comprar en pozo", meta: "Casa Campo", estado: "revision", extra: "En revisión" },
  ]},
  "contenido/research-c": { col: "Hallazgo", rows: [
    { t: "Los antes y después rinden 3x en interiorismo", meta: "Nórdika Studio", estado: "completada", extra: "10 referencias" },
    { t: "Formato pregunta-respuesta domina en salud", meta: "Vitalis Salud", estado: "completada", extra: "8 referencias" },
    { t: "Saturación de contenido de recetas", meta: "Brotes Orgánico", estado: "revision", extra: "Evitar" },
  ]},
  "contenido/guiones": { col: "Guion", rows: [
    { t: "Reel — objeciones de precio", meta: "Nórdika Studio", estado: "curso", extra: "Nico" },
    { t: "Reel — cómo es la primera consulta", meta: "Vitalis Salud", estado: "completada", extra: "Listo" },
    { t: "Carrusel — 5 errores al reformar", meta: "Nórdika Studio", estado: "revision", extra: "Juli" },
  ]},
  "contenido/grabaciones": { col: "Sesión", rows: [
    { t: "Sede Centro — 12 piezas", meta: "19/08 · 14:00", estado: "pendiente", extra: "Vitalis Salud" },
    { t: "Showroom — 8 piezas", meta: "14/08", estado: "completada", extra: "Nórdika Studio" },
    { t: "Depósito — 6 piezas", meta: "28/08 · 10:00", estado: "pendiente", extra: "Brotes Orgánico" },
  ]},
  "contenido/edicion": { col: "Pieza", rows: [
    { t: "Reel 04 — primera consulta", meta: "Vitalis Salud", estado: "curso", extra: "Juli" },
    { t: "Reel 05 — turnos online", meta: "Vitalis Salud", estado: "pendiente", extra: "Sin asignar" },
    { t: "Carrusel — antes y después", meta: "Nórdika Studio", estado: "completada", extra: "Exportado" },
  ]},
  "contenido/aprobaciones": { col: "Pieza esperando", rows: [
    { t: "Reel — objeciones de precio", meta: "Nórdika Studio · enviado 16/08", estado: "revision", extra: "2 días" },
    { t: "Carrusel — 5 errores al reformar", meta: "Nórdika Studio · enviado 16/08", estado: "revision", extra: "2 días" },
    { t: "Reel — antes y después", meta: "Nórdika Studio · enviado 17/08", estado: "revision", extra: "1 día" },
  ]},
  "contenido/publicados": { col: "Publicado", rows: [
    { t: "Reel — cómo elegir revestimientos", meta: "Nórdika Studio · 12/08", estado: "completada", extra: "18.400 vistas" },
    { t: "Reel — turnos en el día", meta: "Vitalis Salud · 13/08", estado: "completada", extra: "32.100 vistas" },
    { t: "Carrusel — huerta propia", meta: "Brotes Orgánico · 15/08", estado: "completada", extra: "6.800 vistas" },
  ]},
  "paid/campanas": { col: "Campaña", rows: [
    { t: "Primavera — turnos", meta: "Vitalis Salud", estado: "curso", extra: "ROAS 5,6x" },
    { t: "Preventa desarrollo", meta: "Casa Campo", estado: "bloqueada", extra: "Sin conversiones" },
    { t: "Captación showroom", meta: "Nórdika Studio", estado: "curso", extra: "ROAS 4,2x" },
    { t: "Primera compra", meta: "Brotes Orgánico", estado: "revision", extra: "ROAS 3,1x" },
  ]},
  "paid/creatividades": { col: "Creatividad", rows: [
    { t: "Variante A — testimonio", meta: "Vitalis Salud", estado: "completada", extra: "CTR 2,8%" },
    { t: "Variante B — precio", meta: "Vitalis Salud", estado: "curso", extra: "CTR 1,4%" },
    { t: "Variante C — recorrido", meta: "Casa Campo", estado: "revision", extra: "Frecuencia alta" },
  ]},
  "paid/presupuestos": { col: "Presupuesto", rows: [
    { t: "Agosto — Vitalis Salud", meta: "USD 4.200", estado: "curso", extra: "68% ejecutado" },
    { t: "Agosto — Casa Campo", meta: "USD 2.000", estado: "revision", extra: "41% ejecutado" },
    { t: "Agosto — Nórdika Studio", meta: "USD 1.800", estado: "curso", extra: "74% ejecutado" },
  ]},
  "paid/metricas": { col: "Métrica", rows: [
    { t: "ROAS general de la agencia", meta: "Agosto", estado: "completada", extra: "4,4x" },
    { t: "Costo por lead promedio", meta: "Agosto", estado: "completada", extra: "USD 27" },
    { t: "Inversión total gestionada", meta: "Agosto", estado: "curso", extra: "USD 8.000" },
  ]},
  "paid/tests": { col: "Test", rows: [
    { t: "Hook testimonial vs. dato duro", meta: "Vitalis Salud", estado: "curso", extra: "Día 4 de 7" },
    { t: "Video vertical vs. carrusel", meta: "Nórdika Studio", estado: "completada", extra: "Ganó vertical" },
    { t: "Landing corta vs. larga", meta: "Casa Campo", estado: "pendiente", extra: "Sin arrancar" },
  ]},
  "paid/optimizaciones": { col: "Optimización", rows: [
    { t: "Pausamos el conjunto de intereses amplios", meta: "16/08 · Vitalis", estado: "completada", extra: "CPL bajó 22%" },
    { t: "Subimos 20% el conjunto lookalike", meta: "15/08 · Nórdika", estado: "completada", extra: "Sostuvo ROAS" },
    { t: "Falta revisar el píxel", meta: "18/08 · Casa Campo", estado: "bloqueada", extra: "Urgente" },
  ]},
  "research/tendencias": { col: "Tendencia", rows: [
    { t: "Formato \"día en la vida\" en servicios", meta: "Detectada en agosto", estado: "curso", extra: "Alta tracción" },
    { t: "Audios en tendencia con voz en off", meta: "Detectada en agosto", estado: "curso", extra: "Media" },
    { t: "Carruseles largos perdiendo alcance", meta: "Detectada en julio", estado: "completada", extra: "Confirmado" },
  ]},
  "research/competidores": { col: "Competidor", rows: [
    { t: "5 estudios de interiorismo del rubro", meta: "Nórdika Studio", estado: "completada", extra: "Actualizado 12/08" },
    { t: "4 centros de salud de la zona", meta: "Vitalis Salud", estado: "completada", extra: "Actualizado 10/08" },
    { t: "6 desarrolladoras locales", meta: "Casa Campo", estado: "revision", extra: "Desactualizado" },
  ]},
  "research/mercado": { col: "Informe", rows: [
    { t: "Estacionalidad de turnos en salud", meta: "Vitalis Salud", estado: "completada", extra: "Julio 2026" },
    { t: "Ticket promedio en reformas", meta: "Nórdika Studio", estado: "completada", extra: "Junio 2026" },
    { t: "Demanda de vivienda en pozo", meta: "Casa Campo", estado: "curso", extra: "En armado" },
  ]},
  "research/hooks": { col: "Hook", rows: [
    { t: "\"Esto lo hacen mal el 90% de las reformas\"", meta: "Interiorismo", estado: "completada", extra: "Retención 68%" },
    { t: "\"Vas a esperar 3 semanas por esto\"", meta: "Salud", estado: "completada", extra: "Retención 74%" },
    { t: "\"Nadie te dice esto antes de comprar\"", meta: "Inmobiliaria", estado: "curso", extra: "En prueba" },
  ]},
  "research/referencias": { col: "Referencia", rows: [
    { t: "Cuenta de interiorismo nórdico", meta: "Guardada 12/08", estado: "completada", extra: "12 piezas" },
    { t: "Clínica con formato pregunta-respuesta", meta: "Guardada 10/08", estado: "completada", extra: "8 piezas" },
    { t: "Marca de alimentos con voz propia", meta: "Guardada 08/08", estado: "completada", extra: "10 piezas" },
  ]},
  "ventas/leads": { col: "Lead", rows: [
    { t: "Estudio jurídico Rivas", meta: "Origen: Apollo", estado: "curso", extra: "Contactado" },
    { t: "Clínica Sur", meta: "Origen: Instagram", estado: "curso", extra: "Reunión agendada" },
    { t: "Distribuidora Norte", meta: "Origen: Referido", estado: "pendiente", extra: "Sin contactar" },
    { t: "Marca de indumentaria", meta: "Origen: LinkedIn", estado: "revision", extra: "Negociando" },
  ]},
  "ventas/prospeccion": { col: "Campaña de prospección", rows: [
    { t: "Estudios profesionales — LinkedIn", meta: "120 contactos", estado: "curso", extra: "18% respuesta" },
    { t: "Salud privada — mail", meta: "80 contactos", estado: "completada", extra: "12% respuesta" },
    { t: "Retail local — Instagram", meta: "60 contactos", estado: "pendiente", extra: "Sin arrancar" },
  ]},
  "ventas/setters": { col: "Setter", rows: [
    { t: "Facu", meta: "22 conversaciones", estado: "curso", extra: "8 reuniones" },
    { t: "Sofi", meta: "18 conversaciones", estado: "curso", extra: "5 reuniones" },
  ]},
  "ventas/reuniones": { col: "Reunión", rows: [
    { t: "Demo con lead de Apollo", meta: "22/08 · 17:30", estado: "pendiente", extra: "Facu" },
    { t: "Clínica Sur — primera reunión", meta: "26/08 · 11:00", estado: "pendiente", extra: "Facu" },
    { t: "Marca de indumentaria — cierre", meta: "15/08", estado: "completada", extra: "Avanza" },
  ]},
  "ventas/propuestas": { col: "Propuesta", rows: [
    { t: "Estudio jurídico Rivas", meta: "Enviada 14/08", estado: "revision", extra: "USD 2.400/mes" },
    { t: "Marca de indumentaria", meta: "Enviada 12/08", estado: "curso", extra: "USD 3.000/mes" },
    { t: "Clínica Sur", meta: "Sin enviar", estado: "pendiente", extra: "USD 1.800/mes" },
  ]},
  "ventas/cierres": { col: "Cierre", rows: [
    { t: "Altair Consultora", meta: "Cerrado 05/08", estado: "completada", extra: "USD 2.200/mes" },
    { t: "Brotes Orgánico", meta: "Cerrado 12/06", estado: "completada", extra: "USD 900/mes" },
  ]},
  "ia/agentes": { col: "Agente", rows: [
    { t: "Agente de guiones", meta: "Contenido", estado: "curso", extra: "Activo" },
    { t: "Agente de análisis de campañas", meta: "Paid Media", estado: "curso", extra: "Activo" },
    { t: "Agente de research de competidores", meta: "Research", estado: "revision", extra: "En prueba" },
  ]},
  "ia/integraciones": { col: "Integración", rows: [
    { t: "Meta Ads → Sistema", meta: "Métricas cada 6 h", estado: "curso", extra: "Conectada" },
    { t: "Metricool → Sistema", meta: "Publicaciones y alcance", estado: "curso", extra: "Conectada" },
    { t: "CRM → Sistema", meta: "Leads y oportunidades", estado: "revision", extra: "Parcial" },
    { t: "Google Analytics → Sistema", meta: "Tráfico y conversiones", estado: "pendiente", extra: "Sin conectar" },
  ]},
  "ia/sistemas": { col: "Sistema", rows: [
    { t: "Sistema de producción de contenido", meta: "10 etapas documentadas", estado: "completada", extra: "Vigente" },
    { t: "Sistema de adquisición", meta: "7 etapas documentadas", estado: "curso", extra: "En revisión" },
    { t: "Sistema de onboarding", meta: "5 etapas documentadas", estado: "completada", extra: "Vigente" },
  ]},
};
