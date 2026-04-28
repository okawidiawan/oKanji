# Feature: Implementasi API Hapus Progress Kotoba User

## 1. Background & Tujuan

Sesuai dengan `CONTEXT.md`, fitur ini bertujuan untuk menambahkan fungsionalitas yang memungkinkan pengguna (user) menghapus suatu kosakata (kotoba) dari daftar progres hafalannya. Hal ini berguna jika user ingin mereset atau tidak jadi memonitor progres hafalan suatu kosakata. Selain itu, ada ketentuan khusus bahwa apabila kotoba yang sudah dihapus ditambahkan kembali, status hafalan dan tanggal hafalannya (`memorizedAt`) harus benar-benar di-reset.

## 2. Spesifikasi Teknis

- **Endpoint**: `DELETE /api/user-kotoba/:kotobaId`
- **Authentication**: Memerlukan Token (Bearer)
- **Request Parameter**:
  - `kotobaId` (string, UUID): ID dari kotoba yang ingin dihapus dari progres user.
- **Response Success**:
  - Status Code: `200 OK`
  - Body:
    ```json
    {
      "data": "OK"
    }
    ```
- **Response Error**:
  - `401 Unauthorized`: Jika token tidak valid atau tidak disertakan.
  - `404 Not Found`: Jika progres kotoba tidak ditemukan untuk user tersebut.
    ```json
    {
      "error": "Data Progress Kotoba Tidak Ditemukan"
    }
    ```

## 3. Step-by-step Implementasi Per File

1. **`backend/src/services/user-kotoba-service.js`**
   - Buat fungsi baru dengan nama `remove(user, kotobaId)`.
   - Lakukan validasi `kotobaId` menggunakan `getUserKotobaValidation` yang sudah ada.
   - Cari data `UserKotoba` berdasarkan `userId` (dari `user.id`) dan `kotobaId` menggunakan `prisma.userKotoba.findUnique`.
   - Jika data tidak ditemukan, lemparkan error `ResponseError(404, "Data Progress Kotoba Tidak Ditemukan")`.
   - Lakukan operasi penghapusan menggunakan `prisma.userKotoba.delete` dengan mem-passing parameter yang tepat.
   - Kembalikan string `"OK"`.

2. **`backend/src/controller/user-kotoba-controller.js`**
   - Buat fungsi `remove(req, res, next)`.
   - Ambil `user` dari `req.user` dan `kotobaId` dari `req.params.kotobaId`.
   - Panggil `userKotobaService.remove(user, kotobaId)`.
   - Kirimkan respons JSON `{ data: "OK" }` dengan status code `200`.
   - Tangkap error dengan blok `catch (e)` dan teruskan ke `next(e)`.

3. **`backend/src/routes/api.js`**
   - Daftarkan endpoint baru pada router API:
     `apiRouter.delete('/api/user-kotoba/:kotobaId', userKotobaController.remove);`

4. **`backend/tests/user-kotoba-test.js`**
   - Tambahkan blok `describe("DELETE /api/user-kotoba/:kotobaId")` dengan beberapa kasus uji:
     - **Success**: Harus dapat menghapus progres kotoba dengan status 200 dan mengembalikan `{ data: "OK" }`. Pastikan data benar-benar terhapus di database.
     - **Reset Verification**: Lakukan simulasi penghapusan lalu tambahkan kembali (`POST`) kotoba yang sama. Verifikasi bahwa data yang ditambahkan kembali memiliki field `memorizedAt` senilai `null` dan `isMemorized` senilai `false`.
     - **Not Found Error**: Harus menolak penghapusan dengan status 404 jika `kotobaId` yang dimasukkan tidak ada dalam progres user.
     - **Unauthorized Error**: Harus gagal dengan status 401 jika request dikirim tanpa token autentikasi.
     - **Data Isolation**: Verifikasi bahwa pengguna tidak dapat menghapus progres kotoba milik pengguna lain (misal user2 menghapus progress milik user1, harus mengembalikan 404).

## 4. Acceptance Criteria

- [ ] Endpoint `DELETE /api/user-kotoba/:kotobaId` berhasil dibuat dan terproteksi oleh token.
- [ ] Validasi `kotobaId` (format UUID) di layer service berjalan dengan baik.
- [ ] Mengembalikan pesan error `404 Not Found` jika progres kotoba yang diminta tidak ada.
- [ ] Proses penghapusan benar-benar menghilangkan baris terkait pada tabel `user_kotoba`.
- [ ] Implementasi menjamin Data Isolation, di mana query penghapusan harus menggunakan `userId` pengguna yang sedang login.
- [ ] Terdapat pengujian/test case untuk memastikan bahwa penambahan kembali kotoba yang telah dihapus akan mengatur ulang `memorizedAt` menjadi null dan `isMemorized` menjadi false.
- [ ] Terdapat pengujian untuk menjamin Data Isolation agar user tidak bisa menghapus progress user lain.
- [ ] Semua endpoint terkait kotoba berhasil melewati pengujian tanpa ada error (`bun run test`).
