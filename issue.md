# Feature: Implementasi API Delete Kotoba

## 1. Background & Tujuan
Saat ini aplikasi sudah memiliki endpoint untuk menambahkan (POST) dan memperbarui (PATCH) data kosakata (kotoba). Namun, belum ada endpoint untuk menghapus data kotoba apabila terdapat kesalahan input atau data tersebut sudah tidak relevan. Fitur ini bertujuan untuk melengkapi fitur pengelolaan (CRUD) kotoba dengan menambahkan fungsionalitas penghapusan data berdasarkan ID kotoba yang diberikan.

## 2. Spesifikasi Teknis
- **Endpoint**: `DELETE /api/kotoba/:kotobaId`
- **Auth**: Perlu token (`Authorization: Bearer <token>`)
- **Logic**: Menghapus satu data kotoba berdasarkan parameter `kotobaId` yang dikirim melalui URL. Apabila kotoba dihapus, semua relasi kotoba tersebut dengan kanji (`kanji_kotoba`) juga akan otomatis terhapus karena aturan Cascade di level database.

### Format Response
- **Response Success (200 OK)**:
```json
{
  "data": "OK"
}
```

- **Response Error (404 Not Found)** - Jika kotoba tidak ditemukan:
```json
{
  "error": "Kotoba tidak ditemukan"
}
```

- **Response Error (401 Unauthorized)** - Jika tidak ada token atau token tidak valid:
```json
{
  "error": "Unauthorized"
}
```

## 3. Step-by-step Implementasi Per File

**1. `backend/src/services/kotoba-service.js`**
- Import atau pastikan `getKotobaValidation` dari file validasi sudah digunakan.
- Buat fungsi `remove` dengan parameter `kotobaId`.
- Lakukan validasi `kotobaId` menggunakan `getKotobaValidation.parse(kotobaId)`.
- Cek keberadaan data kotoba di tabel `kotoba` menggunakan `prisma.kotoba.findUnique`.
- Jika data tidak ada, lempar error dengan `throw new ResponseError(404, "Kotoba tidak Ditemukan")`.
- Jika ada, lakukan penghapusan menggunakan `prisma.kotoba.delete` berdasarkan `id`.
- Kembalikan string `"OK"`.
- Tambahkan ekspor untuk fungsi `remove`.

**2. `backend/src/controller/kotoba-controller.js`**
- Buat fungsi `remove` yang menerima parameter `req`, `res`, dan `next`.
- Ambil nilai `kotobaId` dari `req.params.kotobaId`.
- Panggil `kotobaService.remove(kotobaId)` di dalam blok `try`.
- Kembalikan response JSON dengan HTTP status `200` berisi `{ data: result }` atau `{ data: "OK" }`.
- Tangkap error di blok `catch (e)` dan teruskan ke middleware penanganan error dengan `next(e)`.
- Tambahkan ekspor untuk fungsi `remove`.

**3. `backend/src/routes/api.js`**
- Tambahkan rute baru di bagian API Kotoba: `apiRouter.delete('/api/kotoba/:kotobaId', kotobaController.remove);`

**4. `backend/tests/kotoba-test.js`**
- Tambahkan unit test baru untuk skenario hapus (delete) kotoba:
  - Skenario berhasil (`should can delete kotoba`).
  - Skenario gagal karena format `kotobaId` tidak valid/bukan UUID (`should reject delete kotoba if id is invalid`).
  - Skenario gagal karena kotoba tidak ditemukan (`should reject delete kotoba if kotoba is not found`).
  - Skenario gagal karena tidak memiliki token atau token tidak valid (`should reject delete kotoba if token is invalid/unauthorized`).

## 4. Acceptance Criteria
- [ ] Endpoint `DELETE /api/kotoba/:kotobaId` berhasil dibuat dan dapat diakses dengan auth token.
- [ ] Validasi `kotobaId` (format UUID) sudah diimplementasikan dengan benar.
- [ ] Data kotoba dan seluruh data relasinya (`kanji_kotoba`) berhasil terhapus dari database secara cascade jika ID sesuai.
- [ ] Mengembalikan pesan error `404` yang sesuai jika data kotoba tidak ada di database.
- [ ] Response sukses mengikuti format standar proyek: `{ "data": "OK" }`.
- [ ] Seluruh unit test baru untuk fitur hapus ini berjalan dengan lancar tanpa ada test yang gagal.
