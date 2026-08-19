# Marketing en Flujo OS

Sistema operativo interno de la agencia. Multiusuario, multi-cliente, con
permisos aplicados en la base de datos y no solo en la interfaz.

---

## Arrancar

```bash
npm install
npm run dev
```

Abre en http://localhost:5173

El archivo `.env.local` ya viene cargado con la URL y la clave publicable del
proyecto de Supabase. Esa clave puede vivir en el frontend: no da permisos por
sí sola. **La `service_role` nunca va acá.**

---

## Cuentas cargadas

Contraseña provisional para todas: `FlujoOS2026!` — cambiala en cuanto entres.

| Email | Rol | Qué ve |
|---|---|---|
| facu@marketingenflujo.com | CEO | Todo: 6 cuentas, números y Administración |
| lucia@marketingenflujo.com | Estrategia | Nórdika y Altair |
| sofi@marketingenflujo.com | Media Buyer | Vitalis y Casa Campo |
| nico@marketingenflujo.com | Contenido | Nórdika y Vitalis |
| juli@marketingenflujo.com | Editor | Nórdika y Brotes, solo contenido |
| maria@nordikastudio.com | Cliente | Solo el espacio de Nórdika |
| valeria@vitalissalud.com | Cliente | Solo el espacio de Vitalis |

Para probar que la seguridad es real: entrá como María, copiá el id de otra
organización y pegalo en la ruta. La consulta vuelve vacía porque RLS la
bloquea, no porque la interfaz la esconda.

---

## Cómo está organizado

```
src/
  App.jsx              interfaz: componentes, vistas y navegación
  main.jsx             punto de entrada
  design/system.css    tokens y estilos — el "Design DNA" de la referencia
  data/catalogo.jsx    áreas, herramientas, prompts: cómo se ve y se navega
  auth/roles.js        roles y permisos (espejo de las políticas RLS)
  services/auth.js     sesión, login, recuperación de contraseña
  services/store.js    lectura y escritura contra Supabase
  lib/supabase.js      el cliente
supabase/
  migrations/          esquema y RLS (ya aplicados en el proyecto)
  functions/           Edge Function de invitaciones
```

Las vistas no saben que existe Supabase: le piden datos al store. Si mañana
cambiás de backend, tocás `services/` y nada más.

---

## Estado del backend

Todo esto ya está aplicado en el proyecto de Supabase:

- 16 tablas con RLS activo y políticas consolidadas (una por tabla y acción)
- 6 funciones de permisos: `mi_rol`, `es_direccion`, `es_interno`,
  `acceso_org`, `comparte_org`, `handle_new_user`
- 7 usuarios reales en Auth con sus perfiles y membresías
- Datos de arranque: 6 organizaciones, 5 proyectos, 9 tareas, 7 piezas de
  contenido, 4 campañas, 5 reuniones, métricas y 11 notificaciones
- 3 procesos y 7 SOPs con todo el detalle de cada etapa
- Edge Function `invitar-usuario` desplegada y activa

Las migraciones de `supabase/migrations/` son el registro de eso. Si levantás
un proyecto nuevo, corrés esas cuatro en orden y queda igual.

---

## Lo que falta

**Conectar las métricas de plata.** Facturación, MRR, conversión y
rentabilidad aparecen como "pendiente de conectar" en el Dashboard CEO. Están
así a propósito: preferimos un guión antes que un número inventado. Cuando
conectes Meta Ads y facturación, se cargan en `metrics` y aparecen solos.

**Cargar los enlaces de herramientas.** Configuración → Herramientas. El
sistema no inventa direcciones: abre lo que cargues vos.

**Cambiar las contraseñas provisionales.** Las siete cuentas comparten la
misma. Configuración → Mi cuenta → Cambiar contraseña.

---

## Reglas que no se negocian

1. **La interfaz oculta, la base bloquea.** Todo permiso del frontend tiene su
   política RLS equivalente. Si cambiás uno, cambiá el otro.
2. **Toda tabla con datos de cliente lleva `organization_id`.** Es lo que hace
   posible una sola política clara por tabla.
3. **La `service_role` solo vive en Edge Functions.** Nunca en el navegador.
4. **Las contraseñas son de Supabase Auth.** Nosotros no las vemos ni las
   guardamos, ni siquiera hasheadas.
