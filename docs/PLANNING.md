# Imegedit Frontend — Planning Document

> Versi: 1.0 | Tanggal: 2026-06-27 | Status: Draft

---

## 1. Overview Proyek

**Imegedit** adalah aplikasi web edit gambar berbasis browser. Seluruh proses editing
(crop, resize, remove/change background, reformat, upscale/downscale) terjadi **murni di
sisi frontend** menggunakan Canvas API dan library WASM — tidak ada upload gambar ke
server. Backend hanya menangani autentikasi, manajemen user, dan pencatatan log aktivitas.

### Tiga modul utama

| # | Modul | Audience | Auth |
|---|-------|----------|------|
| 1 | **Landing Page** | Publik | Tidak perlu |
| 2 | **Admin CMS** | Admin | roleId = 2 |
| 3 | **User Area** | User terdaftar | roleId = 1 atau 2 |

---

## 2. Tech Stack

### Core

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Framework | **React 19** | Sudah terpasang di project |
| Language | **TypeScript ~6** | Sudah terkonfigurasi |
| Bundler | **Vite 8** | Sudah terkonfigurasi |
| Styling | **Tailwind CSS v4** | Permintaan user, utility-first |
| Routing | **React Router v7** | De-facto standard, support loaders |
| State global | **Zustand** | Ringan, boilerplate minimal |
| Data fetching | **TanStack Query v5** | Caching, loading state, auto-refetch |

### Image Processing (semua jalan di browser)

| Fitur | Library | Teknik |
|-------|---------|--------|
| **Crop** | `react-image-crop` | Canvas API, drag-handle crop |
| **Resize** | `pica` | High-quality resize via Web Worker (bicubic/lanczos) |
| **Upscale / Downscale** | `pica` | Sama — `pica` cocok untuk keduanya |
| **Remove Background** | `@imgly/background-removal` | AI model via WebAssembly, 100% lokal |
| **Change Background** | Canvas API (native) | Composite layer setelah remove-bg |
| **Reformat** | Canvas API `toBlob()` | Convert ke JPEG / PNG / WebP |

### Utilities

| Library | Kegunaan |
|---------|----------|
| `file-saver` | Trigger download file hasil edit |
| `lucide-react` | Icon set |
| `clsx` + `tailwind-merge` | Conditional class helper |
| `react-hot-toast` | Notifikasi toast |
| `date-fns` | Format tanggal di log |

---

## 3. Arsitektur Aplikasi

```
src/
├── api/                   # API layer
│   ├── client.ts          # apiFetch helper (auto-refresh token)
│   ├── auth.ts            # register, login, logout, me
│   ├── users.ts           # CRUD users (admin)
│   ├── activityLogs.ts    # create log, get my logs, get all logs
│   └── auditLog.ts        # get log-history (admin)
│
├── store/                 # Zustand stores
│   ├── authStore.ts       # user, tokens, isAuthenticated
│   └── editorStore.ts     # gambar aktif, tool aktif, history
│
├── hooks/                 # Custom hooks
│   ├── useAuth.ts         # login/logout action
│   ├── useImageEditor.ts  # orchestrate tools
│   └── useActivityLog.ts  # catat log setelah edit
│
├── modules/
│   ├── landing/           # Modul 1: Landing Page
│   ├── admin/             # Modul 2: Admin CMS
│   └── editor/            # Modul 3: User Area (image editor)
│
├── components/            # Shared/reusable UI components
│   ├── ui/                # Atom komponen (Button, Input, Badge, Modal, Table…)
│   ├── layout/            # AppLayout, AdminLayout, AuthLayout
│   └── common/            # Pagination, Spinner, EmptyState, ErrorBoundary
│
├── utils/
│   ├── canvas.ts          # Helper Canvas (toBlob, composite, dataURL)
│   ├── download.ts        # Trigger download via file-saver
│   └── format.ts          # Format bytes, tanggal, dsb.
│
├── types/
│   ├── api.ts             # Response/request types dari backend
│   └── editor.ts          # EditTool, ImageState, HistoryEntry
│
├── router.tsx             # Definisi routes + route guards
└── main.tsx
```

---

## 4. Routing & Navigation

```
/                          → Landing Page (public)
/login                     → Halaman Login (public)
/register                  → Halaman Register (public)

/app                       → User Area (protected, semua role)
  /app/editor              → Halaman editor utama
  /app/logs                → Log aktivitas milik sendiri

/admin                     → Admin CMS (protected, roleId=2 only)
  /admin/dashboard         → Dashboard ringkasan
  /admin/users             → Manajemen user (list, detail, update, soft-delete)
  /admin/logs              → Semua activity logs
  /admin/audit             → Audit trail (log-history)
```

