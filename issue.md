# Feature: API Update Current User

## 1. Background & Tujuan
Aplikasi oKanji memerlukan mekanisme bagi pengguna yang sudah login untuk memodifikasi profil pribadi mereka (seperti mengganti nama tampilan atau password). Fitur ini penting untuk memberikan kebebasan kustomisasi akun pada antarmuka Frontend.

Issue ini ditujukan untuk membuat fungsionalitas pembaruan data (Update) yang dilakukan mematuhi prinsip **Security First**, di mana *user* tidak diperbolehkan dan secara logik tidak bisa mengubah profil pengguna lain.

## 2. Spesifikasi Teknis
- **Endpoint**: `PATCH /api/users/current`
- **Auth**: Menggunakan *Bearer Token* via header `Authorization: Bearer <token>`.
- **Payload/Body**:
  ```json
  {
    "name": "Oka Widiawan Update",
    "password": "newpassword123" 
  }
  ```
  *(Kedua atribut di atas bersifat opsional; user bisa mengirim name saja, password saja, atau keduanya)*.
- **Batasan Akses Opsional**: User **hanya** dikembalikan dan dapat meng-update datanya sendiri berdasarkan token yang digunakan. Tidak boleh ada ID URL param yang bisa dimanipulasi oleh *client*.
- **Contoh Response Success (200 OK)**:
  ```json
  {
    "data": {
      "username": "okawidiawan",
      "name": "Oka Widiawan Update"
    }
  }
  ```
- **Contoh Response Error (401 Unauthorized)**:
  ```json
  {
    "errors": "Unauthorized"
  }
  ```

## 3. Step-by-step Implementasi Terperinci
Ikuti daftar langkah di bawah ini secara sekronologis dan batasi perubahan hanya pada file-file berikut:

1. **`backend/src/validation/user-validation.js`**
   - Buat fungsi validasi Zod baru bernama `updateUserValidation`.
   - Konfigurasi skema *object* dengan struktur:
     - `name`: string, maksimal 255 karakter, bersifat `.optional()`
     - `password`: string, minimal 8 karakter, maksimal 255 karakter, bersifat `.optional()`
   - Pasang pesan *error* Bahasa Indonesia yang konsisten dengan rute sebelumnya (misal: "Nama maksimal 255 karakter", dsb).
   - Pastikan variabel ditambahkan pada direktif `export` di baris terbawah.

2. **`backend/src/services/user-service.js`**
   - Impor modul `bcrypt` untuk melakukan eksekusi *hashing* password dan `updateUserValidation`.
   - Buat *async function* baru: `const update = async (email, request) => { ... }`.
   - Validasi data parameter `request` terlebih dahulu menggunakan `updateUserValidation.parse(request)`.
   - Cek database menggunakan `prisma.user.findUnique` untuk memastikan `email` *(didapat dari token)* benar-benar exist.
   - Apabila parameter *password* ikut dikirimkan pada `request`, lakukan `await bcrypt.hash(request.password, 10)` dan sematkan hasilnya untuk diupdate. Apabila tidak ada *password*, abaikan.
   - Panggil `prisma.user.update` dengan kondisi filter `where: { email: email }`.
   - Masukkan *data payload* (berupa *name/password* dari request) ke klausa `data`.
   - Pada akhirnya, return hasil melalui blok `select: { username: true, name: true }`.
   - *Export* fungsi `update`.

3. **`backend/src/controller/user-controller.js`**
   - Buat metode fungsi *async* `update = async (req, res, next) => { ... }` 
   - Di dalamnya, bungkus logika di blok `try ... catch (e) { next(e) }`.
   - Panggil nilai pengembalian Service: `const result = await userService.update(req.user.email, req.body);`
   - Berikan kembalian JSON dengan struktur `{ data: result }` diiringi HTTP status `200`.
   - Ekspor fungsi `update`.

4. **`backend/src/routes/api.js`**
   - Daftarkan metode `userController.update` ke Express *Router* yang sudah ada.
   - Selipkan kode rute berikut di bawah baris fitur `GET /api/users/current`:
     `apiRouter.patch('/api/users/current', userController.update);`

5. **`backend/tests/users-test.js`** (Opsional untuk Jaminan)
   - Disarankan secara kuat untuk menambah *describe block* guna mencoba skenario `PATCH /api/users/current`. Uji saat mengubah *password* valid, *name* valid, dan error ketika memodifikasi dengan Bearer token fiktif.

## 4. Acceptance Criteria
- [ ] Endpoint `PATCH /api/users/current` berhasil terdaftar dan memproses pembaruan data _name_, _password_, atau kombinasi keduanya dengan benar.
- [ ] Validasi keamanan `authMiddleware` dan isolasi data berfungsi maksimal (user tak mungkin mengakses data di luar identitas token).
- [ ] `password` baru secara otomatis menempuh enkripsi (via `bcrypt.hash`) sebelum didorong ke Prisma.
- [ ] Proses pembaruan jika me-*request* satu kolom saja tidak menghapus status kolom lama (Data ter-*merge*/parsial dengan lancar).
- [ ] Tes unit menunjukkan *coverage test pass* 100%.
- [ ] Berpegang pada larangan ketat: jangan modifikasi _Routing Public_ maupun mengunduh _dependency npm_ baru.
