# Tech Stack
- Frontend: React JS (JavaScript)
- Backend: Express JS
- Package Manager / Runtime: Bun / NPM
- Database: MySQL
- ORM: Prisma

# Project Setup and Implementation Plan

## 1. Project Initialization
- Gunakan folder root project saat ini.
- Inisialisasi folder untuk memisahkan frontend dan backend (contoh: folder `frontend` dan `backend`).
- Jalankan inisialisasi package manager (`bun init` atau `npm init`) sesuai kebutuhan.
- Gunakan `.gitignore` dasar untuk mengabaikan direktori `node_modules` dan file rahasia seperti `.env`.

## 2. Backend Setup (Express + Prisma + MySQL)
- Install framework Express JS dan dependencies server terkait (seperti `cors`, `dotenv`).
- Install Prisma ORM (`prisma` dan `@prisma/client`) kemudian lakukan inisialisasi khusus untuk target database MySQL.
- Konfigurasikan koneksi MySQL di dalam file `.env`.
- Rancang struktur awal formasi tabel di file `schema.prisma`.
- Implementasikan database migration terhadap MySQL lokal/server untuk menerapkan skema yang sudah dibuat.
- Rancang struktur routing Express JS dan buat endpoint REST API sederhana sebagai jembatan aplikasi.
- Buat setup script dev untuk me-restart server secara otomatis (seperti `nodemon` jika menggunakan NPM, atau menggunakan `bun --watch`).

## 3. Frontend Setup (React JS)
- Inisialisasi aplikasi React JS, direkomendasikan menggunakan Vite (`create-vite` dengan template React JavaScript) di dalam folder terpisah (`frontend`).
- Rapihkan/bersihkan file boilerplate tidak terpakai dari instalasi Vite.
- Siapkan integrasi API client. Lakukan setup fetch API (contoh: native `fetch` atau library `axios`) untuk berkomunikasi dengan server backend Express JS.
- Buat satu komponen antarmuka yang membuktikan komunikasi full stack berhasil (request data -> proses DB -> render di React).

## 4. Development Workflow & Scripting
- Tambahkan root command (opsional) di `package.json` pada root direktori yang bisa memicu dev server backend dan frontend secara bersamaan.
- Selalu ciptakan dokumentasi `.env.example` sebagai referensi environment variable bagi developer lain.

## Catatan Implementor / AI
Tugas utama dari plan ini adalah menetapkan fondasi komunikasi antara React (Client state), Express (Server router), Prisma (Database Querying), dan MySQL (Persistently Storage). Jangan overengineering fungsionalitas sebelum setup fondasi ini berjalan secara menyeluruh.