### Route Guards

```ts
// ProtectedRoute: cek isAuthenticated, redirect ke /login jika belum
// AdminRoute   : cek roleId === 2, redirect ke /app jika bukan admin
```

---

## 5. Detail Modul

---

### 5.1 Modul 1 — Landing Page (`/`)

**Tujuan:** Memperkenalkan produk, mendorong signup.

#### Sections / Komponen

| Section | Isi |
|---------|-----|
| `Navbar` | Logo, nav link, tombol Login & Daftar |
| `Hero` | Headline, subheadline, CTA "Mulai Edit Gratis", preview mockup editor |
| `Features` | Grid 5 card: Crop, Resize, Remove BG, Reformat, Upscale — icon + desc |
| `HowItWorks` | 3 step: Upload → Edit → Download, visual stepper |
| `Testimonials` | (opsional) quote placeholder |
| `PricingNote` | Gratis, running di browser, no server upload |
| `Footer` | Link, copyright |

#### Design Notes

- Warna utama: pilih 1 accent color (mis. indigo-600 / violet-600) + gray-900 background
  untuk kesan modern/dark-tech editor.
- Hero menggunakan gradient background `from-gray-950 via-gray-900 to-indigo-950`.
- Semua section menggunakan `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Mobile-first, fully responsive.

---

### 5.2 Modul 2 — Admin CMS (`/admin/*`)

**Tujuan:** Admin mengelola user dan memantau log.

#### Layout

```
AdminLayout
├── Sidebar (fixed, collapsible di mobile)
│   ├── Logo
│   ├── NavItem: Dashboard
│   ├── NavItem: Users
│   ├── NavItem: Activity Logs
│   └── NavItem: Audit Trail
└── MainContent
    ├── TopBar (breadcrumb, user profile dropdown, logout)
    └── <Outlet />
```

#### Pages

##### `/admin/dashboard`

- Stat cards: Total User, Total Activity Logs, Log Hari Ini, Admin Count
- Tabel "5 Log Terbaru" (compact, link ke /admin/logs)
- Data dari: `GET /activity-logs/all` dan `GET /users`

##### `/admin/users`

- Tabel user dengan kolom: Nama, Email, Role, Status (aktif/nonaktif), Dibuat, Aksi
- Filter: `roleId` (semua/user/admin), `active` (semua/aktif/nonaktif)
- Search: cari nama/email
- Sort: klik header kolom
- Pagination server-side
- Modal "Edit User": update `name`, `roleId`, `active`
- Tombol "Nonaktifkan" → soft delete (`DELETE /users/:id`)
- Konfirmasi modal sebelum delete

**API:** `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`

##### `/admin/logs` — All Activity Logs

- Tabel: User, Tool, IP, Metadata (toggle expand), Waktu
- Filter: `toolName` (dropdown), `userId` (pilih dari list user)
- Search, sort, pagination

**API:** `GET /activity-logs/all`

##### `/admin/audit` — Audit Trail

- Tabel: Aksi, Method, Path, Status Code, User, IP, User Agent, Waktu
- Filter: `method`, `statusCode`, `userId`
- Badge warna untuk method (GET=blue, POST=green, PATCH=yellow, DELETE=red)
- Badge warna untuk statusCode (2xx=green, 4xx=yellow, 5xx=red)

**API:** `GET /log-history`

---

### 5.3 Modul 3 — User Area (`/app/*`)

#### Layout

```
AppLayout
├── Topbar (Logo, nav link ke /app/logs, user dropdown, logout)
└── <Outlet />
```

##### `/app/editor` — Halaman Editor Utama

Ini adalah halaman inti. Flow:

```
[Upload Zone]
     │ user pilih/drag gambar
     ▼
[Preview + Tool Selector]
     │ user pilih tool (crop/resize/remove-bg/reformat/upscale)
     ▼
[Tool Panel] ← panel konfigurasi spesifik tool
     │ user klik "Terapkan"
     ▼
[Result Preview]
     │
     ├─ "Download" → trigger download
     ├─ "Edit lagi" → kembali ke Tool Panel dengan gambar hasil
     └─ "Mulai baru" → kembali ke Upload Zone
```

Setelah "Terapkan" berhasil → otomatis `POST /activity-logs` (fire-and-forget).

###### Komponen Editor

```
EditorPage
├── UploadZone           (drag & drop, klik untuk browse, accept image/*)
├── ImagePreviewCanvas   (tampilkan gambar sebelum/sesudah, side-by-side toggle)
├── ToolSelector         (tab/segmented control: 5 tool)
│
├── panels/
│   ├── CropPanel        (react-image-crop, pilih aspect ratio atau freeform)
│   ├── ResizePanel      (input width/height, lock aspect ratio, unit px/%)
│   ├── RemoveBgPanel    (tombol proses, progress indicator WASM loading)
│   ├── ChangeBgPanel    (setelah remove-bg: upload warna solid / gambar baru)
│   ├── ReformatPanel    (pilih output format: JPEG/PNG/WebP, kualitas slider)
│   └── UpscalePanel     (factor: 1.5x, 2x, 3x, 4x — atau custom px)
│
├── ActionBar            (Terapkan, Reset, Download, Edit Lagi)
└── ProcessingOverlay    (loading spinner saat WASM processing)
```

##### `/app/logs` — Log Aktivitas Saya

- Tabel: Tool, Metadata, IP, Waktu
- Filter: `toolName`
- Search, sort, pagination
- Sama seperti admin logs tapi hanya data milik sendiri

**API:** `GET /activity-logs`

---

## 6. State Management

### `authStore` (Zustand)

```ts
interface AuthStore {
  user: User | null
  accessToken: string | null    // simpan di memory
  isAuthenticated: boolean
  isAdmin: boolean              // derived: user?.roleId === 2
  login: (email, password) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string>
  setUser: (user: User) => void
}
// refreshToken disimpan di localStorage
```

### `editorStore` (Zustand)

```ts
interface EditorStore {
  originalFile: File | null
  currentImageBlob: Blob | null    // gambar yang sedang dikerjakan
  resultBlob: Blob | null          // hasil setelah processing
  activeTool: ToolName | null
  isProcessing: boolean
  setFile: (file: File) => void
  setResult: (blob: Blob) => void
  resetEditor: () => void
}
```

---

## 7. API Integration

### HTTP Client (`src/api/client.ts`)

Mengikuti pola dari `FRONTEND.md` — `apiFetch` dengan auto-refresh:

```
request → 401 → coba refreshTokens() → ulangi request
                      → gagal → clear token → redirect /login
```

- `accessToken` disimpan di Zustand (memory)
- `refreshToken` disimpan di `localStorage`
- Semua API call lewat `apiFetch` wrapper

### Endpoint Map

| Fungsi | Method | Endpoint | Auth | Role |
|--------|--------|----------|------|------|
| Register | POST | `/auth/register` | - | - |
| Login | POST | `/auth/login` | - | - |
| Refresh | POST | `/auth/refresh` | - | - |
| Logout | POST | `/auth/logout` | Bearer | any |
| Profil saya | GET | `/auth/me` | Bearer | any |
| List users | GET | `/users` | Bearer | admin |
| Get user | GET | `/users/:id` | Bearer | admin |
| Update user | PATCH | `/users/:id` | Bearer | admin |
| Delete user | DELETE | `/users/:id` | Bearer | admin |
| Catat log | POST | `/activity-logs` | Bearer | any |
| Log saya | GET | `/activity-logs` | Bearer | any |
| Semua log | GET | `/activity-logs/all` | Bearer | admin |
| Audit trail | GET | `/log-history` | Bearer | admin |

### Activity Log Payload per Tool

```ts
// Crop
{ toolName: 'crop', metadata: { x, y, width, height, aspect } }

// Resize
{ toolName: 'resize', metadata: { originalW, originalH, newW, newH, unit } }

// Remove Background
{ toolName: 'remove-background', metadata: { model: 'isnet' } }

// Change Background
{ toolName: 'change-background', metadata: { type: 'color' | 'image' } }

// Reformat
{ toolName: 'reformat', metadata: { from: 'image/jpeg', to: 'image/webp', quality: 0.85 } }

// Upscale
{ toolName: 'upscale', metadata: { factor: 2, originalW, originalH, newW, newH } }

// Downscale
{ toolName: 'downscale', metadata: { factor: 0.5, originalW, originalH, newW, newH } }
```

---

## 8. Image Processing — Implementasi Detail

### 8.1 Crop

```
Library : react-image-crop
Flow    : load image ke <img> → render ReactCrop overlay → user drag → 
          "Terapkan" → drawImage ke offscreen Canvas dengan crop rect → 
          canvas.toBlob() → set result
```

Fitur konfigurasi:
- Aspect ratio: bebas, 1:1, 16:9, 4:3, 3:2
- Display ukuran crop real-time (px)

### 8.2 Resize

```
Library : pica (Web Worker, lanczos3)
Flow    : buat offscreen Canvas ukuran target → pica.resize(srcCanvas, dstCanvas) →
          dstCanvas.toBlob() → set result
```

Fitur konfigurasi:
- Input width & height (px atau %)
- Lock aspect ratio toggle
- Preview ukuran file estimasi

### 8.3 Remove Background

```
Library : @imgly/background-removal
Flow    : user klik "Proses" → tampilkan progress bar →
          removeBackground(file, { model: 'isnet' }) → returns Blob (PNG + alpha) →
          set result
Note    : First load butuh download WASM model ~15MB (cache browser setelahnya)
```

Warning UX: beri tahu user bahwa proses pertama butuh beberapa detik untuk load model.

### 8.4 Change Background

```
Prerequisite: gambar sudah di-remove background (ada alpha channel)
Library     : Canvas API native
Flow        :
  1. User pilih: warna solid atau upload gambar baru
  2. Buat canvas ukuran gambar foreground
  3. Jika warna: fillRect dengan warna
     Jika gambar: drawImage background (cover/fit)
  4. drawImage foreground (PNG transparan) di atas
  5. canvas.toBlob() → set result
```

### 8.5 Reformat

```
Library : Canvas API native (toBlob dengan MIME type)
Flow    : load Blob ke <img> → drawImage ke canvas → 
          canvas.toBlob(callback, mimeType, quality) → set result
```

Format yang didukung: JPEG, PNG, WebP
Konfigurasi: slider kualitas (0.1–1.0, hanya untuk JPEG & WebP)

### 8.6 Upscale / Downscale

```
Library : pica (sama dengan resize)
Flow    : identik dengan resize, pembedanya hanya arah (besar vs kecil)
```

Preset upscale: 1.5×, 2×, 3×, 4× atau input custom (px)
Preset downscale: 75%, 50%, 25% atau input custom (px atau %)

---

## 9. Design System (Tailwind)

### Color Palette

```
Primary   : indigo-600 / indigo-500 (hover)
Danger    : red-500 / red-600
Success   : emerald-500
Warning   : amber-500
Neutral   : gray-50 (bg light) / gray-950 (bg dark)
Text      : gray-900 (light mode) / gray-50 (dark mode)
```

Untuk MVP: **dark mode only** agar konsisten dengan nuansa editor profesional.

### Typography

```
Font    : Inter (Google Fonts self-hosted atau system font stack)
Heading : font-bold, tracking-tight
Body    : text-sm / text-base, text-gray-300
Code    : font-mono, text-indigo-300
```

### Shared UI Components (src/components/ui/)

| Komponen | Variant |
|----------|---------|
| `Button` | primary, secondary, ghost, danger — size: sm, md, lg |
| `Input` | default, error state |
| `Select` | native select styled dengan Tailwind |
| `Badge` | color-coded (role, status, method, statusCode) |
| `Modal` | confirm dialog, form dialog |
| `Table` | sortable headers, striped rows, loading skeleton |
| `Pagination` | prev/next + page numbers |
| `Spinner` | inline & overlay variant |
| `EmptyState` | icon + message + optional CTA |
| `Tooltip` | hover tooltip |
| `ProgressBar` | untuk WASM loading progress |

---

## 10. Authentication Flow Detail

```
App Init (main.tsx / router loader)
  → baca accessToken dari Zustand (memory)
  → jika kosong, baca refreshToken dari localStorage
  → jika ada refreshToken → coba POST /auth/refresh
      sukses → set accessToken di Zustand → lanjut ke route
      gagal  → clear storage → redirect /login
  → jika tidak ada refreshToken → redirect /login (jika protected route)
```

Token storage:
- `accessToken`: **Zustand memory only** (hilang saat refresh page → auto-refresh dari refreshToken)
- `refreshToken`: `localStorage` key `imgedit_rt`

---

## 11. Struktur File per Modul (Lebih Detail)

```
src/modules/

landing/
├── LandingPage.tsx
└── components/
    ├── LandingNavbar.tsx
    ├── HeroSection.tsx
    ├── FeaturesSection.tsx
    ├── HowItWorksSection.tsx
    └── LandingFooter.tsx

admin/
├── AdminLayout.tsx
├── Sidebar.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── UserDetailPage.tsx
│   ├── ActivityLogsPage.tsx
│   └── AuditLogPage.tsx
└── components/
    ├── StatCard.tsx
    ├── UserTable.tsx
    ├── UserEditModal.tsx
    ├── LogTable.tsx
    └── AuditBadge.tsx

editor/
├── AppLayout.tsx
├── pages/
│   ├── EditorPage.tsx
│   └── MyLogsPage.tsx
└── components/
    ├── UploadZone.tsx
    ├── ImagePreviewCanvas.tsx
    ├── ToolSelector.tsx
    ├── ActionBar.tsx
    ├── ProcessingOverlay.tsx
    └── panels/
        ├── CropPanel.tsx
        ├── ResizePanel.tsx
        ├── RemoveBgPanel.tsx
        ├── ChangeBgPanel.tsx
        ├── ReformatPanel.tsx
        └── UpscalePanel.tsx
```

---

## 12. Development Phases

### Phase 1 — Foundation (Estimasi: 2–3 hari)

- [ ] Setup Tailwind CSS v4 + konfigurasi design tokens
- [ ] Setup React Router v7 (routes, loaders, error boundaries)
- [ ] Setup Zustand (authStore, editorStore)
- [ ] Setup TanStack Query
- [ ] Implementasi `apiFetch` client + auth endpoints
- [ ] Auth pages: Login, Register
- [ ] Route guards: ProtectedRoute, AdminRoute
- [ ] AppLayout + AdminLayout skeleton
- [ ] Shared UI components: Button, Input, Modal, Table, Pagination, Badge

### Phase 2 — Landing Page (Estimasi: 1–2 hari)

- [ ] LandingNavbar (responsive, mobile menu)
- [ ] HeroSection dengan CTA
- [ ] FeaturesSection (5 tool cards)
- [ ] HowItWorksSection (3-step stepper)
- [ ] LandingFooter
- [ ] Responsive check semua breakpoint

### Phase 3 — Admin CMS (Estimasi: 3–4 hari)

- [ ] Admin Sidebar + Topbar
- [ ] Dashboard page (stat cards + tabel ringkasan)
- [ ] Users page: list, filter, search, sort, pagination
- [ ] User edit modal (update role, status)
- [ ] User soft-delete dengan confirm
- [ ] Activity Logs page (all users): filter, search, sort, pagination
- [ ] Audit Trail page: filter, search, sort, pagination, badge warna

### Phase 4 — User Area / Editor (Estimasi: 4–5 hari)

- [ ] UploadZone (drag & drop + klik)
- [ ] ToolSelector (5 tab)
- [ ] CropPanel + integrasi react-image-crop
- [ ] ResizePanel + integrasi pica
- [ ] RemoveBgPanel + integrasi @imgly/background-removal
- [ ] ChangeBgPanel (solid color + upload gambar)
- [ ] ReformatPanel (JPEG/PNG/WebP + quality slider)
- [ ] UpscalePanel + integrasi pica
- [ ] ActionBar (Terapkan, Download, Reset)
- [ ] ImagePreviewCanvas (before/after toggle)
- [ ] Auto-log ke backend setelah setiap edit sukses
- [ ] My Logs page (tabel + filter + search)

### Phase 5 — Polish & QA (Estimasi: 1–2 hari)

- [ ] Loading states & skeleton screens
- [ ] Error boundaries + toast notifications
- [ ] Mobile responsiveness audit
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] WASM first-load UX (progress indicator, caching hint)
- [ ] Performance: lazy load modules, code splitting per route
- [ ] Environment config (`VITE_API_BASE_URL`)

---

## 13. Dependensi yang Perlu Diinstall

```bash
# Routing
npm install react-router-dom

# State
npm install zustand @tanstack/react-query

# Styling
npm install tailwindcss @tailwindcss/vite
npm install clsx tailwind-merge

# Image Processing
npm install react-image-crop
npm install pica
npm install @imgly/background-removal

# Utilities
npm install file-saver
npm install lucide-react
npm install react-hot-toast
npm install date-fns

# Types
npm install -D @types/pica @types/file-saver
```

---

## 14. Environment Variables

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000
```

Diakses via `import.meta.env.VITE_API_BASE_URL`.

---

## 15. Catatan Penting

1. **WASM Memory**: `@imgly/background-removal` memuat model AI ~15MB pertama kali.
   Simpan progress loading di editorStore agar UX informatif.

2. **File Size**: Gambar besar (>10MB) bisa lambat di Canvas. Pertimbangkan batasan
   upload 20MB dan tampilkan warning.

3. **Token Security**: `accessToken` di memory — hilang saat hard refresh. Wajib
   ada mekanisme restore dari `refreshToken` saat app init.

4. **Role Guard**: Tampilkan/sembunyikan menu admin di UI berdasarkan `roleId`,
   tapi backend tetap jadi penjaga utama (403 handling wajib ada).

5. **Log Fire-and-Forget**: POST activity log tidak boleh block UX. Kirim di background,
   handle error secara silent (hanya console.warn).

6. **Canvas CORS**: Jika gambar dari URL eksternal, Canvas akan tainted. Hanya terima
   gambar dari file upload lokal untuk menghindari masalah ini.
