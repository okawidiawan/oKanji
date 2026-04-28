# Feature: Implementasi API Update User Kotoba Progress

## 1. Background & Tujuan
Aplikasi oKanji telah memiliki fitur bagi pengguna untuk menambahkan kosakata (kotoba) ke daftar hafalan. Namun, saat ini pengguna belum dapat memperbarui status hafalan, tingkat kesulitan, atau menambahkan catatan khusus terkait kotoba tersebut. 

Tujuan dari issue ini adalah membuat endpoint `PATCH /api/user-kotoba/:kotobaId` yang memungkinkan pengguna (terautentikasi) untuk memperbarui progres hafalan (`isMemorized`, `difficulty`, `note`) dari kotoba yang sudah tersimpan pada `UserKotoba`. Logika pembaruannya akan diselaraskan dengan fitur serupa yang ada pada `UserKanji`.

## 2. Spesifikasi Teknis

- **Endpoint:** `PATCH /api/user-kotoba/:kotobaId`
- **Auth:** Membutuhkan Token (Header `Authorization: Bearer <token>`)

**Contoh Request Body (JSON):**
Semua field bersifat opsional, pengguna bisa mengirim salah satu atau lebih.
```json
{
  "isMemorized": true,
  "difficulty": 4,
  "note": "Lumayan sulit untuk dihafalkan"
}
```

**Contoh Response Success (200 OK):**
```json
{
  "data": {
    "id": "e45a2...",
    "userId": 1,
    "kotobaId": "6b7e...",
    "isMemorized": true,
    "reviewCount": 2,
    "difficulty": 4,
    "note": "Lumayan sulit untuk dihafalkan",
    "lastReviewed": "2026-04-28T10:00:00.000Z",
    "memorizedAt": "2026-04-28T10:00:00.000Z",
    "createdAt": "2026-04-27T09:00:00.000Z",
    "updatedAt": "2026-04-28T10:00:00.000Z"
  }
}
```

**Contoh Response Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Contoh Response Error (404 Not Found - Data Tidak Ada):**
```json
{
  "error": "Data Progress Kotoba Tidak Ditemukan"
}
```

**Contoh Response Error (400 Bad Request - Validasi Gagal):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "difficulty",
      "message": "Tingkat kesulitan harus berupa angka"
    }
  ]
}
```

## 3. Step-by-step Implementasi per File

1. **`backend/src/validation/user-kotoba-validation.js`**
   - Tambahkan skema validasi baru `updateUserKotobaValidation`.
   - Skema ini harus mendefinisikan objek yang memvalidasi parameter `kotobaId` (string/UUID) dan field body opsional seperti `isMemorized` (boolean), `difficulty` (number), dan `note` (string). Pastikan pesan error ditulis dalam Bahasa Indonesia.

2. **`backend/src/services/user-kotoba-service.js`**
   - Buat fungsi `update(user, request)` yang di-export.
   - Parse data `request` (yang isinya gabungan `kotobaId` dan body request) menggunakan `updateUserKotobaValidation`.
   - Lakukan query ke database `prisma.userKotoba.findUnique` menggunakan kondisi `userId_kotobaId`.
   - Jika data tidak ditemukan, lempar error: `throw new ResponseError(404, "Data Progress Kotoba Tidak Ditemukan")`.
   - Atur logika pembaruan tanggal (`memorizedAt` dan `lastReviewed`) mirip dengan fitur kanji:
     - Jika `isMemorized` menjadi `true` dan sebelumnya `false`, maka `memorizedAt` diisi dengan waktu sekarang (`new Date()`).
     - Jika `isMemorized` diubah menjadi `false`, set `memorizedAt` menjadi `null`.
     - Naikkan `reviewCount` (`{ increment: 1 }`).
   - Lakukan update data di database menggunakan `prisma.userKotoba.update` dengan data yang sudah di-merge, lalu return hasilnya.

3. **`backend/src/controller/user-kotoba-controller.js`**
   - Buat fungsi async `update(req, res, next)`.
   - Siapkan objek parameter dan request body untuk dilempar ke service, contoh: `const request = { kotobaId: req.params.kotobaId, ...req.body }`.
   - Panggil fungsi `userKotobaService.update(req.user, request)`.
   - Kembalikan response json `{ data: result }` dengan status HTTP 200 OK.
   - Panggil `next(e)` apabila di dalam blok `catch` terjadi error (agar ditangkap di error middleware).

4. **`backend/src/routes/api.js`**
   - Import `userKotobaController` apabila belum ada.
   - Daftarkan endpoint untuk update ini: `apiRouter.patch("/api/user-kotoba/:kotobaId", userKotobaController.update);`.

5. **`backend/tests/user-kotoba-test.js`**
   - Tambahkan suite test khusus untuk mendeskripsikan blok uji coba endpoint `PATCH /api/user-kotoba/:kotobaId`.
   - Buat skenario pengujian (Positive Test):
     - Memperbarui progres (misal: mengganti `isMemorized` dari false ke true, atau menambah `note` / `difficulty`) dan pastikan HTTP `200 OK`.
   - Buat skenario pengujian (Negative Test):
     - Memperbarui data tanpa Token (pastikan mengembalikan HTTP `401 Unauthorized`).
     - Memperbarui data progress yang bukan miliknya atau `kotobaId` ngawur (pastikan HTTP `404 Not Found`).
     - Memperbarui data menggunakan format body yang invalid (contoh `difficulty` diset ke tipe `string`, pastikan HTTP `400 Bad Request`).

## 4. Acceptance Criteria

- [ ] Endpoint `PATCH /api/user-kotoba/:kotobaId` telah ditambahkan dan diproteksi oleh middleware autentikasi.
- [ ] Validasi Request (Parameter dan Body) menggunakan Zod telah diimplementasikan dengan pesan error berbahasa Indonesia.
- [ ] Logic pembaruan `memorizedAt`, `lastReviewed`, dan increment `reviewCount` berjalan sesuai ekspektasi.
- [ ] Error status 404 dikembalikan ketika user mencoba untuk meng-update `user_kotoba` untuk kotoba yang belum pernah mereka tambahkan (belum ada row datanya).
- [ ] Tidak mengubah file di luar cakupan pembuatan fitur ini.
- [ ] Tidak menambahkan atau menginstal library (dependency) baru.
- [ ] Semua unit test pada endpoint update ini (positive dan negative cases) berhasil lolos/passed.
