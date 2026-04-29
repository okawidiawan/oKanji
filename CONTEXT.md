# Project Context: oKanji

Dokumen ini berfungsi sebagai ringkasan teknis dan arsitektur proyek oKanji untuk memberikan konteks cepat kepada pengembang atau AI assistant.

## 1. Stack & Teknologi

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) / [Bun](https://bun.sh/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **ORM & Database**: [Prisma v6](https://www.prisma.io/) dengan **MySQL**.
- **Validation**: [Zod](https://zod.dev/) untuk validasi request body & parameter.
- **Security**:
  - `helmet`: Header keamanan HTTP.
  - `cors`: Cross-Origin Resource Sharing.
  - `express-rate-limit`: Pembatasan jumlah request.
  - `bcrypt`: Hashing password.
  - `crypto`: SHA-256 hashing untuk session token.
- **Module System**: ES Modules (`import`/`export`).

### Frontend

- **Framework/Build Tool**: [Vite](https://vitejs.dev/) + **React 19**
- **Routing**: [React Router v7](https://reactrouter.com/) (Single Page App mode)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **HTTP Client**: [Axios](https://axios-http.com/) with interceptors.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Module System**: ES Modules.

---

## 2. Struktur Folder (Backend)

```text
backend/
├── prisma/               # Skema database & seeder
├── src/
│   ├── application/      # Konfigurasi inti (Web & Database)
│   ├── controller/       # Handler request HTTP
│   ├── services/         # Logika bisnis & interaksi database
│   ├── routes/           # Definisi API Router
│   ├── middleware/       # Custom middleware (Auth, dll)
│   ├── validation/       # Skema validasi Zod
│   ├── error/            # Centralized Error Handling
│   └── index.js          # Entry point aplikasi
└── tests/                # Unit & Integration testing (Bun Test)

frontend/
├── src/
│   ├── components/       # Reusable components (ui/ & common/)
│   ├── layouts/          # Page layouts (MainLayout, AuthLayout)
│   ├── pages/            # Page components (auth/, kanji/, user/)
│   ├── stores/           # Zustand stores (use-auth-store, dll)
│   ├── router/           # React Router config
│   ├── lib/              # Library config (api instance)
│   ├── hooks/            # Custom React hooks
│   └── main.jsx          # Entry point frontend
└── tailwind.config.js    # Konfigurasi styling
```

---

## 3. Konvensi Kode

> **📖 Pedoman lengkap ada di [`GUIDELINES.md`](./GUIDELINES.md)** — wajib dibaca sebelum menambah fitur baru.

- **Naming Convention**:
  - Variabel/Fungsi: `camelCase`
  - File/Folder: `kebab-case.js`
  - Skema Zod: `[aksi][Domain]Validation` (misal: `registerUserValidation`)
  - Komitmen Git: _Conventional Commits_ (`Feature:`, `Fix:`, `Refactor:`, `chore:`).
- **Arsitektur Layer**: `Router → Controller → Service → Prisma`. Validasi hanya di Service, query database hanya di Service.
- **Error Handling**: Terpusat pada `error-middleware.js` menggunakan class `ResponseError`. Selalu gunakan `try...catch` di Controller dan teruskan ke `next(e)`.
- **Validation**: Validasi input dilakukan di layer **Service** menggunakan Zod sebelum menjalankan logika database. Pesan error Zod wajib **Bahasa Indonesia**.
- **Response Format**: Sukses → `{ data: ... }`, Error → `{ error: "..." }`, List → `{ data: [...], paging: { page, total_item, total_page } }`.
- **Paginasi**: Gunakan parameter `page` dan `size`. Query data dan count secara paralel dengan `Promise.all`.
- **Security by Default**: Menggunakan pemisahan Router (`public-api.js` vs `api.js`) untuk memastikan endpoint terproteksi secara eksplisit.
- **Data Isolation**: Setiap query data milik user **wajib** menyertakan `user.id` dalam klausa `where`.

---

## 4. Status Progress API

### Public API (Tanpa Token)

- [x] `POST /api/users`: Registrasi akun baru.
- [x] `POST /api/users/login`: Login untuk mendapatkan token akses.
- [x] `GET /api/health`: Health check status backend.

### Authorized API (Membutuhkan `Authorization: Bearer <token>`)

- **User Profile**:
  - [x] `GET /api/users/current`: Mengambil profil user yang sedang login.
  - [x] `PATCH /api/users/current`: Memperbarui nama, email, atau password user.
  - [x] `DELETE /api/users/logout`: Menghapus token (Logout).
- **Kanji Data**:
  - [x] `GET /api/kanjis`: Mengambil list kanji.
    - Query Params: `level` (N1-N5), `search` (karakter/makna), `page`, `size`.
  - [x] `GET /api/kanjis/:kanjiId`: Mengambil detail satu kanji + list kotoba terkait.
- **Kotoba Data (Input Manual)**:
  - [x] `POST /api/kotoba`: Membuat kotoba baru (single/batch) + hubungkan ke kanji via `kanjiIds`.
  - [x] `PATCH /api/kotoba/:kotobaId`: Memperbarui data kotoba.
  - [x] `DELETE /api/kotoba/:kotobaId`: Menghapus kotoba.
- **User Kanji Progress**:
  - [x] `POST /api/user-kanji/:kanjiId`: Simpan/update progres hafalan (Inisialisasi status progres).
  - [x] `PATCH /api/user-kanji/:kanjiId`: Memperbarui detail progres (difficulty, note, isMemorized).
  - [x] `DELETE /api/user-kanji/:kanjiId`: Menghapus progres kanji tertentu.
  - [x] `GET /api/user-kanji`: List progres hafalan pengguna.
    - Query Params: `isMemorized` (boolean), `page`, `size`.
  - [x] `GET /api/user-kanji/:kanjiId`: Detail progres kanji + kotoba dengan progress user.
- **User Kotoba Progress**:
  - [x] `POST /api/user-kotoba/:kotobaId`: Tambah kotoba ke hafalan user.
  - [x] `PATCH /api/user-kotoba/:kotobaId`: Memperbarui progress hafalan kotoba.
  - [x] `DELETE /api/user-kotoba/:kotobaId`: Menghapus progres kotoba.

### Frontend Scaffolding

- [x] Setup Project with Vite & React.
- [x] Integrasi React Router v7 & Layouts.
- [x] Integrasi Zustand (Auth & Kanji Store).
- [x] Konfigurasi Axios & Base API.
- [x] Setup Tailwind CSS v4.
- [x] Domain-driven Folder Structure.
- [ ] Implementasi UI Komponen (Planned).
- [ ] Integrasi Login/Register (Planned).

---

## 5. File Kunci & Fungsinya

- `backend/prisma/schema.prisma`: Source struktur database.
- `backend/src/application/web.js`: Konfigurasi Express dan registrasi rute.
- `backend/src/middleware/auth-middleware.js`: Menangani validasi token Bearer dan menyediakan data user di `req.user`.
- `backend/src/error/error-middleware.js`: Menstandarisasi format error JSON (Zod, 404, 500, dll).

---

## 6. Keputusan Arsitektur Penting

1. **Pemisahan Router**: Router dibagi menjadi `publicRouter` dan `apiRouter`. `apiRouter` menggunakan `authMiddleware` secara global di level router (`apiRouter.use(authMiddleware)`), sehingga setiap rute baru di dalamnya otomatis terproteksi.
2. **Stateless Authentication**: Database menyimpan `token` pada tabel `User`. Validasi dilakukan dengan mencocokkan token di header `Authorization` dengan database.
3. **Data Isolation**: Logika pengambilan/pembaruan data pribadi selalu menggunakan `req.user.email` untuk memastikan pengguna hanya bisa mengakses data mereka sendiri.
4. **Validation Messaging**: Pesan error Zod dikustomisasi menggunakan Bahasa Indonesia untuk kemudahan integrasi dengan Frontend.
5. **Multi-field Search Logic**: Pencarian kanji mendukung parameter `search` yang akan difilter menggunakan operator `OR` pada kolom `character` dan `meaning` dengan metode `contains` (substring search) untuk fleksibilitas hasil.
6. **Simplified Progress Tracking**: Penambahan progres kanji menggunakan endpoint `POST /api/user-kanji/:kanjiId` dapat dilakukan tanpa request body. Hal ini menyederhanakan interaksi Frontend (Quick Add). Status hafalan (`isMemorized`) kini dikelola secara manual oleh pengguna melalui endpoint `PATCH`.
7. **Username Immutability**: Field `username` bersifat permanen dan di-set saat registrasi. Hanya `name`, `email`, dan `password` yang dapat diperbarui melalui `PATCH /api/users/current`. Registrasi memerlukan field `username` terpisah dari `name`.
8. **Kotoba sebagai Sub-resource Kanji**: Kotoba (kosakata) tidak memiliki endpoint list/detail mandiri. Kotoba selalu ditampilkan dalam konteks kanji melalui `GET /api/kanjis/:kanjiId` (data kotoba) dan `GET /api/user-kanji/:kanjiId` (data kotoba + progress user). Relasi Kanji ↔ Kotoba bersifat many-to-many melalui junction table `KanjiKotoba`.
9. **Batch Input Kotoba**: Endpoint `POST /api/kotoba` mendukung input single (object) maupun batch (array) untuk mempermudah penambahan data kosakata secara manual. Relasi ke kanji dikirim langsung via field `kanjiIds` dalam body request.
10. **Single Session Login**: Setiap login menimpa token sebelumnya. User hanya bisa memiliki satu sesi aktif.
11. **Shared Kotoba Reference**: Model `Kotoba` berfungsi sebagai data referensi bersama. Endpoint `POST /api/kotoba` (dan rute terkait) bersifat shared oleh semua user yang login. Aturan *Data Isolation* (filter `user.id`) tidak berlaku untuk model ini, karena data kotoba tidak bersifat personal.
12. **Token Hashing**: Session token (UUID) disimpan dalam bentuk hash SHA-256 di database untuk memitigasi risiko jika database bocor. Client tetap menerima token asli yang belum di-hash.

---

## 7. Strategi Testing

- **Runner & Framework**: Menggunakan **Bun Test** sebagai _test runner_ utama karena kecepatan eksekusinya.
- **Mocking**: Menggunakan `prisma-mock` (atau manual mocking pada Prisma Client) untuk database agar pengujian bersifat independen dan cepat.
- **Lokasi Test**: Semua file pengujian terletak di `backend/tests/` dengan format penamaan `*.test.js`. (Mengikuti konvensi Bun Test).
- **Daftar Test Utama**:
  - `users.test.js`: Mencakup registrasi, login, update profil, dan logout.
  - `kanji.test.js`: Mencakup list kanji dan paginasi.
  - `user-kanji.test.js`: Mencakup progres hafalan user (upsert & list).
  - `kotoba.test.js`: Mencakup CRUD kotoba dan batch input.
  - `user-kotoba.test.js`: Mencakup progres hafalan kotoba user.
- **Cara Menjalankan Test**:
  1. Masuk ke folder backend: `cd backend`
  2. Jalankan perintah: `bun run test` atau `bun test`

---

## 8. Cara Menjalankan Project

### Backend

1. Masuk ke folder backend: `cd backend`.
2. Install dependensi: `npm install` atau `bun install`.
3. Duplikat `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL` (MySQL).
4. Generate Prisma Client: `npx prisma generate`.
5. Sinkronisasi database: `npx prisma db push`.
6. Jalankan server dev: `bun run dev`.
7. Akses via browser (default): `http://localhost:5000`.

### Frontend

1. Masuk ke folder frontend: `cd frontend`.
2. Install dependensi: `npm install` atau `bun install`.
3. Jalankan aplikasi: `bun run dev`.
4. Akses via browser (default): `http://localhost:5173`.

## 9. Konvensi Git & Kolaborasi

### Judul Issue

- Format: `Feature: Nama Fitur` / `Fix: Nama Bug`
- Bahasa: Indonesia
- Contoh: `Feature: Implementasi API Get Kanji`

### Judul Pull Request

- Format: sama dengan judul issue yang diselesaikan
- Contoh: `Feature: Implementasi API Get Kanji`

## 10. Instruksi untuk AI Assistant

### Sebelum mulai task

- Baca dan pahami seluruh isi CONTEXT.md ini
- Ikuti semua konvensi yang tertulis di sini
- Jangan berasumsi di luar yang tertulis di CONTEXT.md

### Pada saat menjalankan task

- Untuk AI Assistant yang melakukan coding :
  Selalu buat dokumentasinya di baris program, jelaskan kegunaan function/method dengan bahasa Indonesia yang mudah dimengerti, jangan gunakan bahasa yang terlalu teknis.
  Jika ada perubahan logic pada setiap function, lakukan juga perubahan dokumentasinya.
  Selalu buat unit test untuk setiap API atau fitur baru yang ditambahkan atau setelah kode diperbaiki.
  Selalu jalankan unit test yang sudah dibuat, dan harus lolos test dengan benar.
  Jangan langsung lakukan commit, push, pull request jika tidak diminta.
- Untuk AI Assistant yang ditugaskan untuk membuat issue.md, jika tidak ada perintah untuk implementasi, jangan lakukan implementasi kode.
- Untuk AI Assistant yang ditugaskan untuk mereview tidak perlu melakukan coding, lakukan review dan buatkan prompt yang sesuai dengan hasil review untuk digunakan oleh AI yang melakukan coding.

### Setelah selesai task

- Update CONTEXT.md jika ada:
  - API baru yang selesai diimplementasi
  - Keputusan arsitektur baru
  - Perubahan konvensi kode
  - Dependency baru yang ditambahkan
- Jangan update CONTEXT.md jika hanya bug fix kecil
  atau perubahan yang tidak mempengaruhi arsitektur
