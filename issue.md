# Feature: Implementasi API POST User Kotoba Progress

## 1. Background & tujuan

Fitur ini bertujuan untuk memungkinkan pengguna menambahkan kosakata (kotoba) ke dalam daftar hafalan (progress) mereka. Hal ini akan mencatat bahwa pengguna mulai mereview atau mempelajari kosakata tersebut ke dalam progres pribadi mereka, memisahkannya dari list kosakata global yang ada, serta mendukung mekanisme isolasi data di mana pengguna hanya dapat memodifikasi progres milik mereka sendiri.

## 2. Spesifikasi teknis

- **Endpoint**: `POST /api/user-kotoba/:kotobaId`
- **Auth**: Membutuhkan `Authorization: Bearer <token>`
- **Logic**: Menggunakan operasi `upsert`. Jika progres kotoba belum ada untuk user tersebut, maka sistem akan membuat progres baru (status `isMemorized: false`). Jika sudah ada, sistem hanya akan memperbarui nilai `lastReviewed` dan menambah `reviewCount`. Kotoba yang ditambahkan dibatasi pada ID kotoba yang valid.
- **Request URL Parameters**:
  - `kotobaId` (String, UUID)
- **Contoh Response Success (200 OK)**:

```json
{
  "data": {
    "id": "uuid-string",
    "userId": 1,
    "kotobaId": "uuid-string",
    "isMemorized": false,
    "reviewCount": 1,
    "difficulty": null,
    "note": null,
    "lastReviewed": "2026-04-27T16:05:30.000Z",
    "memorizedAt": null,
    "createdAt": "2026-04-27T16:05:30.000Z",
    "updatedAt": "2026-04-27T16:05:30.000Z"
  }
}
```

- **Contoh Response Error (404 Not Found)**:

```json
{
  "error": "Kotoba tidak ditemukan"
}
```

- **Contoh Response Error (400 Bad Request)**:

```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "",
      "message": "Format ID Kotoba tidak valid"
    }
  ]
}
```

## 3. Step-by-step implementasi per file

1. **`backend/src/validation/user-kotoba-validation.js`**
   - Buat file baru untuk skema validasi Zod.
   - Buat skema `getUserKotobaValidation` yang memvalidasi `kotobaId`: string `.uuid()`
   - Kustomisasi pesan error ke dalam Bahasa Indonesia.

2. **`backend/src/services/user-kotoba-service.js`**
   - Buat layer logika bisnis dengan export function `add(user, request)`.
   - Lakukan validasi request terhadap input dari controller.
   - Pengecekan database: Hitung jumlah data pada tabel `Kotoba` dengan ID yang diberikan. Jika tidak ada, `throw new ResponseError(404, "Kotoba tidak ditemukan")`.
   - Lakukan pemanggilan `prisma.userKotoba.upsert` menggunakan klausa `where` unik: `userId_kotobaId: { userId: user.id, kotobaId }`.
   - Jika `update`: Naikkan `reviewCount` dan tetapkan `lastReviewed` ke waktu saat ini.
   - Jika `create`: Buat record baru dengan nilai `isMemorized: false`, `reviewCount: 1`, dan `lastReviewed` saat ini (biarkan `difficulty` dan `note` bernilai null).

3. **`backend/src/controller/user-kotoba-controller.js`**
   - Buat controller untuk memfasilitasi endpoint `add(req, res, next)`.
   - Ekstrak parameter `kotobaId` dari `req.params`, lalu teruskan ke fungsi `userKotobaService.add(req.user, req.params.kotobaId)`.
   - Tuliskan response dengan format `{ data: ... }` dengan membalut di dalam blok `try...catch(e) { next(e); }`.

4. **`backend/src/routes/api.js`**
   - Import `userKotobaController`.
   - Daftarkan endpoint `apiRouter.post('/user-kotoba/:kotobaId', userKotobaController.add)`.

5. **`backend/tests/user-kotoba-test.js`**
   - Buat test setup (database clean-up utility mock/functions).
   - Tulis test cases:
     - Sukses menambah user-kotoba yang belum ada.
     - Sukses mengupdate progres (reviewCount) jika dipanggil kembali (upsert update).
     - Menolak akses bila user tidak menyertakan token yang sah (Unauthorized 401).
     - Mengembalikan 400 Bad Request jika format ID bukan UUID.
     - Mengembalikan 404 Not Found bila kotobaId tidak eksis di master data Kotoba.

## 4. Acceptance criteria

- [ ] Fungsi validasi pada Zod bekerja sesuai dengan spesifikasi dan melempar pesan berbahasa Indonesia jika melanggar ketentuan tipe atau parameter UUID.
- [ ] Logika `upsert` pada `user-kotoba-service.js` bekerja dengan baik untuk menambah baru (`create`) maupun menghitung ulang review (`update`).
- [ ] Endpoint `POST /api/user-kotoba/:kotobaId` terekspos dan diproteksi oleh middleware auth, merespon berhasil sesuai skema respons yang ditentukan.
- [ ] User tidak dapat mengisikan `kotobaId` dari kotoba yang tidak terdaftar di database (mengembalikan respons 404).
- [ ] Record database menggunakan relasi dari `req.user.id` untuk memastikan isolasi data hanya pada user terkait.
- [ ] Seluruh unit test dalam file `user-kotoba-test.js` harus _passed_ jika dieksekusi dengan `bun run test`.
