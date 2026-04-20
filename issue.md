# Issue: Implementasi UI Atomic Components & Integrasi Auth State

## Deskripsi
Setelah sistem routing dan layouting (MainLayout & AuthLayout) diperbaiki menggunakan `<Outlet />`, tahap selanjutnya adalah membangun UI Kit dasar dan mengintegrasikan Zustand store ke dalam alur login/register.

## Tujuan
- Membangun komponen UI yang reusable (Button, Input, Card).
- Mengintegrasikan logic login/register dengan `useAuthStore`.
- Memastikan navigasi antar halaman (Login -> Dashboard) berjalan mulus.

## Daftar Tugas

### 1. UI Kit (Atomic Design)
- [ ] Buat komponen `Button.jsx` dengan varian (primary, secondary, ghost) menggunakan Tailwind.
- [ ] Buat komponen `TextField.jsx` untuk input form dengan penanganan error.
- [ ] Buat komponen `KanjiCard.jsx` untuk menampilkan ringkasan kanji di dashboard.

### 2. Integrasi Store & API
- [ ] Implementasi handler `onSubmit` pada `LoginPage.jsx` menggunakan `axios` dan `useAuthStore`.
- [ ] Simpan token ke `localStorage` (persist state) saat login berhasil.
- [ ] Implementasi logic `logout` di `ProfilePage.jsx`.

### 3. Navigasi & UX
- [ ] Tambahkan loading state (spinner/skeleton) saat proses autentikasi.
- [ ] Implementasi redirect otomatis ke `/` (home) jika user sudah memiliki token saat mengakses halaman login.

## Kriteria Penerimaan
- Komponen UI dapat digunakan kembali di berbagai halaman.
- User berhasil login dan datanya tersimpan di Zustand store.
- Navigasi antar halaman tidak menyebabkan reload penuh (SPA behavior).
