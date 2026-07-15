# Backend Documentation — ImageEdit

## Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Database](#struktur-database)
- [Modul-Modul Backend](#modul-modul-backend)
  - [Auth Module](#1-auth-module)
  - [Users Module](#2-users-module)
  - [Roles Module](#3-roles-module)
  - [Activity Logs Module](#4-activity-logs-module)
  - [Log History Module](#5-log-history-module)
- [Mekanisme Audit Trail](#mekanisme-audit-trail)
- [Konfigurasi Environment](#konfigurasi-environment)

---

## Teknologi yang Digunakan

### Core Framework

| Paket | Versi | Keterangan |
|---|---|---|
| `@nestjs/core` | ^11.0.1 | Framework utama NestJS |
| `@nestjs/common` | ^11.0.1 | Utilitas umum NestJS |
| `@nestjs/platform-express` | ^11.0.1 | HTTP adapter berbasis Express |

### Database

| Paket | Versi | Keterangan |
|---|---|---|
| `typeorm` | ^1.0.0 | ORM untuk TypeScript |
| `@nestjs/typeorm` | ^11.0.1 | Integrasi TypeORM dengan NestJS |
| `pg` | ^8.21.0 | Driver PostgreSQL |

### Autentikasi & Otorisasi

| Paket | Versi | Keterangan |
|---|---|---|
| `@nestjs/jwt` | ^11.0.2 | Pengelolaan JWT |
| `@nestjs/passport` | ^11.0.5 | Integrasi Passport.js |
| `passport` | ^0.7.0 | Middleware autentikasi |
| `passport-jwt` | ^4.0.1 | Strategi JWT untuk Passport |
| `bcrypt` | ^6.0.0 | Hashing password (10 salt rounds) |

### Konfigurasi & Utilitas

| Paket | Versi | Keterangan |
|---|---|---|
| `@nestjs/config` | ^4.0.4 | Manajemen environment variable |
| `@nestjs/schedule` | ^6.1.3 | Cron job scheduling |
| `class-validator` | ^0.15.1 | Validasi DTO via decorator |
| `class-transformer` | ^0.5.1 | Transformasi objek/DTO |
| `rxjs` | ^7.8.1 | Reactive programming |

### Development

| Paket | Keterangan |
|---|---|
| TypeScript | Bahasa utama |
| Jest | Unit & integration testing |
| ESLint + Prettier | Linting & formatting |
| NestJS CLI | Code generator & build tool |

---

## Struktur Database

### Diagram Relasi Antar Tabel

```mermaid
erDiagram
    roles {
        int id PK
        string name UK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    users {
        uuid id PK
        int roleId FK
        string name
        string email UK
        string password
        boolean active
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    refresh_tokens {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        datetime expiresAt
        datetime createdAt
        datetime deletedAt
    }

    activity_logs {
        uuid id PK
        uuid userId FK
        string toolName
        jsonb metadata
        string ipAddress
        datetime createdAt
        datetime deletedAt
    }

    log_history {
        uuid id PK
        uuid userId FK
        string action
        string method
        string path
        int statusCode
        string ipAddress
        string userAgent
        jsonb metadata
        datetime createdAt
        datetime deletedAt
    }

    roles ||--o{ users : "memiliki"
    users ||--o{ refresh_tokens : "memiliki"
    users ||--o{ activity_logs : "mencatat"
    users ||--o{ log_history : "tercatat di"
```

### Detail Setiap Tabel

#### Tabel `roles`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `int` (PK, auto-increment) | Identitas unik role |
| `name` | `varchar` (UNIQUE) | Nama role (misal: `user`, `admin`) |
| `createdAt` | `timestamp` | Waktu dibuat |
| `updatedAt` | `timestamp` | Waktu diperbarui |
| `deletedAt` | `timestamp` (nullable) | Soft delete marker |

**Data default:** `user`, `admin`

---

#### Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK) | Identitas unik user |
| `roleId` | `int` (FK → roles.id) | Referensi role |
| `name` | `varchar` | Nama lengkap |
| `email` | `varchar` (UNIQUE) | Alamat email |
| `password` | `varchar` | Hash bcrypt (tidak dikirim ke response) |
| `active` | `boolean` (default: `true`) | Status aktif akun |
| `createdAt` | `timestamp` | Waktu dibuat |
| `updatedAt` | `timestamp` | Waktu diperbarui |
| `deletedAt` | `timestamp` (nullable) | Soft delete marker |

---

#### Tabel `refresh_tokens`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK) | Identitas unik token |
| `userId` | `uuid` (FK → users.id) | Pemilik token |
| `tokenHash` | `varchar` (UNIQUE) | Hash SHA-256 dari raw token |
| `expiresAt` | `timestamp` | Waktu kadaluarsa |
| `createdAt` | `timestamp` | Waktu diterbitkan |
| `deletedAt` | `timestamp` (nullable) | Soft delete = token dicabut |

> Raw token tidak pernah disimpan. Hanya hash SHA-256 yang tersimpan di database.

---

#### Tabel `activity_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK) | Identitas unik log |
| `userId` | `uuid` (FK → users.id) | User yang melakukan aktivitas |
| `toolName` | `varchar` | Nama fitur/tool yang digunakan |
| `metadata` | `jsonb` (nullable) | Data tambahan (misal: parameter input) |
| `ipAddress` | `varchar` (nullable) | IP address request |
| `createdAt` | `timestamp` | Waktu aktivitas |
| `deletedAt` | `timestamp` (nullable) | Soft delete marker |

---

#### Tabel `log_history`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK) | Identitas unik log |
| `userId` | `uuid` (FK → users.id, nullable) | User pengirim request (null jika unauthenticated) |
| `action` | `varchar` | Deskripsi aksi (misal: `POST /users/:id`) |
| `method` | `varchar` | HTTP method (`POST`, `PATCH`, dll.) |
| `path` | `varchar` | Path URL request |
| `statusCode` | `int` (nullable) | HTTP response status code |
| `ipAddress` | `varchar` (nullable) | IP address pengirim |
| `userAgent` | `varchar` (nullable) | Browser/client info |
| `metadata` | `jsonb` (nullable) | Params & body (password/token disanitasi ke `***`) |
| `createdAt` | `timestamp` | Waktu request |
| `deletedAt` | `timestamp` (nullable) | Soft delete marker |

---

## Modul-Modul Backend

### 1. Auth Module

**Lokasi:** `src/auth/`

**Deskripsi:** Menangani registrasi, login, refresh token, logout, dan pengecekan sesi aktif.

#### Endpoint

| Method | Path | Guard | Keterangan |
|---|---|---|---|
| `POST` | `/auth/register` | — | Daftarkan user baru |
| `POST` | `/auth/login` | — | Login dan terima token |
| `POST` | `/auth/refresh` | — | Perbarui access token |
| `POST` | `/auth/logout` | — | Cabut refresh token |
| `GET` | `/auth/me` | JWT | Info user yang sedang login |

#### Flowchart: Register

```mermaid
flowchart TD
    A([POST /auth/register]) --> B[Validasi DTO]
    B --> C{Email sudah ada?}
    C -- Ya --> D[Throw ConflictException]
    C -- Tidak --> E[Hash password dengan bcrypt]
    E --> F[Ambil role default 'user']
    F --> G[Simpan user baru ke DB]
    G --> H[Terbitkan access token JWT\n+ refresh token]
    H --> I([Return 201 + tokens])
```

#### Flowchart: Login

```mermaid
flowchart TD
    A([POST /auth/login]) --> B[Validasi DTO]
    B --> C[Cari user berdasarkan email]
    C --> D{User ditemukan\n& aktif?}
    D -- Tidak --> E[Throw UnauthorizedException]
    D -- Ya --> F[Bandingkan password dengan bcrypt]
    F --> G{Password cocok?}
    G -- Tidak --> E
    G -- Ya --> H[Terbitkan access token JWT\n15 menit]
    H --> I[Terbitkan refresh token\n7 hari, simpan hash di DB]
    I --> J([Return 200 + tokens])
```

#### Flowchart: Refresh Token

```mermaid
flowchart TD
    A([POST /auth/refresh]) --> B[Ambil refresh token dari body]
    B --> C[Hash token, cari di DB]
    C --> D{Token valid\n& belum expired?}
    D -- Tidak --> E[Throw UnauthorizedException]
    D -- Ya --> F[Soft delete token lama\nrotation]
    F --> G[Terbitkan access token baru]
    G --> H[Terbitkan refresh token baru]
    H --> I([Return 200 + tokens baru])
```

#### Flowchart: Logout

```mermaid
flowchart TD
    A([POST /auth/logout]) --> B[Ambil refresh token dari body]
    B --> C[Hash token, cari di DB]
    C --> D{Token ditemukan?}
    D -- Tidak --> E([Return 204 tetap OK])
    D -- Ya --> F[Soft delete token\ndicabut]
    F --> E
```

---

### 2. Users Module

**Lokasi:** `src/users/`

**Deskripsi:** Manajemen user oleh admin — CRUD lengkap dengan paginasi, filter, dan pencarian.

#### Endpoint

| Method | Path | Guard | Keterangan |
|---|---|---|---|
| `POST` | `/users` | JWT + Admin | Buat user baru |
| `GET` | `/users` | JWT + Admin | Daftar semua user (paginated) |
| `GET` | `/users/:id` | JWT + Admin | Detail user berdasarkan UUID |
| `PATCH` | `/users/:id` | JWT + Admin | Perbarui data user |
| `DELETE` | `/users/:id` | JWT + Admin | Soft delete user |

#### Flowchart: Create User (Admin)

```mermaid
flowchart TD
    A([POST /users]) --> B[JwtAuthGuard: validasi token]
    B --> C[RolesGuard: cek role admin]
    C --> D{Role admin?}
    D -- Tidak --> E[Throw ForbiddenException]
    D -- Ya --> F[Validasi DTO]
    F --> G{Email sudah ada?}
    G -- Ya --> H[Throw ConflictException]
    G -- Tidak --> I{roleId valid?}
    I -- Tidak --> J[Throw NotFoundException]
    I -- Ya --> K[Hash password bcrypt]
    K --> L[Simpan user baru ke DB]
    L --> M([Return 201 + data user])
```

#### Flowchart: List Users

```mermaid
flowchart TD
    A([GET /users]) --> B[JwtAuthGuard + RolesGuard]
    B --> C[Parse query params\npage, limit, search, sortBy, sortOrder, roleId, active]
    C --> D[Buat QueryBuilder]
    D --> E{Ada search?}
    E -- Ya --> F[Filter ILIKE name, email]
    E -- Tidak --> G
    F --> G{Ada filter roleId?}
    G -- Ya --> H[Filter WHERE roleId = ...]
    G -- Tidak --> I
    H --> I{Ada filter active?}
    I -- Ya --> J[Filter WHERE active = ...]
    I -- Tidak --> K[Apply sort + paginate]
    J --> K
    K --> L([Return 200 + PaginatedResult])
```

#### Flowchart: Soft Delete User

```mermaid
flowchart TD
    A([DELETE /users/:id]) --> B[JwtAuthGuard + RolesGuard]
    B --> C[Cari user berdasarkan UUID]
    C --> D{User ditemukan?}
    D -- Tidak --> E[Throw NotFoundException]
    D -- Ya --> F[Set deletedAt = now\nsoft delete]
    F --> G([Return 204 No Content])
```

---

### 3. Roles Module

**Lokasi:** `src/roles/`

**Deskripsi:** Modul internal tanpa controller publik. Digunakan untuk seeding role default dan pencarian role.

#### Fungsi Utama

| Fungsi | Keterangan |
|---|---|
| `seedDefaults()` | Buat role `user` dan `admin` jika belum ada (idempotent) |
| `findById(id)` | Cari role berdasarkan ID numerik |
| `findOrCreate(name)` | Cari atau buat role berdasarkan nama |

#### Flowchart: Seed Default Roles (App Bootstrap)

```mermaid
flowchart TD
    A([App Bootstrap]) --> B[RolesService.seedDefaults]
    B --> C[Cari role 'user' di DB]
    C --> D{Ada?}
    D -- Tidak --> E[Insert role 'user']
    D -- Ya --> F
    E --> F[Cari role 'admin' di DB]
    F --> G{Ada?}
    G -- Tidak --> H[Insert role 'admin']
    G -- Ya --> I([Selesai])
    H --> I
```

---

### 4. Activity Logs Module

**Lokasi:** `src/activity-logs/`

**Deskripsi:** Mencatat aktivitas penggunaan fitur/tool oleh user. Dapat diakses oleh user sendiri maupun admin.

#### Endpoint

| Method | Path | Guard | Keterangan |
|---|---|---|---|
| `POST` | `/activity-logs` | JWT | Catat aktivitas tool oleh user login |
| `GET` | `/activity-logs` | JWT | Riwayat aktivitas user sendiri (paginated) |
| `GET` | `/activity-logs/all` | JWT + Admin | Semua aktivitas semua user (paginated) |

#### Flowchart: Create Activity Log

```mermaid
flowchart TD
    A([POST /activity-logs]) --> B[JwtAuthGuard: validasi token]
    B --> C[Inject @CurrentUser dari JWT]
    C --> D[Validasi DTO\ntoolName, metadata, ipAddress]
    D --> E[Set userId = user.id dari token]
    E --> F[Simpan activity log ke DB]
    F --> G([Return 201 + log data])
```

#### Flowchart: Get Own Activity Logs

```mermaid
flowchart TD
    A([GET /activity-logs]) --> B[JwtAuthGuard]
    B --> C[Inject @CurrentUser]
    C --> D[Parse query params\npage, limit, search, sortBy]
    D --> E[Query WHERE userId = currentUser.id]
    E --> F{Ada search?}
    F -- Ya --> G[Filter ILIKE toolName, ipAddress]
    F -- Tidak --> H
    G --> H[Apply sort + paginate]
    H --> I([Return 200 + PaginatedResult])
```

---

### 5. Log History Module

**Lokasi:** `src/log-history/`

**Deskripsi:** Audit trail otomatis untuk setiap HTTP request yang mengubah state (`POST`, `PUT`, `PATCH`, `DELETE`). Dijalankan via interceptor dan exception filter global.

#### Endpoint

| Method | Path | Guard | Keterangan |
|---|---|---|---|
| `GET` | `/log-history` | JWT + Admin | Query semua log HTTP (paginated) |

#### Komponen Global

| Komponen | Tipe | Keterangan |
|---|---|---|
| `AuditLogInterceptor` | Global Interceptor | Mencatat request yang **berhasil** |
| `AuditExceptionFilter` | Global Exception Filter | Mencatat request yang **gagal** (4xx/5xx) |

#### Flowchart: Alur Audit Trail Otomatis

```mermaid
flowchart TD
    A([HTTP Request masuk]) --> B{Method = POST/PUT\nPATCH/DELETE?}
    B -- Tidak --> C([Lewati, tidak diaudit])
    B -- Ya --> D[JwtAuthGuard]
    D --> E{Token valid?}
    E -- Tidak --> F[AuditExceptionFilter\ncatat 401 ke log_history]
    F --> G([Return 401])
    E -- Ya --> H[RolesGuard]
    H --> I{Role sesuai?}
    I -- Tidak --> J[AuditExceptionFilter\ncatat 403 ke log_history]
    J --> K([Return 403])
    I -- Ya --> L[ValidationPipe]
    L --> M{DTO valid?}
    M -- Tidak --> N[AuditExceptionFilter\ncatat 400 ke log_history]
    N --> O([Return 400])
    M -- Ya --> P[Controller Handler]
    P --> Q{Berhasil?}
    Q -- Tidak --> R[AuditExceptionFilter\ncatat 5xx ke log_history]
    R --> S([Return 5xx])
    Q -- Ya --> T[AuditLogInterceptor\ncatat 2xx ke log_history\nsanitasi password/token]
    T --> U([Return 2xx])
```

#### Flowchart: Query Log History (Admin)

```mermaid
flowchart TD
    A([GET /log-history]) --> B[JwtAuthGuard + RolesGuard Admin]
    B --> C[Parse query params\npage, limit, search, method, statusCode, userId]
    C --> D[Buat QueryBuilder]
    D --> E{Ada filter method?}
    E -- Ya --> F[WHERE method = ...]
    E -- Tidak --> G
    F --> G{Ada filter statusCode?}
    G -- Ya --> H[WHERE statusCode = ...]
    G -- Tidak --> I
    H --> I{Ada filter userId?}
    I -- Ya --> J[WHERE userId = ...]
    I -- Tidak --> K
    J --> K{Ada search?}
    K -- Ya --> L[ILIKE action, path, ipAddress]
    K -- Tidak --> M
    L --> M[Apply sort + paginate]
    M --> N([Return 200 + PaginatedResult])
```

---

## Mekanisme Audit Trail

### Perlindungan Data Sensitif

```mermaid
flowchart LR
    A[Raw Request Body] --> B{Field sensitif?}
    B -- password/token\naccessToken/refreshToken --> C[Ganti dengan '***']
    B -- Field lainnya --> D[Simpan apa adanya]
    C --> E[Simpan ke log_history.metadata]
    D --> E
```

### Siklus Hidup Refresh Token

```mermaid
flowchart TD
    A[Login / Register] --> B[Generate raw token\nuuid v4]
    B --> C[Hash SHA-256]
    C --> D[Simpan hash ke DB\ndengan expiresAt]
    D --> E[Kirim raw token ke client\nhanya sekali]
    E --> F{Digunakan saat\nrefresh?}
    F -- Ya --> G[Hash token dari client]
    G --> H{Hash ada di DB\n& belum expired?}
    H -- Tidak --> I[Throw 401]
    H -- Ya --> J[Soft delete token lama\nrotation]
    J --> K[Terbitkan token baru]
    K --> E
    F -- Tidak --> L{Token expired?}
    L -- Ya --> M[Cron job hourly\nhapus permanen]
    L -- Tidak --> N[Tetap di DB\nhingga digunakan/expired]
```

---

## Konfigurasi Environment

```env
# Server
PORT=3000

# Database PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=imagedit
DATABASE_SYNCHRONIZE=true        # true di development, false di production

# JWT
JWT_SECRET=your_very_secret_key
JWT_ACCESS_EXPIRES_IN=15m        # masa berlaku access token
REFRESH_EXPIRES_DAYS=7           # masa berlaku refresh token (hari)

# bcrypt
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Admin Seeder
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=Administrator
```

> **Peringatan:** Set `DATABASE_SYNCHRONIZE=false` di environment production untuk menghindari perubahan schema otomatis yang tidak terduga.

---

## Struktur Direktori

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Entry point aplikasi
├── seed.ts                    # Seeder standalone
│
├── auth/                      # Autentikasi & otorisasi
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── refresh-token.entity.ts
│   ├── refresh-tokens.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts
│
├── users/                     # Manajemen user (admin)
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── user.entity.ts
│
├── roles/                     # Manajemen role
│   ├── roles.module.ts
│   ├── roles.service.ts
│   └── role.entity.ts
│
├── activity-logs/             # Log aktivitas user
│   ├── activity-logs.module.ts
│   ├── activity-logs.controller.ts
│   ├── activity-logs.service.ts
│   └── activity-log.entity.ts
│
├── log-history/               # Audit trail HTTP request
│   ├── log-history.module.ts
│   ├── log-history.controller.ts
│   ├── log-history.service.ts
│   ├── log-history.entity.ts
│   ├── audit-log.interceptor.ts
│   └── audit-exception.filter.ts
│
└── common/                    # Utilitas bersama
    ├── dto/
    │   └── pagination-query.dto.ts
    ├── pagination/
    │   └── paginate.ts
    └── audit/
        └── audit-log.util.ts
```
