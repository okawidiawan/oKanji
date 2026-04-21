# oKanji

oKanji adalah aplikasi manajemen progres belajar kanji Jepang yang dirancang untuk membantu pengguna melacak hafalan kanji mereka berdasarkan level JLPT. Aplikasi ini memungkinkan pengguna untuk mencari kanji, menandai kanji yang sedang dipelajari atau sudah dihafal, dan mencatat progres belajar secara personal.

## 🚀 Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh/) / [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **ORM**: [Prisma v6](https://www.prisma.io/)
- **Database**: [MySQL](https://www.mysql.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Security**: Helmet, CORS, Express-Rate-Limit, Bcrypt (via `Bun.password`)

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📂 Arsitektur & Struktur Proyek

Aplikasi ini menggunakan struktur monorepo sederhana dengan pembagian folder yang jelas:

### Folder Backend
```text
backend/
├── prisma/               # Skema database & seeder
├── src/
│   ├── application/      # Konfigurasi inti (Database & Web Server)
│   ├── controller/       # Handler request HTTP
│   ├── services/         # Logika bisnis & interaksi database
│   ├── routes/           # Definisi endpoint API
│   ├── middleware/       # Middleware (Auth, Error, dll)
│   ├── validation/       # Skema validasi request (Zod)
│   ├── error/            # Penanganan error terpusat
│   └── index.js          # Entry point aplikasi
└── tests/                # Unit & Integration testing
```

### Folder Frontend
```text
frontend/
├── src/
│   ├── components/       # Komponen reusable (UI & Common)
│   ├── layouts/          # Layout halaman (Main, Auth)
│   ├── pages/            # Komponen halaman (Auth, Kanji, User)
│   ├── stores/           # Global state management (Zustand)
│   ├── router/           # Konfigurasi navigasi
│   ├── lib/              # Konfigurasi library (Axios instance)
│   ├── hooks/            # Custom hooks React
│   └── main.jsx          # Entry point frontend
```

### Konvensi
- **Penamaan File**: Menggunakan `kebab-case.js` (contoh: `user-service.js`).
- **Penamaan Variabel/Fungsi**: Menggunakan `camelCase` (contoh: `getUserProfile`).
- **Git Commits**: Mengikuti *Conventional Commits* (`Feature:`, `Fix:`, `Refactor:`, dll).

---

## 🛠️ API yang Tersedia

### Public API (Tanpa Autentikasi)
- `POST /api/users` - Registrasi akun baru.
- `POST /api/users/login` - Login untuk mendapatkan token.
- `GET /api/health` - Health check status backend.

### Authorized API (Membutuhkan `Authorization: Bearer <token>`)
- **User Profile**:
  - `GET /api/users/current` - Mengambil profil user saat ini.
  - `PATCH /api/users/current` - Memperbarui profil (nama/password).
  - `DELETE /api/users/logout` - Logout (menghapus token).
- **Kanji Data**:
  - `GET /api/kanjis` - Mengambil list kanji (filter JLPT, pagination, search).
  - `GET /api/kanjis/:id` - Mengambil detail satu kanji (Planned).
- **User Progress**:
  - `GET /api/user-kanji` - List progres hafalan pengguna.
  - `GET /api/user-kanji/:kanjiId` - Detail progres untuk kanji tertentu.
  - `POST /api/user-kanji` - Tambah/update progres hafalan.
  - `PUT /api/user-kanji/:kanjiId` - Update progres hafalan.

---

## 🗄️ Schema Database

Aplikasi memiliki 3 model utama dalam `schema.prisma`:

1.  **User**: Menyimpan data akun pengguna, termasuk password yang di-hash dan token autentikasi.
2.  **Kanji**: Kamus data kanji yang mencakup `jlptLevel`, `onyomi`, `kunyomi`, `meaning`, dll.
3.  **UserKanji**: Tabel relasi *many-to-many* antara `User` dan `Kanji` yang menyimpan progres belajar (status hafal, jumlah review, catatan, dll).

---

## ⚙️ Setup & Instalasi

### Prasyarat
- [Bun](https://bun.sh/) (Direkomendasikan) atau Node.js.
- Database MySQL.

### Langkah-langkah

1.  **Clone Repository**:
    ```bash
    git clone https://github.com/okawidiawan/oKanji.git
    cd oKanji
    ```

2.  **Instalasi Dependensi**:
    Anda bisa menginstal semua dependensi (root, backend, dan frontend) sekaligus dari root:
    ```bash
    bun install
    ```

3.  **Konfigurasi Backend**:
    - Pergi ke folder backend: `cd backend`
    - Copy `.env.example` ke `.env` dan atur `DATABASE_URL`.
    - Generate Prisma Client: `bunx prisma generate`
    - Push schema ke database: `bunx prisma db push`

---

## 🏃 Menjalankan Aplikasi

Anda dapat menjalankan backend dan frontend secara bersamaan dari root direktori:

```bash
bun run dev
```

Atau secara terpisah:

### Menjalankan Backend
```bash
cd backend
bun run dev
```
Server backend akan berjalan di `http://localhost:5000`.

### Menjalankan Frontend
```bash
cd frontend
bun run dev
```
Aplikasi frontend akan berjalan di `http://localhost:5173`.

---

## 🧪 Testing

Aplikasi menggunakan **Bun Test** untuk pengujian backend.

1. Masuk ke folder backend: `cd backend`
2. Jalankan semua test:
    ```bash
    bun test
    ```
    Atau menggunakan script:
    ```bash
    bun run test
    ```
