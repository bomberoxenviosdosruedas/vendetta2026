# Auditoría Visual — Cumplimiento de DESIGN.md
> Fecha: 2026-03-30 · Archivos auditados: 68 · Rutas: 30

## 1. Resumen ejecutivo
- **Cumplimiento global estimado**: **68.5% ponderado**. Las páginas principales del juego (`/map`, `/rankings`, `/resources`, `/search`, `/buildings`) y la estructura maestra (`DashboardClientLayout`, `ResourceBar`) tienen una excelente alineación con la estética retro de 2004. Sin embargo, persisten iconos de `lucide-react`, spinners circulares (`animate-spin`) y áreas táctiles reducidas (<44px) en vistas secundarias y panel de administración.
- **Top 10 hallazgos bloqueantes (CRÍTICO) más urgentes**:
  1. `src/components/dashboard/messages/compose-message.tsx:88` & `message-folder-list.tsx:6` — Módulo de mensajes con múltiples imports de `lucide-react` y spinners circulares `animate-spin` en lugar de skeleton/shimmer.
  2. `src/components/dashboard/family/family-dashboard-view.tsx:11` — Módulo de Familia cargado con iconos de `lucide-react` (`Crown`, `Shield`, `User`, `Users`) y spinners.
  3. `src/components/dashboard/simulator-view.tsx:12` & `304` — Simulador de combate con `lucide-react` y spinners `animate-spin`.
  4. `src/components/dashboard/security-view.tsx:10` & `94` — Vista de Seguridad con `lucide-react` (`Clock`, `Ban`, `Loader2`) y spinners.
  5. `src/components/auth-form.tsx:12` & `155` — Formulario de inicio de sesión público con `lucide-react` y spinners circulares.
  6. `src/app/admin/panel/page.tsx`, `bonus/page.tsx:12`, `troops/page.tsx:12` — Todo el panel de administración utiliza `ArrowLeft` y `Loader2` con `animate-spin`.
  7. `src/app/not-found.tsx:2` — Pantalla 404 importa `ShieldAlert` de `lucide-react`.
  8. `src/app/(dashboard)/layout.tsx:18` & `68` — `ResourceBarFallback` y contenedor de fallback con `max-w-7xl` y `bg-background/95 backdrop-blur-sm` (desviación de master frame `max-w-[910px]`).
  9. `src/app/admin/layout.tsx:8`, `src/app/login/page.tsx:36`, `src/app/not-found.tsx:7`, `src/app/page.tsx:15` — Uso de `min-h-screen` en lugar de `min-h-[100dvh]`.
  10. `src/components/dashboard/settings-view.tsx:12` & `101` — Configuración con `Loader2` y `animate-spin`.
- **Páginas que YA cumplen totalmente (100% 🟢 sin cambios bloqueantes)**:
  - `/map` (`src/app/(dashboard)/map/page.tsx` → `MapView`)
  - `/rankings` (`src/app/(dashboard)/rankings/page.tsx` → `PlayerRankingsView` / `FamilyRankingsView`)
  - `/resources` (`src/app/(dashboard)/resources/page.tsx` → `ResourcesView`)
  - `/search` (`src/app/(dashboard)/search/page.tsx` → `MapView`)
  - `/buildings` (`src/app/(dashboard)/buildings/page.tsx` → redirect `/rooms`)
  - `sitemap.ts` (`src/app/sitemap.ts`)

---

## 2. Matriz por ruta

