# Feature: Registrasi User Baru

## Spesifikasi Database

Buat/Modifikasi model `User` di Prisma sehingga menghasilkan struktur tabel berikut di MySQL:
- `id`: integer, auto increment, primary key
- `username`: varchar 255 (berasal dari property `"name"` pada request body)
- `email`: varchar 255, unique
- `password`: varchar 255, not null (password harus berupa hash dari `bcrypt`)
- `create_at`: timestamp, default current_timestamp

## Spesifikasi Endpoint API

- **Metode & Endpoint**: `POST /api/users`
- **Request Body**:
```json
{
	"name": "Oka",
	"email": "oka@localhost",
	"password": "rahasia"
}
```
- **Response Body (Success / 200 OK)**:
```json
{
	"data": "OK"
}
```
- **Response Body (Error / 400 Bad Request)**:
```json
{
	"error": "Email sudah terdaftar"
}
```

## Arsitektur & Struktur Folder

Di dalam direktori `backend/src`, buatlah struktur folder dan file sebagai berikut untuk memisahkan logic aplikasi (Clean Architecture pattern sederhana):
- `routes/`: Tempat mendeklarasikan API endpoint. (Contoh file: `user-route.js`)
- `services/`: Tempat menulis business logic utama (validasi bisnis, hash password, interaksi db). (Contoh file: `user-service.js`)
- `controller/`: Bertugas menerima HTTP Request (req), memanggil layer service, dan mengirim HTTP Response (res). (Contoh file: `user-controller.js`)
- `error/`: Bertugas menampung custom error class atau error middleware untuk menyeragamkan response error program. (Contoh file: `error-middleware.js` atau `response-error.js`)

---

## Tahapan Implementasi (Untuk Junior Programmer / AI Model)

Ikuti langkah-langkah di bawah ini secara runut untuk mengimplementasikan fitur:

### 1. Update Database (Prisma)
- Buka file `backend/prisma/schema.prisma`.
- Ubah/buat model `User` yang mencerminkan detail: `id` (autoincrement), `username` (String), `email` (String, @unique), `password` (String), dan `create_at` (DateTime @default(now())).
- Jalankan perintah: `bun x prisma migrate dev --name update_user_table` untuk mengaplikasikan tabel ke database MySQL lokal.

### 2. Install Dependency Tambahan
- Kamu memerlukan bcrypt untuk hashing password. Jalankan perintah: `bun add bcrypt` di dalam folder `backend/`.

### 3. Setup Error Handling (`src/error`)
- Buat folder `src/error`.
- Buat file `response-error.js` yang mengekstend class `Error` native agar bisa menyimpan HTTP Status Code.
- Buat file `error-middleware.js` untuk menangkap error yang di-throw dari service. Middleware ini bertugas me-return response JSON persis dengan format: `{"error": "pesan error dari parameter"}` sesuai spesifikasi.

### 4. Implementasi Business Logic (`src/services/user-service.js`)
- Di dalam file ini, buat fungsi bernama `register(requestBody)`.
- Menggunakan `prisma.user.findUnique()`, periksa apakah database sudah memiliki user dengan email yang diinput. Jika sudah ada, lemparkan error custom: `throw new Error("Email sudah terdaftar")`.
- Jika email belum terdaftar, gunakan `await bcrypt.hash(requestBody.password, 10)` untuk menyandikan password asli pengguna.
- Gunakan `prisma.user.create()` untuk menyimpan data ke database. Perhatikan mapping input `"name"` ke kolom `"username"`.
- Return nilai sukses (meskipun hanya string `'OK'` atau object user) ke controller.

### 5. Implementasi Controller (`src/controller/user-controller.js`)
- Buat fungsi handler bernama `register(req, res, next)`.
- Ambil data dari parameter request dengan `req.body`.
- Masukkan dalam blok `try...catch`. Di blok `try`, panggil `await userService.register(req.body)`.
- Jika berhasil (tidak ada baris catch tersentuh), kembalikan response sukses: `res.status(200).json({ "data": "OK" })`.
- Jika gagal/masuk catch blok, panggil `next(error)` dengan mengoper argumen error agar diproses secara sentral oleh error middleware.

### 6. Deklarasi Endpoint (Routing) (`src/routes/user-route.js`)
- Import object express `Router`.
- Konfigurasi router untuk merespon POST request pada `'/api/users'` yang diarahkan dan ditangani oleh `userController.register`.
- Export konfigurasi modul routernya.

### 7. Hubungkan Semua Perubahan ke `src/index.js` Utama
- Buka entry point Express JS, lalu *import* `user-route.js`.
- Daftarkan route baru tersebut sebelum baris `app.listen` dengan memanggil `app.use(userRouter)`.
- Pastikan kalian menempatkan `errorMiddleware` di bawah pendaftaran route yang lain (`app.use(errorMiddleware)`) agar bisa menyerap dan memformat segala exception yang muncul secara serasi dari atas ke bawah.
