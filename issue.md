---
# Issue: Feature: Landing Page

## Tujuan
Halaman Landing Page ini berfungsi sebagai pintu masuk utama aplikasi oKanji untuk publik. Halaman ini bertujuan memperkenalkan aplikasi, fitur unggulan yang ditawarkan, dan mengarahkan pengguna baru maupun pengguna yang sudah ada menuju halaman autentikasi (Login/Register).

## Lokasi File
- `frontend/src/pages/LandingPage.jsx` (File Utama)
- `frontend/src/components/ui/FeatureCard.jsx` (Komponen Reusable)
- `frontend/src/router/index.jsx` (Konfigurasi Route - menyesuaikan nama file router yang ada)

## Dependency & Prerequisite
- Setup React Router v7 sudah harus terkonfigurasi untuk public routes.
- Tailwind CSS v4 sudah aktif untuk styling halaman.
- `useAuthStore` (dari Zustand) sudah harus ada dan dapat mengekspos state `token` atau `user` untuk keperluan pengecekan *redirect*.

## Step-by-Step Implementasi

### Step 1: Membuat Komponen Reusable `FeatureCard`
- **Apa yang dibuat**: `frontend/src/components/ui/FeatureCard.jsx`
- **Method/Function**: `export function FeatureCard({ title, description, icon })`
- **Hook yang digunakan**: Tidak ada, ini adalah *stateless presentational component*.
- **State Management**: Tidak ada (pure component).
- **Catatan**: Komponen ini menerima props `title`, `description`, dan `icon` untuk dirender sebagai satu blok fitur. Berikan styling menggunakan Tailwind CSS v4 (seperti *hover effects*, *shadows*, *padding*) agar terlihat rapi dan interaktif. **Tandai secara eksplisit bahwa ini adalah komponen yang reusable dan harus ditempatkan di dalam folder komponen `ui`**.

### Step 2: Membuat Kerangka Halaman Landing Page
- **Apa yang dibuat**: `frontend/src/pages/LandingPage.jsx`
- **Method/Function**: `export default function LandingPage()`
- **Hook yang digunakan**: 
  - `useNavigate` dari `react-router` untuk fungsi navigasi pada tombol CTA.
  - `useEffect` dari `react` untuk memicu pengecekan *redirect* otomatis.
- **State Management**: `useAuthStore` dari Zustand untuk mengambil *state* autentikasi.
- **Catatan**: Susun kerangka halaman yang minimal terdiri dari navigasi sederhana (opsional, untuk link ke login/register), *Hero Section*, dan *Features Section*. Implementasikan desain yang responsif dengan *utility classes* Tailwind v4.

### Step 3: Implementasi Logika Redirect
- **Apa yang dibuat**: Di dalam file `LandingPage.jsx`
- **Method/Function**: Buat blok `useEffect` di dalam komponen `LandingPage`.
- **Hook yang digunakan**: `useAuthStore` (untuk *get state*) dan `useNavigate` (untuk pindah rute).
- **State Management**: Zustand `useAuthStore` (hanya *read*).
- **Catatan**: Di dalam `useEffect`, lakukan pengecekan *state* auth. Jika nilai `token` tersedia di dalam store, eksekusi fungsi *navigate* menuju halaman list kanji (misalnya `/kanji`). Ini memastikan pengguna yang sudah *login* tidak perlu melihat landing page lagi.

### Step 4: Menambahkan Halaman ke Router
- **Apa yang dibuat**: Konfigurasi routing utama aplikasi (misalnya di `frontend/src/router/index.jsx`).
- **Method/Function**: Tambahkan objek rute baru sesuai format React Router v7.
- **Hook yang digunakan**: Tidak ada.
- **State Management**: Tidak ada.
- **Catatan**: Daftarkan komponen `LandingPage` pada *path* `/` (root URL). Pastikan rute ini bersifat **public** dan sama sekali tidak dibungkus oleh *auth guard* (private route wrapper), karena halaman ini harus bisa diakses secara bebas.

## Struktur Komponen
```text
LandingPage
└── MainLayout (Atau tanpa layout jika Landing Page mendefinisikan strukturnya sendiri secara standalone)
    ├── Navbar (Navigasi Sederhana)
    │     ├── Logo App
    │     └── NavLinks (Link ke Login, Register)
    ├── HeroSection
    │     ├── Heading (Nama App & Tagline)
    │     ├── Subheading (Deskripsi singkat oKanji)
    │     └── CTAButton (Tombol "Mulai Belajar" atau "Login")
    └── FeaturesSection
          └── FeatureCard (Reusable komponen untuk list fitur unggulan)
```

## Redirect Logic
Pengecekan autentikasi dilakukan di dalam komponen `LandingPage` segera setelah halaman di-*mount*. 
Gunakan *custom hook* dari Zustand (`useAuthStore`) untuk mengambil state autentikasi (seperti variabel `token` atau objek `user`). 
Gunakan `useEffect` yang me-listen pada perubahan variabel auth tersebut. Di dalam *effect*, buat logika pengecekan kondisi: jika `token` bernilai *truthy* (valid/ada), panggil fungsi dari *hook* `useNavigate` (milik React Router v7) untuk langsung mengalihkan rute pengguna ke halaman Kanji List (contoh rute: `/kanji`).

## Zustand Store yang Terlibat
- **Store**: `useAuthStore` (pada file `frontend/src/stores/use-auth-store.js` atau file terkait).
- **State yang di-consume**: state token akses atau info sesi pengguna. Pada halaman ini, store **hanya bertindak sebagai read-only** (hanya dibaca nilainya), dan sama sekali tidak ada proses manipulasi *state* (write/update).

## Catatan Komponen Reusable
- **`FeatureCard`**: Komponen ini adalah **komponen UI yang reusable**. Dengan ditempatkan pada `frontend/src/components/ui/FeatureCard.jsx`, komponen ini diharapkan bisa digunakan kembali di halaman lain (seperti halaman *About* atau dokumentasi internal) jika sewaktu-waktu membutuhkan tampilan kartu informasi dengan pola desain yang serupa.

## Checklist Selesai
- [ ] Membuat file komponen `FeatureCard.jsx` yang reusable.
- [ ] Membuat file `LandingPage.jsx`.
- [ ] Menyusun *Hero Section* (Heading, Tagline, dan tombol CTA ke halaman login/register).
- [ ] Menyusun *Features Section* menggunakan beberapa instansi dari `FeatureCard`.
- [ ] Menambahkan *redirect logic* menggunakan `useEffect` dan `useAuthStore` untuk memindahkan *user* yang sudah *login* ke Kanji List.
- [ ] Mendaftarkan route `/` untuk merender komponen `LandingPage` secara *public*.
- [ ] Memastikan tidak ada fungsi API call yang digunakan di dalam file `LandingPage.jsx` (murni tampilan dan pengalihan).
- [ ] Memastikan halaman terlihat responsif berkat penggunaan *utility classes* Tailwind v4.
---