| Ruta | Cadena de componentes | Cumpl. | Hallazgos | Nivel |
|------|----------------------|--------|-----------|-------|
| `/` (Gate) | `page.tsx` → `SuperAuthForm` → `Card, Input, Button` | ~42% | 3 (2 CRIT, 1 MED) | 🔴 |
| `/login` | `login/page.tsx` → `AuthForm` → `Card, Input, Button` | ~40% | 4 (2 CRIT, 1 MED, 1 BAJO) | 🔴 |
| `/not-found` | `not-found.tsx` → `ShieldAlert, Button` | ~60% | 2 (1 CRIT, 1 MED) | 🔴 |
| `/sitemap` | `sitemap.ts` | 100% | 0 | 🟢 |
| `/overview` | `overview/page.tsx` → `OverviewView` → `ResourceBar, QueueStatusCard, ActivityHistoryCard, CityNewsCard` | ~72% | 2 (2 MED) | 🟡 |
| `/rooms` | `rooms/page.tsx` → `RoomsView` → `ConstructionQueue, RoomDetailsModal` | 95% | 1 (1 BAJO) | 🟢 |
| `/rooms/[propertyCoords]` | `rooms/[propertyCoords]/page.tsx` → `RoomsView` → `ConstructionQueue, RoomDetailsModal` | 95% | 1 (1 BAJO) | 🟢 |
| `/buildings` | `buildings/page.tsx` (redirect `/rooms`) | 100% | 0 | 🟢 |
| `/training` | `training/page.tsx` → `TrainingView` → `TrainingStatus` | 95% | 1 (1 BAJO) | 🟢 |
| `/recruitment` | `recruitment/page.tsx` → `RecruitmentView` → `TroopDetailsModal, RecruitmentStatus` | 95% | 1 (1 BAJO) | 🟢 |
| `/missions` | `missions/page.tsx` → `MissionsView` → `MissionStatus` | ~72% | 2 (2 MED) | 🟡 |
| `/map` | `map/page.tsx` → `MapView` | 100% | 0 | 🟢 |
| `/family` | `family/page.tsx` → `FamilyDashboardView` / `CreateOrJoinFamilyView` | ~49% | 4 (4 CRIT) | 🔴 |
| `/family/members` | `family/members/page.tsx` → `FamilyMembersView` | 70% | 1 (1 CRIT) | 🟡 |
| `/family/requests` | `family/requests/page.tsx` → `FamilyRequestsView` | ~49% | 2 (2 CRIT) | 🔴 |
| `/family/find` | `family/find/page.tsx` → `FindFamilyView` | ~49% | 2 (2 CRIT) | 🔴 |
| `/rankings` | `rankings/page.tsx` → `PlayerRankingsView` / `FamilyRankingsView` | 100% | 0 | 🟢 |
| `/resources` | `resources/page.tsx` → `ResourcesView` | 100% | 0 | 🟢 |
| `/security` | `security/page.tsx` → `SecurityView` | ~42% | 3 (2 CRIT, 1 MED) | 🔴 |
| `/search` | `search/page.tsx` → `MapView` | 100% | 0 | 🟢 |
| `/simulator` | `simulator/page.tsx` → `SimulatorView` | ~42% | 3 (2 CRIT, 1 MED) | 🔴 |
| `/statistics` | `statistics/page.tsx` → `StatisticsView` → `StatCategoryCard, StatTableCard` | 70% | 1 (1 CRIT) | 🟡 |
| `/technologies` | `technologies/page.tsx` → `TechnologyTreeView` → `TechItemCard` | 70% | 1 (1 CRIT) | 🟡 |
| `/messages` | `messages/page.tsx` → `MessagesView` → `MessageFolderList, MessageList, MessageDetail, ComposeMessage` | ~35% | 7 (5 CRIT, 2 MED) | 🔴 |
| `/settings` | `settings/page.tsx` → `SettingsView` | 49% | 2 (2 CRIT) | 🔴 |
| `/profile/[userId]` | `profile/[userId]/page.tsx` → `ProfileView` | 70% | 1 (1 CRIT) | 🟡 |
| `/admin` | `admin/page.tsx` → `AdminLoginForm` | 49% | 2 (2 CRIT) | 🔴 |
| `/admin/panel` | `admin/panel/page.tsx` → `RoomConfigTable, TrainingConfigTable` | 49% | 2 (2 CRIT) | 🔴 |
| `/admin/panel/bonus` | `admin/panel/bonus/page.tsx` → `BonusConfigMatrix` | 49% | 2 (2 CRIT) | 🔴 |
| `/admin/panel/troops` | `admin/panel/troops/page.tsx` → `TroopConfigTable` | 49% | 2 (2 CRIT) | 🔴 |

