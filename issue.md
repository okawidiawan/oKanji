# Feature: Implementasi API Update Kotoba

## 1. Background & Tujuan

Saat ini aplikasi sudah memiliki endpoint untuk menambahkan data kosakata baru (`POST /api/kotoba`), namun pengguna belum dapat memodifikasi atau memperbaiki data tersebut apabila terjadi kesalahan input atau jika data perlu diperbarui. Oleh karena itu, diperlukan endpoint baru `PATCH /api/kotoba/:kotobaId` untuk memperbarui detail informasi data kotoba secara persial atau keseluruhan (seperti `word`, `reading`, `meaning`, dan `jlptLevel`).

## 2. Spesifikasi Teknis

- **Endpoint**: `PATCH /api/kotoba/:kotobaId`
- **Auth**: Membutuhkan token (`Authorization: Bearer <token>`)
- **Logic**: Memodifikasi atau mengubah satu kotoba yang sudah diinput berdasarkan `kotobaId` yang dikirimkan lewat params.

**Contoh Request Body (Opsional untuk setiap field):**

```json
{
  "word": "食べる",
  "reading": "たべる",
  "meaning": "Eat",
  "jlptLevel": "N5"
}
```

**Contoh Response Success (200 OK):**

```json
{
  "data": {
    "word": "食べる",
    "reading": "たべる",
    "meaning": "Eat",
    "jlptLevel": "N5"
  }
}
```

**Contoh Response Error - Unauthorized (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

**Contoh Response Error - Not Found (404 Not Found):**

```json
{
  "error": "Kotoba tidak Ditemukan"
}
```

**Contoh Response Error - Validation (400 Bad Request):**

```json
{
  "error": "..." // Pesan error validasi Zod berbahasa Indonesia
}
```

## 3. Step-by-step Implementasi per File

1. **`backend/src/validation/kotoba-validation.js`**
   - Buat skema validasi Zod bernama `updateKotobaValidation`.
   - Skema ini harus mendefinisikan properti opsional untuk `word`, `reading`, `meaning`, dan `jlptLevel`. Berikan pesan error dengan Bahasa Indonesia untuk setiap properti jika tidak sesuai aturan.
   - Buat/gunakan skema untuk memvalidasi parameter `kotobaId` yang dikirim.

2. **`backend/src/services/kotoba-service.js`**
   - Tambahkan method `update(user, kotobaId, request)`.
   - Validasi `kotobaId` dan input `request` dengan skema dari validation yang telah dibuat.
   - Lakukan pemeriksaan database via Prisma untuk memastikan kotoba yang ingin diubah benar-benar ada (`findUnique`). Jika tidak ditemukan, lemparkan error menggunakan `new ResponseError(404, "Kotoba tidak Ditemukan")`.
   - Jalankan `prisma.kotoba.update` untuk memperbarui data kotoba sesuai data yang lolos validasi.
   - Kembalikan response berupa data kotoba yang telah terupdate.

3. **`backend/src/controller/kotoba-controller.js`**
   - Buat method controller `update(req, res, next)`.
   - Tangkap informasi user dari middleware auth (`req.user`), kemudian ekstrak parameter (`req.params.kotobaId`), dan ekstrak payload dari request body (`req.body`).
   - Panggil `kotobaService.update(req.user, kotobaId, request)`.
   - Buat balasan respons HTTP status `200` dengan format standar `{ data: result }`.
   - Bungkus semua proses di dalam `try...catch` dan pastikan jika terjadi error akan dilempar ke fungsi `next(e)` untuk ditangani error handler terpusat.

4. **`backend/src/routes/api.js`**
   - Daftarkan endpoint routing baru: `apiRouter.patch('/api/kotoba/:kotobaId', kotobaController.update)`.
   - (Router ini otomatis akan terlindungi oleh `authMiddleware` karena berada pada domain router API).

5. **`backend/tests/kotoba-test.js`**
   - Buat unit testing baru untuk endpoint `PATCH /api/kotoba/:kotobaId`.
   - Tambahkan _test case_ skenario sukses dimana data diupdate dengan benar (semua / sebagian field terisi).
   - Tambahkan _test case_ skenario error:
     - ID kotoba salah atau tidak ditemukan (memastikan status 404).
     - Payload yang dikirim salah atau tidak lolos validasi format (memastikan status 400).
     - Token tidak diikutsertakan atau tidak valid (memastikan status 401).

## 4. Acceptance Criteria

- [ ] Fungsi validasi pada Zod ditambahkan, pesan peringatan yang diberikan menggunakan Bahasa Indonesia yang mudah dimengerti.
- [ ] Database data kotoba berhasil dimodifikasi lewat layer Service dan ditangani dengan exception yang sesuai bila tidak ada data.
- [ ] Pemanggilan API Endpoint `PATCH /api/kotoba/:kotobaId` berfungsi dan mematuhi spesifikasi response yang diberikan.
- [ ] Endpoint merespons dengan standarisasi object `{ data: ... }` saat suskes, dan `{ error: ... }` saat gagal, selaras dengan `CONTEXT.md`.
- [ ] Unit testing komprehensif selesai ditulis, dijalankan (`bun test`), dan terjamin 100% lulus / pass untuk endpoint PATCH tersebut.
- [ ] Modifikasi dilarang mengubah hal lain diluar konteks update Kotoba.
- [ ] Tidak ada dependency / library baru yang ditambahkan.
