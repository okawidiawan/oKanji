# Issue: Implementasi Logika Bisnis & Integrasi API Frontend

## Deskripsi
Setelah scaffolding frontend oKanji selesai disiapkan, langkah selanjutnya adalah mengimplementasikan logika bisnis, manajemen state, dan integrasi API ke dalam komponen-komponen yang telah tersedia.

## Tujuan
- Menyelesaikan alur autentikasi (Login, Register, Logout).
- Mengintegrasikan data kanji dari backend ke UI.
- Mengelola progres hafalan pengguna secara real-time.

## Tech Stack & Integrasi
- **Base API**: Gunakan axios instance di `src/lib/api.js`.
- **State Management**: Gunakan Zustand store di `src/stores/`.
- **Routing**: Gunakan React Router v7 di `src/router/index.jsx`.
- **Styling**: Tailwind CSS v4.

## Daftar Tugas

### 1. Autentikasi & Authorization
- [ ] Implementasi login di `LoginPage.jsx` & integrasi dengan `useAuthStore`.
- [ ] Implementasi registrasi di `RegisterPage.jsx`.
- [ ] Tambahkan logic redirect jika user belum login (Protected Routes).
- [ ] Implementasi fungsi logout di Navbar/Profile.

### 2. Fitur Kanji
- [ ] Fetch dan tampilkan daftar kanji di `KanjiListPage.jsx`.
- [ ] Implementasi filter berdasarkan tingkat JLPT (N1-N5).
- [ ] Implementasi pagination untuk daftar kanji.
- [ ] Fetch detail kanji di `KanjiDetailPage.jsx` berdasarkan ID.

### 3. Progres Pengguna
- [ ] Implementasi form/button untuk update progres hafalan (Upsert User-Kanji).
- [ ] Tampilkan status progres pengguna pada list dan detail kanji.
- [ ] Sinkronisasi data progres ke `useAuthStore` atau store terkait.

### 4. Profil & Pengaturan
- [ ] Tampilkan data user yang sedang login di `ProfilePage.jsx`.
- [ ] Implementasi fitur update nama/password.

## Konvensi Kode
- Gunakan `camelCase` untuk variabel/fungsi.
- Gunakan `PascalCase.jsx` untuk komponen React.
- Error handling harus konsisten menggunakan `try...catch` dan menampilkan pesan ke user.
- Ikuti panduan di `CONTEXT.md`.

## Kriteria Penerimaan
- User dapat login/register dan datanya tersimpan di state.
- Daftar kanji dapat dimuat dengan lancar dari API.
- Update progres tersimpan ke database backend.
- UI responsif dan menggunakan tema warna oKanji.