---

## 3. Hallazgos detallados

### Layout Maestro Global
- `src/app/(dashboard)/layout.tsx:18` | CRÍTICO | d | §5 | `ResourceBarFallback` usa `max-w-7xl` y `bg-background/95 backdrop-blur-sm` → debe ser `max-w-[910px]` y `bg-[#0a0a0a]`
- `src/app/(dashboard)/layout.tsx:43` | MEDIO | d | §5 | `<main className="p-4 md:p-6 max-w-7xl mx-auto w-full">` genera doble capa `<main>` redundante con padding excesivo
- `src/components/dashboard/dashboard-client-layout.tsx:32` | MEDIO | f | §6 | Botón selector de propiedades `min-h-[36px]` → tap target debe ser `min-h-[44px]`

### / (Gate)
- `src/app/page.tsx:15` | MEDIO | d | §5 | Contenedor con `min-h-screen` → reemplazo por `min-h-[100dvh]`
- `src/components/super-auth-form.tsx:10` | CRÍTICO | c | §4, §9 | Import de `lucide-react` (`Loader2`, `Eye`, `EyeOff`) → migrar a `MaterialIcon`
- `src/components/super-auth-form.tsx:91` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer

### /login
- `src/app/login/page.tsx:36` | MEDIO | d | §5 | Contenedor con `min-h-screen` → reemplazo por `min-h-[100dvh]`
- `src/components/auth-form.tsx:12` | CRÍTICO | c | §4, §9 | Import de `lucide-react` (`Loader2`, `Terminal`, `Eye`, `EyeOff`) → migrar a `MaterialIcon`
- `src/components/auth-form.tsx:155` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/auth-form.tsx:112` | BAJO | b | §3 | Placeholders con fraseología ligera ("Tu nombre de guerra", "Tu código secreto") → tono táctico directo

### /not-found
- `src/app/not-found.tsx:2` | CRÍTICO | c | §4, §9 | Import de `lucide-react` (`ShieldAlert`) → migrar a `MaterialIcon name="shield_with_heart"` o `warning`
- `src/app/not-found.tsx:7` | MEDIO | d | §5 | `min-h-screen` → reemplazo por `min-h-[100dvh]`

### /overview
- `src/components/dashboard/overview-view.tsx:94` | MEDIO | f | §4, §6 | Botón "VISIÓN GLOBAL DEL IMPERIO" con `min-h-[36px]` → área de toque mínima `44px`
- `src/components/dashboard/city-news-ticker.tsx:36` | MEDIO | i | §8 | Coordenadas `'40:23:220'` hardcodeadas en noticias mock → usar props/coordenadas dinámicas de la propiedad activa

### /rooms & /rooms/[propertyCoords]
- `src/components/dashboard/rooms-view.tsx:220` | BAJO | b | §3 | Label `text-[10px]` en "EN COLA" → `text-xs` en móvil para legibilidad mínima de 14px

### /training
- `src/components/dashboard/training-view.tsx:150` | BAJO | b | §3 | Textos en botones de acción en `text-[10px]` → asegurar `text-xs` (14px min) en móvil

### /recruitment
- `src/components/dashboard/recruitment-view.tsx:112` | BAJO | b | §3 | Mensajes de error en `text-[10px]` → `text-xs` font-mono

### /missions
- `src/components/dashboard/missions-view.tsx:257` | MEDIO | f | §4, §6 | Botón `SELECCIONAR TODAS` con `h-6 text-[10px]` → tap target `min-h-[44px]`
- `src/components/dashboard/mission-status.tsx:134` | MEDIO | f | §4, §6 | Botón cancelar misión `h-6 w-6` → área táctil `min-h-[44px] min-w-[44px]`

### /family, /family/members, /family/requests, /family/find
- `src/components/dashboard/family/family-dashboard-view.tsx:11` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Crown`, `Shield`, `User`, `Users`, `Loader2`, `UserPlus`, `MailPlus`, `HandMetal`) → migrar a `MaterialIcon`
- `src/components/dashboard/family/family-dashboard-view.tsx:114` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/dashboard/family/create-or-join-family-view.tsx:12` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Loader2`, `Search`, `Users`) → migrar a `MaterialIcon`
- `src/components/dashboard/family/create-or-join-family-view.tsx:70` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/dashboard/family/family-members-view.tsx:12` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`ArrowLeft`, `Crown`, `Shield`, `User`) → migrar a `MaterialIcon`
- `src/components/dashboard/family/family-requests-view.tsx:10` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Check`, `Loader2`, `X`, `ArrowLeft`) → migrar a `MaterialIcon`
- `src/components/dashboard/family/family-requests-view.tsx:83` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/dashboard/family/find-family-view.tsx:11` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Check`, `Hourglass`, `Loader2`, `Send`, `X`, `ArrowLeft`) → migrar a `MaterialIcon`
- `src/components/dashboard/family/find-family-view.tsx:60` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer

