# Feature: Login User

## Deskripsi Fitur
Membuat endpoint API untuk fitur login pengguna menggunakan Express JS, Prisma ORM, MySQL, dan `bcrypt` (untuk komparasi hash password). Proses login yang berhasil akan men-*generate* `uuid` sebagai token autentikasi yang kemudian disimpan ke database.

## Spesifikasi Endpoint API

- **Metode & Endpoint**: `POST /api/users/login`
- **Request Body**:
```json
{
	"email": "oka@localhost",
	"password": "rahasia"
}
```
- **Response Body (Success / 200 OK)**:
```json
{
	"data": "token_uuid_yang_di_generate"
}
```
- **Response Body (Error / 401 Unauthorized)**:
```json
{
	"error": "Email atau password salah"
}
```

## Arsitektur & Struktur Folder

Lanjutkan penggunaan struktur folder MVC yang sudah ada di dalam direktori `backend/src`:
- `routes/`: Tempat mendeklarasikan API endpoint. (Gunakan file: `user-route.js`)
- `services/`: Tempat menulis business logic utama (validasi form login, mencocokkan password, generate & sinkronisasi token di DB). (Gunakan file: `user-service.js`)
- `controller/`: Bertindak memproses input request, meneruskan data ke service, lalu mengirimkan respons JSON kembali. (Gunakan file: `user-controller.js`)
- `error/`: Mengandalkan middleware error handler yang sudah dibuat pada fitur registrasi sebelumnya (`response-error.js`).

---

## Tahapan Implementasi (Instruksi Teknis Junior/AI)

Ikuti langkah-langkah runut ini:

### 1. Install Dependency Library `uuid`
- Kamu memerlukan package `uuid` untuk men-*generate* string token secara acak dan unik.
- Buka terminal, pastikan kamu berada di dalam direktori `backend/`, dan jalankan: `bun add uuid`.

### 2. Penambahan Logic di Service (`src/services/user-service.js`)
- Buka file `src/services/user-service.js`.
- *Import* library UUID di baris paling atas: `const { v4: uuid } = require('uuid');`.
- Buat dan *export* asynchronous fungsi baru bernama `login(request)`.
- **Cari Data User:** Gunakan fungsi `prisma.user.findUnique()` terhadap email yang di-*submit* (`request.email`).
- **Validasi Data:** Jika data user bernilai `null` (tidak ditemukan), berhentikan fungsi dan *throw error* menggunakan custom error class: `throw new ResponseError(401, "Email atau password salah")`. 
- **Komparasi Password:** Jika data user ada, verifikasikan password menggunakan `await bcrypt.compare(request.password, user.password)`.
- Jika `bcrypt.compare` me-return `false`, gunakan kembali *throw error*: `throw new ResponseError(401, "Email atau password salah")`. Pastikan menggunakan pesan yang sama demi keamanan asimetris.
- **Generate Token:** Hasilkan UUID unik: `const token = uuid();`.
- **Simpan Token:** Gunakan fungsi `prisma.user.update()` untuk *update* field `token` dengan UUID terbaru untuk user dengan format record pencarian berdasarkan ID atribut tabel atau Email di Database.
- **Kembalikan Token:** Return string `token` dari fungsi.

### 3. Penambahan Controller (`src/controller/user-controller.js`)
- Buka file `src/controller/user-controller.js`.
- Buat dan *export* asynchronous *handler function* bernama `login(req, res, next)`.
- Gunakan blok standard `try...catch`. 
- Pada ruas `try`, panggil `const token = await userService.login(req.body);`. 
- Return JSON response format standard `{ data: token }` beserta `.status(200)`.
- Pada blok `catch(e)`, panggil middleware interseptor lewat pemanggilan `next(e)`.

### 4. Pendaftaran Routing API (`src/routes/user-route.js`)
- Buka file rute `src/routes/user-route.js`.
- Modifikasi inisialisasi *router* untuk langsung membawahi API Endpoint Login:
  `userRouter.post('/api/users/login', userController.login);`.
- Simpan file.

Pastikan kamu mengikuti detail kembalian pesan JSON (entah berhasil atau parameter keliru) yang tercantum persis pada format Spesifikasi Endpoint API di dokumen ini.
