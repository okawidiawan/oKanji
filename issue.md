# Feature: Implementasi API Get Current User

## 1. Background & Tujuan

Aplikasi oKanji memerlukan fitur untuk mengambil data profil pengguna (user) yang saat ini sedang dalam status login aktif. Fitur ini esensial bagi antarmuka pengguna (Frontend) untuk menampilkan nama dan memastikan bahwa token yang disimpan pada sesi saat ini masih valid di sisi server.

Issue ini dirancang secara terisolasi agar dapat dengan mudah dikerjakan dan diterapkan ke _codebase_ utama yang berorientasi pada layer Service, Controller, dan Router.

## 2. Spesifikasi Teknis

- **Endpoint**: `GET /api/users/current`
- **Tipe Auth**: Menggunakan Bearer Token yang sudah tervalidasi melalui `auth-middleware`.
- **Request Header**:
  - `Authorization: Bearer <token>`
- **Logic**:
  - Middleware `authMiddleware` akan bertugas memblokir akses jika token tidak valid (menghasilkan 401 Unauthorized).
  - Jika lolos layer otentikasi, _Controller_ akan meneruskan identitas (misal: email dari `req.user`) ke _Service_.
  - _Service_ mengambil data terbaru `username` user dari database.
- **Contoh Response Success (200 OK)**:
  ```json
  {
    "data": {
      "username": "okawidiawan",
      "email": "oka@gmail.com"
    }
  }
  ```
- **Contoh Response Error (401 Unauthorized)**:
  ```json
  {
    "errors": "Unauthorized"
  }
  ```

## 3. Step-by-step Implementasi

Terapkan modifikasi ini secara berurutan:

1. **`backend/src/services/user-service.js`**
   - Buat sebuah konstanta fungsi _async_ baru dengan nama `get`.
   - Fungsi ini menerima satu parameter (contoh: `email` pengguna yang didapat dari `req.user`).
   - Gunakan `prisma.user.findUnique` untuk mencari user berdasarkan `email` tersebut.
   - Di dalam pencariannya, gunakan `select: { username: true, email: true }` untuk meminimalkan _payload_ sesuai spesifikasi respons.
   - Jika user entah kenapa tidak ditemukan, _throw error_ melalui `new ResponseError(404, "User is not found")`.
   - _Return_ data _object_ user yang didapat (`{ username: "...", email: "..." }`).
   - Ekspor fungsi `get` pada modul di baris terakhir.

2. **`backend/src/controller/user-controller.js`**
   - Impor fungsi `get` dari `user-service.js` (jika belum mengimpor _all services_).
   - Buat konstanta _async controller_ dengan nama `get(req, res, next)`.
   - Gunakan _try-catch_ block layaknya arsitektur pada _controller_ lain.
   - Panggil fungsi _service_: `const result = await userService.get(req.user.email);` (di oKanji, object `req.user` disuapi secara otomatis saat lolos dari `authMiddleware`).
   - Lempar _respons JSON_: `res.status(200).json({ data: result });`
   - Jangan lupa mengeksekusi `next(e)` apabila ada error pada blok _catch_.
   - Tambahkan `get` ke statemen ekspor (_export_).

3. **`backend/src/routes/user-route.js`**
   - Lakukan impor untuk fungsi `get` dari `userController` (otomatis jika destructuring sudah terjadi).
   - Tambahkan rute baru tepat di area kode _protected route_ (setelah inisialisasi `authMiddleware`).
   - Daftarkan sintaks rute: `userRouter.get('/api/users/current', authMiddleware, userController.get);`

## 4. Acceptance Criteria

- [ ] Endpoint merespons dengan HTTP Status Code 200 dan mengembalikan object json `{ data: { username: "...", email: "..." } }` apabila _request header_ menyertakan Bearer token _valid_.
- [ ] Endpoint dikawal sempurna oleh `authMiddleware` dan merespons `401 Unauthorized` secara presisi apabila token _invalid_ atau tidak disertakan pada _header_.
- [ ] Proses pengecekan parameter/validasi token **sepenuhnya** terjadi di middleware `auth-middleware.js`, bukan terselip manual via kode logic di baris _controller_.
- [ ] **Data Isolation**: User hanya dikembalikan datanya sendiri berdadsarkan identitas dari token. User sama sekali tidak bisa dan tidak boleh meminta atau melihat profil milik orang lain.
- [ ] Modifikasi dipastikan **hanya** berkutat pada tiga file scope di atas (`user-service`, `user-controller`, dan `user-route`).
- [ ] **Tidak** terdeteksi _dependency_ bawaan baru pada file `package.json`.