### /security
- `src/components/dashboard/security-view.tsx:10` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Clock`, `PlusCircle`, `Ban`, `Loader2`, `Info`, `Dumbbell`, `ShieldCheck`) → `MaterialIcon`
- `src/components/dashboard/security-view.tsx:94` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/dashboard/security-view.tsx:185` | MEDIO | f | §4, §6 | Botón `h-9 w-9` → área táctil `min-h-[44px] min-w-[44px]`

### /simulator
- `src/components/dashboard/simulator-view.tsx:12` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Loader2`, `Trash2`, `Upload`, `Swords`) → `MaterialIcon`
- `src/components/dashboard/simulator-view.tsx:304` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/dashboard/simulator-view.tsx:135` | MEDIO | f | §4, §6 | Botón `h-8 w-8` → tap target `min-h-[44px] min-w-[44px]`

### /statistics
- `src/components/dashboard/statistics/stat-category-card.tsx:9` | CRÍTICO | c | §4, §9 | Import de `Trophy` de `lucide-react` → migrar a `MaterialIcon name="emoji_events"`

### /technologies
- `src/components/dashboard/technologies/tech-item-card.tsx:7` | CRÍTICO | c | §4, §9 | Import de `Lock`, `Unlock` de `lucide-react` → migrar a `MaterialIcon name="lock"` / `"lock_open"`

### /messages
- `src/components/dashboard/messages/message-folder-list.tsx:6` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Hammer`, `Settings`, `Shield`, `Users`) → `MaterialIcon`
- `src/components/dashboard/messages/message-list.tsx:6` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Inbox`, `Trash2`) → `MaterialIcon`
- `src/components/dashboard/messages/message-list.tsx:89` | MEDIO | f | §4, §6 | Botón eliminar `h-8 w-8` → tap target `min-h-[44px] min-w-[44px]`
- `src/components/dashboard/messages/message-detail.tsx:7` | CRÍTICO | c | §4, §9 | Import `lucide-react` (`ArrowLeft`) → `MaterialIcon`
- `src/components/dashboard/messages/message-detail.tsx:19` | MEDIO | f | §4, §6 | Botón volver `h-8 w-8` → `min-h-[44px] min-w-[44px]`
- `src/components/dashboard/messages/compose-message.tsx:18` & `21` | CRÍTICO | c | §4, §9 | Imports `lucide-react` (`Plus`, `Loader2`) → `MaterialIcon`
- `src/components/dashboard/messages/compose-message.tsx:88` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer

