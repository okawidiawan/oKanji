# Implementasi API Logout User

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan fitur logout pada aplikasi oKanji. Saat user melakukan logout, token autentikasi milik user tersebut harus dihapus (di-set menjadi `null`) dari database sehingga token tersebut tidak dapat digunakan lagi untuk request selanjutnya.

## Spesifikasi API

- **Endpoint:** `DELETE /api/users/logout`
- **Header Diperlukan:** `Authorization` (Berisi token)
- **Response Body (Success):**
  ```json
  {
      "data": "OK"
  }
  ```
- **Response Body (Error - Jika token tidak ada / invalid):**
  ```json
  {
      "error": "Unauthorized"
  }
  ```
  *(Catatan: Saat ini `auth-middleware.js` menangani response error `Unauthorized`. Pastikan menggunakan format response yang sesuai di middleware auth).*

---

## Tahapan Implementasi

Berikut adalah langkah-langkah yang harus dilakukan untuk menyelesaikan fitur ini secara berurutan:

### 1. Update Service (`backend/src/services/user-service.js`)
Service bertanggung jawab untuk menampung logic bisnis, yaitu berinteraksi dengan database untuk menghapus token user.

- **Langkah-langkah:**
  - Tambahkan fungsi baru bernama `logout(email)` (atau menggunakan parameter lain seperti `username`).
  - Lakukan operasi `prisma.user.update` untuk mencari user berdasarkan `email` yang di-passing dan men-set nilai `token` menjadi `null`.
  - Jangan lupa export fungsi `logout` tersebut di bagian bawah file.

### 2. Update Controller (`backend/src/controller/user-controller.js`)
Controller bertugas untuk me-manage request/response HTTP.

- **Langkah-langkah:**
  - Buat fungsi baru dengan nama `logout` (misal: `const logout = async (req, res, next) => { ... }`).
  - Di dalam blok `try`, panggil `userService.logout(req.user.email)`. Objek `req.user` bisa didapat karena endpoint ini akan diproteksi oleh *auth middleware*.
  - Kembalikan response JSON dengan status `200` (OK) sesuai dengan spesifikasi (body: `{ "data": "OK" }`).
  - Pada blok `catch`, lemparkan error ke `next(e)` agar ditangkap oleh error handling middleware.
  - Export fungsi `logout` ini.

### 3. Update Route (`backend/src/routes/user-route.js`)
Route bertugas untuk mengatur path API dan menyambungkannya dengan controller yang sesuai. Karena logout butuh autentikasi, kita perlu mengaplikasikan middleware.

- **Langkah-langkah:**
  - Import `authMiddleware` dari `../middleware/auth-middleware.js`.
  - Tambahkan routing baru menggunakan HTTP Method `DELETE`.
  - Tulis kodenya menggunakan middleware di antara endpoint dan controller. Contoh:
    `userRouter.delete('/api/users/logout', authMiddleware, userController.logout);`

### 4. Testing (Opsional tapi Direkomendasikan)
- Jalankan aplikasi (`npm run dev`) atau jalankan unit test jika tersedia.
- Hit endpoint login dengan user yang valid untuk mendapatkan `token`.
- Lakukan request ke `DELETE /api/users/logout` dengan set Header `Authorization: <token_tadi>`.
- Pastikan response mengembalikan `"data": "OK"`.
- Periksa database, pastikan kolom `token` untuk user tersebut sudah menjadi `null`.
- Coba hit lagi endpoint logout dengan token yang sama, dan pastikan mendapat balasan `"error": "Unauthorized"`.
