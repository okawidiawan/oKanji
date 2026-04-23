# Feature: Login dengan Username atau Email

## 1. Background & Tujuan

Saat ini, aplikasi oKanji hanya mendukung login menggunakan email. Untuk meningkatkan pengalaman pengguna dan fleksibilitas, fitur login perlu diperbarui agar pengguna dapat menggunakan salah satu dari `username` atau `email` sebagai identifier saat melakukan autentikasi.

## 2. Spesifikasi Teknis

- **Endpoint**: `POST /api/users/login`
- **Auth**: Tidak memerlukan autentikasi (Public)
- **Logic**: Sistem menerima `username` atau `email` dari request body, lalu mencari kecocokan user di database menggunakan query `OR`. Kolom `username` sudah ada di tabel `User` dan bersifat `unique`.

**Contoh Request Body (username saja)**:

```json
{
  "username": "okawidiawan",
  "password": "rahasia"
}
```

**Contoh Request Body (email saja)**:

```json
{
  "email": "okawidiawan@gmail.com",
  "password": "rahasia"
}
```

**Contoh Request Body (keduanya dikirim sekaligus — diperbolehkan)**:

```json
{
  "username": "okawidiawan",
  "email": "okawidiawan@gmail.com",
  "password": "rahasia"
}
```

> Jika keduanya dikirim, keduanya dimasukkan ke query `OR`. Tidak ada prioritas — user yang cocok dengan salah satu field akan ditemukan.

**Contoh Response Success (200)**:

```json
{
  "data": "token-uuid-disini"
}
```

**Contoh Response Error - Kredensial salah (401)**:

```json
{
  "error": "Email/Username atau password salah"
}
```

**Contoh Response Error - Tidak ada identifier (400)**:

```json
{
  "error": "Minimal salah satu dari username atau email harus diisi"
}
```

## 3. Step-by-step Implementasi per File

1. **`backend/src/validation/user-validation.js`**
   - Modifikasi `loginUserValidation` agar field `email` menjadi opsional (`.optional()`).
   - Tambahkan field `username` dengan tipe string opsional.
   - Tambahkan custom validation `.refine()` untuk memastikan bahwa minimal salah satu dari `username` atau `email` ada di request body. Pesan error refine: `"Minimal salah satu dari username atau email harus diisi"`.

2. **`backend/src/services/user-service.js`**
   - Pada fungsi `login()`, tangkap nilai dari `request.username` dan `request.email` hasil validasi.
   - Bangun array `OR` secara dinamis: masukkan kondisi `{ email }` hanya jika `email` ada, dan kondisi `{ username }` hanya jika `username` ada.
   - Gunakan `prisma.user.findFirst({ where: { OR: [...] } })` untuk mencari user.
   - Pesan error saat user tidak ditemukan atau password salah: `"Email/Username atau password salah"`. Pesan ini **disengaja** dibuat generik untuk mencegah user enumeration — jangan diubah.

3. **`backend/tests/users-test.js`**
   - Tambahkan test sukses: login menggunakan `username` yang valid + password benar → response 200 dengan token.
   - Tambahkan test sukses: login menggunakan keduanya (`username` + `email`) sekaligus + password benar → response 200.
   - Tambahkan test gagal: login menggunakan `username` yang valid + password salah → response 401.
   - Tambahkan test gagal: request body tidak mengandung `username` maupun `email` (body `{}`) → response 400.
   - Update ekspektasi pesan error di test login lama yang sebelumnya menggunakan pesan berbeda, sesuaikan dengan `"Email/Username atau password salah"`.
   - Sesuaikan mock: ganti mock `prisma.user.findUnique` menjadi `prisma.user.findFirst` jika ada perubahan query di service.

## 4. Acceptance Criteria

- [ ] Endpoint `POST /api/users/login` menerima request body dengan `username` saja, `email` saja, atau keduanya tanpa error struktur.
- [ ] Login berhasil dan mengembalikan token jika kombinasi `username` + `password` benar.
- [ ] Login berhasil dan mengembalikan token jika kombinasi `email` + `password` benar.
- [ ] Login berhasil jika keduanya (`username` + `email`) dikirim dan salah satu cocok di database.
- [ ] Response HTTP `401` dengan `{"error": "Email/Username atau password salah"}` jika kredensial tidak valid.
- [ ] Response HTTP `400` jika request body tidak mengandung `username` maupun `email` sama sekali (termasuk body `{}`).
- [ ] Semua unit test di `users-test.js` yang berkaitan dengan login berjalan sukses.
- [ ] Tidak ada dependency tambahan yang di-install.
- [ ] Hanya 3 file yang dimodifikasi: `user-validation.js`, `user-service.js`, `users-test.js`.