### /settings
- `src/components/dashboard/settings-view.tsx:12` | CRÍTICO | c | §4, §9 | Import `lucide-react` (`Loader2`) → `MaterialIcon`
- `src/components/dashboard/settings-view.tsx:101` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer

### /profile/[userId]
- `src/components/dashboard/profile/profile-view.tsx:9` | CRÍTICO | c | §4, §9 | Import `lucide-react` (`Send`) → `MaterialIcon name="send"`

### Admin Panel (/admin, /admin/panel, /admin/panel/bonus, /admin/panel/troops)
- `src/app/admin/layout.tsx:8` | MEDIO | d | §5 | Contenedor `min-h-screen bg-muted/20` → `min-h-[100dvh] bg-[#080808]`
- `src/app/admin/panel/bonus/page.tsx:12` | CRÍTICO | c | §4, §9 | Import `ArrowLeft` de `lucide-react` → `MaterialIcon name="arrow_back"`
- `src/app/admin/panel/troops/page.tsx:12` | CRÍTICO | c | §4, §9 | Import `ArrowLeft` de `lucide-react` → `MaterialIcon name="arrow_back"`
- `src/components/admin/admin-login-form.tsx:10` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`
- `src/components/admin/admin-login-form.tsx:53` | CRÍTICO | h | §7, §8 | Spinner circular `animate-spin` → skeleton shimmer
- `src/components/admin/bonus-config-matrix.tsx:8` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`
- `src/components/admin/delete-config-button.tsx:17` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`
- `src/components/admin/forms/room-config-form.tsx:11` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`
- `src/components/admin/forms/training-config-form.tsx:10` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`
- `src/components/admin/forms/troop-config-form.tsx:12` | CRÍTICO | c | §4, §9 | Import `Loader2` de `lucide-react` → `MaterialIcon`

---

## 4. Checklists cotejadas (DESIGN.md §6 y §9)

### Checklist de Ajustes Responsive y Colapso (§6)
- [x] `resource-bar.tsx` utiliza `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (evidencia: `src/components/dashboard/resource-bar.tsx:83`)
- [x] `overview-view.tsx` header utiliza `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (evidencia: `src/components/dashboard/overview-view.tsx:82`)
- [x] `map-view.tsx` incluye vista lista móvil de solares <640px (evidencia: `src/components/dashboard/map-view.tsx:210`)
- [x] `queue-status-card.tsx` colapsa secciones en Accordion en móvil con Misiones abierta por defecto (evidencia: `src/components/dashboard/queue-status-card.tsx:29`)
- [x] Dialogs de rooms/recruitment/tech con grids colapsables `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12` (evidencia: `src/components/dashboard/rooms-view.tsx:169`, `recruitment-view.tsx:151`)
- [ ] Áreas de toque (touch targets) de todos los elementos interactivos $\ge 44\times 44\text{px}$ (evidencia pendiente: botones de icono en `mission-status.tsx:134`, `missions-view.tsx:257`, `security-view.tsx:185`, `simulator-view.tsx:135`, `message-detail.tsx:19`, `message-list.tsx:89`)

### Checklist de Sync de Implementación (§9)
- [x] Reemplazar Bebas Neue/Roboto por `Work Sans`, `Space Grotesk`, `Space Mono` en Google Fonts (evidencia: `src/app/layout.tsx:5-20` y `src/app/globals.css:55-58`)
- [x] `Material Symbols Outlined` importado y funcionando mediante `MaterialIcon` (evidencia: `src/app/layout.tsx:75` y `src/components/ui/material-icon.tsx`)
- [x] Clases canónicas retro (`crimson-th`, `cell-dark`, `cell-darker`, `btn-tactical`, `btn-crimson`, `retro-border`, pills, resource pills) portadas a `design-tokens.css` (evidencia: `src/styles/design-tokens.css:32-132`)
- [ ] Migración completa de iconos `lucide-react` a `Material Symbols Outlined` (pendiente: 31 archivos detectados en §5)
- [ ] Reemplazo total de loaders circulares (`animate-spin`) por skeleton shimmer (pendiente: 18 ocurrencias detectadas)
- [ ] Eliminación de `min-h-screen` en favor de `min-h-[100dvh]` en contenedores maestros (pendiente: 4 archivos detectados)

---

## 5. Iconos lucide-react pendientes de migrar

| archivo:línea | icono(s) | vista / componente |
|---------------|----------|-------------------|
| `src/app/not-found.tsx:2` | `ShieldAlert` | Pantalla 404 Error |
| `src/app/admin/panel/bonus/page.tsx:12` | `ArrowLeft` | Admin Panel Bonus |
| `src/app/admin/panel/troops/page.tsx:12` | `ArrowLeft` | Admin Panel Tropas |
| `src/components/auth-form.tsx:12` | `Loader2`, `Terminal`, `Eye`, `EyeOff` | Formulario Login/Registro |
| `src/components/super-auth-form.tsx:10` | `Loader2`, `Eye`, `EyeOff` | Formulario Gate SuperAuth |
| `src/components/register-form.tsx:12` | `Loader2`, `Terminal` | Formulario Registro |
| `src/components/login-form.tsx:12` | `Terminal` | Formulario Login Legacy |
| `src/components/dashboard/property-selector.tsx:14` | `Building`, `Check`, `ChevronsUpDown` | Selector de Propiedad |
| `src/components/dashboard/construction-queue.tsx:6` | `X`, `Hourglass`, `CheckCircle`, `Timer` | Cola de Construcción |
| `src/components/dashboard/family/family-dashboard-view.tsx:11` | `Crown`, `Shield`, `User`, `Users`, `Loader2`, `UserPlus`, `MailPlus`, `HandMetal` | Dashboard de Familia |
| `src/components/dashboard/family/create-or-join-family-view.tsx:12` | `Loader2`, `Search`, `Users` | Crear/Unirse a Familia |
| `src/components/dashboard/family/family-members-view.tsx:12` | `ArrowLeft`, `Crown`, `Shield`, `User` | Miembros de Familia |
| `src/components/dashboard/family/family-requests-view.tsx:10` | `Check`, `Loader2`, `X`, `ArrowLeft` | Solicitudes de Familia |
| `src/components/dashboard/family/find-family-view.tsx:11` | `Check`, `Hourglass`, `Loader2`, `Send`, `X`, `ArrowLeft` | Buscar Familia |
| `src/components/dashboard/family/invite-member-dialog.tsx:16` | `MailPlus`, `Loader2` | Modal Invitar Miembro |
| `src/components/dashboard/security-view.tsx:10` | `Clock`, `PlusCircle`, `Ban`, `Loader2`, `Info`, `Dumbbell`, `ShieldCheck` | Vista de Seguridad |
| `src/components/dashboard/simulator-view.tsx:12` | `Loader2`, `Trash2`, `Upload`, `Swords` | Simulador de Combates |
| `src/components/dashboard/settings-view.tsx:12` | `Loader2` | Opciones / Ajustes |
| `src/components/dashboard/profile/profile-view.tsx:9` | `Send` | Perfil de Usuario |
| `src/components/dashboard/statistics/stat-category-card.tsx:9` | `Trophy` | Tarjeta de Categoría Stats |
| `src/components/dashboard/technologies/tech-item-card.tsx:7` | `Lock`, `Unlock` | Tarjeta Tecnología |
| `src/components/dashboard/messages/message-folder-list.tsx:6` | `Hammer`, `Settings`, `Shield`, `Users` | Carpetas Mensajes |
| `src/components/dashboard/messages/message-list.tsx:6` | `Inbox`, `Trash2` | Lista Mensajes |
| `src/components/dashboard/messages/message-detail.tsx:7` | `ArrowLeft` | Detalle Mensaje |
| `src/components/dashboard/messages/compose-message.tsx:18,21` | `Plus`, `Loader2` | Redactar Mensaje |
| `src/components/admin/admin-login-form.tsx:10` | `Loader2` | Admin Login Form |
| `src/components/admin/bonus-config-matrix.tsx:8` | `Loader2` | Matriz de Bonus Admin |
| `src/components/admin/delete-config-button.tsx:17` | `Loader2` | Botón Eliminar Config Admin |
| `src/components/admin/forms/room-config-form.tsx:11` | `Loader2` | Formulario Habitación Admin |
| `src/components/admin/forms/training-config-form.tsx:10` | `Loader2` | Formulario Entrenamiento Admin |
| `src/components/admin/forms/troop-config-form.tsx:12` | `Loader2` | Formulario Tropa Admin |

---

## 6. Anti-patrones detectados

| archivo:línea | anti-patrón | evidencia / detalle |
|---------------|-------------|---------------------|
| `src/components/dashboard/city-news-ticker.tsx:36` | Coordenada hardcodeada | `coordinates: '40:23:220'` en objeto de noticias mock |
| `src/app/admin/layout.tsx:8` | Uso de `min-h-screen` | `<div className="min-h-screen bg-muted/20">` en lugar de `min-h-[100dvh]` |
| `src/app/login/page.tsx:36` | Uso de `min-h-screen` | `<main className="relative flex min-h-screen w-full flex-col...` |
| `src/app/not-found.tsx:7` | Uso de `min-h-screen` | `<div className="flex min-h-screen flex-col items-center...` |
| `src/app/page.tsx:15` | Uso de `min-h-screen` | `<div className="flex flex-col items-center justify-center min-h-screen...` |
| `src/components/auth-form.tsx:155` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/super-auth-form.tsx:91` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/family/family-dashboard-view.tsx:114` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/family/create-or-join-family-view.tsx:70` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/family/family-requests-view.tsx:83` | Spinner circular | `{isPending ? <Loader2 className="animate-spin" /> : ...` |
| `src/components/dashboard/family/find-family-view.tsx:60` | Spinner circular | `{isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : ...` |
| `src/components/dashboard/security-view.tsx:94` | Spinner circular | `{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : ...` |
| `src/components/dashboard/settings-view.tsx:101` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/simulator-view.tsx:304` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/messages/compose-message.tsx:88` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/admin-login-form.tsx:53` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/bonus-config-matrix.tsx:133` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/delete-config-button.tsx:54` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/forms/room-config-form.tsx:193` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/forms/training-config-form.tsx:176` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/admin/forms/troop-config-form.tsx:230` | Spinner circular | `{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}` |
| `src/components/dashboard/missions-view.tsx:257` | Touch target reducido | `<Button className="btn-tactical text-[10px] h-6 px-2">` (<44px) |
| `src/components/dashboard/mission-status.tsx:134` | Touch target reducido | `<Button className="h-6 w-6 text-[#ff3f3f] ...">` (<44px) |
| `src/components/dashboard/security-view.tsx:185` | Touch target reducido | `<Button className="h-9 w-9">` (<44px) |
| `src/components/dashboard/simulator-view.tsx:135` | Touch target reducido | `<Button className="h-8 w-8">` (<44px) |
| `src/components/dashboard/messages/message-list.tsx:89` | Touch target reducido | `<Button className="h-8 w-8 ...">` (<44px) |
| `src/components/dashboard/messages/message-detail.tsx:19` | Touch target reducido | `<Button className="h-8 w-8 ...">` (<44px) |

