# Implementasi Unit Test untuk API oKanji

## 1. Background & Tujuan
Saat ini project oKanji belum memiliki unit test untuk setiap endpoint API yang tersedia. Tujuan dari issue ini adalah untuk merencanakan dan mendokumentasikan penambahan unit test skala penuh. Unit test ini akan mencakup User API, Kanji API, dan User Kanji API. Mocking mutlak diterapkan untuk objek Prisma client sehingga tidak ada interaksi terhadap database sungguhan ketika testing berjalan.

## 2. Perubahan yang Diperlukan (Before vs After)

**Struktur Direktori:**
*   **Before:** Tidak ada folder test khusus maupun implementasi test pada API terkait.
*   **After:** Akan ada direktori `tests/` di dalam project (misal `backend/tests/`) dengan pola penamaan file js yang seragam.

**Perubahan per File:**

*   **[NEW] `tests/users-test.js`**: File pengujian fungsionalitas User: fungsi Registrasi, Login, dan Logout.
*   **[NEW] `tests/kanji-test.js`**: File pengujian fungsionalitas list data Kanji, filter berdasarkan `jlptLevel`, serta pengujian sistem paginasi.
*   **[NEW] `tests/user-kanji-test.js`**: File pengujian fungsionalitas interaksi User dan Kanji: menandai kanji sebagai `isMemorized`, melihat list hafalan, dan proteksi otorisasi dari endpoint tersebut.

## 3. Step-by-step Implementasi
Berikut adalah panduan pengerjaan bagi *developer*/AI Model:

1.  **Persiapan Folder dan File Test:**
    *   Buat directory test dengan nama `tests`.
    *   Buat tiga file kosong sesuai penamaan yang disyaratkan: `users-test.js`, `kanji-test.js`, dan `user-kanji-test.js`.

2.  **Persiapan Mock Prisma:**
    *   Buat setup utilitas untuk melakukan intersep (mock) pada client Prisma secara _in-logic_ (tergantung *test-runner* yang mendukung untuk *stubbing* dan *mocking* dalam project tanpa module tambahan).
    *   Pastikan seluruh eksekusi kueri terisolasi dengan menggunakan mock dan bukan koneksi real Prisma.

3.  **Membuat Setup `beforeEach`:**
    *   Setiap file test (`users-test.js`, `kanji-test.js`, `user-kanji-test.js`) wajib diinisialisasi dengan fungsi `beforeEach`.
    *   Gunakan block fungsi `beforeEach` untuk me-*reset* status mock/stub Prisma dari test bed sebelumnya sehingga setiap test (*it block*) bersifat mandiri (independent).

4.  **Implementasi `users-test.js` (User API):**
    *   Bungkus test dengan `describe('User API', () => { ... })`.
    *   **Registrasi:** Tulis *positive case* dan *negative cases* (contoh: email sudah dipakai, field kosong).
    *   **Login:** Tulis *positive case* (menerima token) dan *negative cases* (user tidak valid/password salah).
    *   **Logout:** Tulis *positive case* (user berhasil logout) dan *negative cases* (mencoba logout tanpa header Auth / tidak resmi).

5.  **Implementasi `kanji-test.js` (Kanji API):**
    *   Bungkus test dengan `describe('Kanji API', () => { ... })`.
    *   **List Kanji:** Tulis uji coba pengembalian array kosong dan list berisi data (*mock* response DB).
    *   **Filter level (untuk JLPT):** Uji logika query saat parameter `level` dilempar (bukan `jlptLevel`).
    *   **Paginasi Lengkap:** Validasi response payload untuk object meta berjalan dengan detail `page`, `limit`, `total_page`, dan `total_item` yang dikalkulasi benar.
    *   **Nilai Default Paginasi:** Lakukan test pengambilan list tanpa *query string* (`page` atau `limit` tidak dikirim), pastikan logic default page dan limit bekerja. Berikan uji batas *negative case* (misal page bernilai huruf, limit < 1).

6.  **Implementasi `user-kanji-test.js` (User Kanji API):**
    *   Bungkus test dengan `describe('User Kanji API', () => { ... })`.
    *   **Requirement Auth (Global file ini):** Lakukan *negative case* saat pengguna sama sekali tidak mencantumkan `Authorization` token header. Pastikan API mem-blokir akses dengan response error (401).
    *   **Get Status Spesifik Kanji (`get`)**: Buat skenario pengujian untuk mengambil status hafalan 1 kanji spesifik berdasarkan `kanjiId`. Pastikan penanganan saat kanji valid maupun invalid/tidak ditemukan tercover.
    *   **Tambah/Update Data Hafalan (`upsert`):** Validasi interaksi update `isMemorized` berhasil dengan dua skenario *source* ID: saat `kanjiId` dikirim lewat *URL Parameter* (`req.params.kanjiId`) maupun lewat *Request Body* (`req.body.kanjiId`). Lakukan validasi saat ID kanji fiktif atau tidak ditemukan (*negative case*).
    *   **Lihat List Hafalan (`list`):** Tangani skenario pengambilan list hafalan: pastikan menggunakan query parameter `size` (bukan limit), dan juga uji keberhasilan filter boolean menggunakan query parameter `isMemorized` (`?isMemorized=true/false`).

7.  **Standardisasi Bahasa Deskripsi:**
    *   Khusus argumen pertama pada format *describe* dan *it* **wajib memakai bahasa Indonesia**.
    *   *(Contoh)*: `it('seharusnya berhasil mendaftarkan pengguna baru', ...)` atau `it('seharusnya mengembalikan error 400 jika username null', ...)`.

## 4. Acceptance Criteria (AC)

Pekerjaan dianggap selesai jika semua hal berikut terpenuhi:

- [ ] Folder test dibuat dengan nama tepat `tests`.
- [ ] Nama file tepat: `users-test.js`, `kanji-test.js`, dan `user-kanji-test.js`.
- [ ] Pengujian sama sekali tidak menyentuh database rill (mock Prisma dapat dipertanggungjawabkan).
- [ ] Setiap file test menyertakan blok utama `describe` dan sub-case `it` yang deskriptif.
- [ ] Blok `beforeEach` aktif bekerja di semua file test untuk membersihkan mock tiap skenario.
- [ ] Seluruh skenario User API dan validasinya (positive/negative case) tersedia (Registrasi, Login, Logout).
- [ ] Uji Kanji API sukses memberikan keyakinan bahwa filter *level* (untuk JLPT), pengembalian list dasar, pembacaan struktur *pagination* (page, limit, total_page, total_item) beserta behavior *default value*-nya aman dari *bugs*.
- [ ] Uji User Kanji API memvalidasi seluruh fungsionalitas: endpoint `get` spesifik kanji, fungsi `upsert` yang bisa menerima *kanjiId* dari param/body, pengambilan paginasi list dengan param `size` dan argumen khusus filter *isMemorized*, dan proteksi Authorization global.
- [ ] Tidak ada modifikasi/rubahan di file di luar ruang lingkup skenario testing yang disebutkan.
- [ ] Tidak menambahkan package/dependensi test di `package.json` yang saat ini ada.
- [ ] Penamaan skenario eksklusif dalam Bahasa Indonesia (untuk seluruh string message di unit test `describe` & `it`).
