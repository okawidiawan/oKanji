# Refactor: Pemisahan Publik dan Authorized API Router

## 1. Background & Tujuan
Saat ini, rute API (routing) pada proyek oKanji tersebar di dalam beberapa file yang spesifik per *entity* (`user-route.js`, `kanji-route.js`, `user-kanji-route.js`). Struktur ini berpotensi membingungkan ketika membedakan mana endpoint yang bersifat publik dan mana yang membutuhkan otorisasi keamanan. 

Tujuan dari perbaikan ini adalah merapikan manajemen rute dengan memecahnya ke dalam dua file utama: `public-api.js` untuk rute bebas akses dan `api.js` untuk rute terotorisasi. Hal ini akan mempermudah pembacaan kode, penerapan *middleware* perlindungan secara massal (tanpa memanggil berulang kali), serta menyederhanakan deklarasi rute di file `web.js`.

## 2. Spesifikasi Teknis
### API Public (`src/routes/public-api.js`)
Semua endpoint di sini **tidak** membutuhkan validasi `authMiddleware` maupun token *header*.
- `POST /api/users` (User Register)
- `POST /api/users/login` (User Login)

### API Non-Public/Authorized (`src/routes/api.js`)
Semua endpoint di sini wajib memuat *request header*: `Authorization: Bearer <token>`.
Semua endpoint memiliki lapisan *auth middleware* secara otomatis dengan menempelkannya langsung ke level *Router*.
- `DELETE /api/users/logout` (User Logout)
- `GET /api/users/current` (User Get Current)
- `GET /api/kanjis` (Get All Kanji List)
- `GET /api/user-kanji` (Get User Kanji List)
- Dan seluruh metode CRUD tersisa pada fitur `user-kanji`.

## 3. Step-by-step Implementasi Terperinci

1. **Membuat `src/routes/public-api.js`**
   - Buat file baru bernama `public-api.js`.
   - Inisialisasi Express router (`const publicRouter = express.Router();`).
   - Impor fungsi `register` dan `login` dari `user-controller.js`.
   - Cukup daftarkan: `publicRouter.post('/api/users', userController.register);` dan `publicRouter.post('/api/users/login', userController.login);`.
   - _Export_ `publicRouter`.

2. **Membuat `src/routes/api.js`**
   - Buat file baru bernama `api.js`.
   - Inisialisasi Express router (`const apiRouter = express.Router();`).
   - Impor `authMiddleware` dan segera pasang di level global router ini menggunakan `apiRouter.use(authMiddleware);`.
   - Impor semua _controller_ (`userController`, `kanjiController`, `userKanjiController`).
   - Pindahkan seluruh deklarasi rute URL sisa dari API pengguna (logout, current) serta seluruh API milik kanji dan user-kanji dari file rute lama menjadi `apiRouter.get(...)`, `apiRouter.post(...)`, dsb.
   - _Export_ `apiRouter`.

3. **Memodifikasi `src/application/web.js`**
   - Hapus impor rute lama (`userRouter`, `kanjiRouter`, `userKanjiRouter`).
   - Impor `publicRouter` dan `apiRouter` dari file konfigurasi yang baru dibuat.
   - Hapus blok registrasi router `.use()` yang lama.
   - Gantilah dengan:
     ```javascript
     app.use(publicRouter);
     app.use(apiRouter); // apiRouter sudah memiliki authMiddleware di dalamnya
     ```

4. **Pembersihan File Bekas**
   - Hapus 3 file lama yang sudah diekstrak sepenuhnya: `src/routes/user-route.js`, `src/routes/kanji-route.js`, dan `src/routes/user-kanji-route.js`.
   - Pastikan Anda memodifikasi file *testing* apabila terdapat error _import path_ (meskipun hal ini tidak akan terjadi jika _setup test_ merujuk pada file `web.js`).

## 4. Acceptance Criteria
- [ ] Tersedia tepat dua file *router* terpusat terbaru: `public-api.js` dan `api.js`.
- [ ] Endpoint pendaftaran (register) dan login berhasil dieksekusi tanpa adanya halangan validasi token (berada tepat di dalam *Public API*).
- [ ] API tertutup memblokir seluruh operasi yang tidak menyertakan _Authorization Header_ (via integrasi API Router).
- [ ] Validasi tes menggunakan `bun test` melaporkan status hijau 100% tanpa adanya kegagalan routing satupun.
- [ ] Tidak ada berkas rute lawas (`user-route.js`, `user-kanji-route.js`, dll) yang tertinggal di *codebase*.
- [ ] Berpegang teguh pada ketentuan modifikasi yang hanya merombak level `routes` dan `web.js` tanpa menyentuh *Controllers* maupun *Services*.