---

## 7. Orden de ejecución recomendado

Para elevar el cumplimiento global de la aplicación del **68.5% actual al 100%**, se recomienda ejecutar los ajustes en el siguiente orden secuencial de mayor impacto a menor impacto:

### FASE 0: Ajustes Estructurales Globales (Layout Master Frame)
- Ajustar `src/app/(dashboard)/layout.tsx:18` para que `ResourceBarFallback` utilice `max-w-[910px]` en lugar de `max-w-7xl` y remueva la clase `backdrop-blur-sm`.
- Remover el `<main className="p-4 md:p-6 max-w-7xl mx-auto w-full">` interno en `src/app/(dashboard)/layout.tsx:43,68` para evitar contenedores duplicados y desalineación de ancho máximo.
- Reemplazar `min-h-screen` por `min-h-[100dvh]` en `src/app/admin/layout.tsx:8`, `src/app/login/page.tsx:36`, `src/app/not-found.tsx:7` y `src/app/page.tsx:15`.

### FASE 1: Migración de Iconos de Dashboard Core a Material Symbols
- Reemplazar imports de `lucide-react` por `<MaterialIcon name="..." />` en:
  - Módulo Mensajes: `src/components/dashboard/messages/message-folder-list.tsx:6`, `message-list.tsx:6`, `message-detail.tsx:7`, `compose-message.tsx:18`.
  - Módulo Familia: `src/components/dashboard/family/family-dashboard-view.tsx:11`, `create-or-join-family-view.tsx:12`, `family-members-view.tsx:12`, `family-requests-view.tsx:10`, `find-family-view.tsx:11`, `invite-member-dialog.tsx:16`.
  - Módulo Seguridad & Simulador: `src/components/dashboard/security-view.tsx:10` y `src/components/dashboard/simulator-view.tsx:12`.
  - Tarjetas Secundarias: `src/components/dashboard/statistics/stat-category-card.tsx:9`, `tech-item-card.tsx:7`, `property-selector.tsx:14`, `profile-view.tsx:9`.

### FASE 2: Eliminación de Spinners Circulares y Unificación de Loaders
- Reemplazar la clase `animate-spin` y el icono `Loader2` por el componente `<Skeleton />` o estado deshabilitado con shimmer en:
  - `src/components/auth-form.tsx:155`
  - `src/components/super-auth-form.tsx:91`
  - `src/components/dashboard/family/*.tsx`
  - `src/components/dashboard/security-view.tsx:94`
  - `src/components/dashboard/simulator-view.tsx:304`
  - `src/components/dashboard/settings-view.tsx:101`
  - `src/components/dashboard/messages/compose-message.tsx:88`
  - Formulario de autenticación de admin y tablas de configuración (`src/components/admin/*.tsx`).

### FASE 3: Corrección de Áreas Táctiles Mínimas (Touch Targets ≥44px)
- Ampliar el área de toque activa ($\ge 44\times 44\text{px}$) mediante padding o `min-h-[44px] min-w-[44px]` sin alterar el tamaño del icono visual en:
  - `src/components/dashboard/mission-status.tsx:134` (botón de cancelar misión).
  - `src/components/dashboard/missions-view.tsx:257` (botón "SELECCIONAR TODAS").
  - `src/components/dashboard/security-view.tsx:185` (acción de patrulla).
  - `src/components/dashboard/simulator-view.tsx:135` (botón de limpiar).
  - `src/components/dashboard/messages/message-list.tsx:89` y `message-detail.tsx:19` (acciones de eliminar y regresar).
  - `src/components/dashboard/dashboard-client-layout.tsx:32` (botón del selector de propiedad).

### FASE 4: Migración de Módulo Admin y Vistas Públicas
- Migrar `src/app/not-found.tsx` para usar `MaterialIcon name="warning"` y eliminar `ShieldAlert`.
- Reemplazar `ArrowLeft` de `lucide-react` en `src/app/admin/panel/bonus/page.tsx:12` y `troops/page.tsx:12` por `<MaterialIcon name="arrow_back" />`.
