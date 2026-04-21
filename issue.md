# Refactor: Simpan Progress User Kanji Tanpa Request Body

## 1. Background & Alasan Refaktor
Saat ini, proses penyimpanan progres hafalan kanji (`user-kanji`) menggunakan dua endpoint: `POST /api/user-kanji` (body-based) dan `PUT /api/user-kanji/:kanjiId` (path-based). Penggunaan `PUT` dengan request body dianggap kurang efisien untuk skenario "Quick Add" di mana pengguna hanya perlu memilih kanji untuk menandainya sebagai "sudah dihafal".

Refaktor ini bertujuan untuk menyederhanakan interaksi API dengan menghapus kebutuhan request body dan memindahkan metode simpan progres ke `POST /api/user-kanji/:kanjiId`. Status `isMemorized` akan di-hardcode menjadi `true` pada saat penyimpanan karena asumsi utama pemanggilan endpoint ini adalah untuk menandai progres berhasil dihafalkan.

## 2. Perubahan Yang Diperlukan (Before vs After)

### A. `backend/src/routes/api.js`
- **Before**: 
  ```javascript
  apiRouter.post('/api/user-kanji', userKanjiController.upsert);
  apiRouter.put('/api/user-kanji/:kanjiId', userKanjiController.upsert);
  ```
- **After**:
  ```javascript
  apiRouter.post('/api/user-kanji/:kanjiId', userKanjiController.upsert);
  // (Menghapus metode PUT dan POST lama yang berbasis body)
  ```

### B. `backend/src/controller/user-kanji-controller.js`
- **Before**: Mengambil data dari `req.body` dan menimpa `kanjiId` dari params.
- **After**: Menginisialisasi objek request meskipun `req.body` tidak ada, lalu mengambil `kanjiId` dari `req.params`.

### C. `backend/src/services/user-kanji-service.js`
- **Before**: Menggunakan `validatedRequest.isMemorized` dari input body (default false).
- **After**: Memaksa variabel `isMemorized` bernilai `true` saat menjalankan `upsert` ke database.

### D. `backend/src/validation/user-kanji-validation.js`
- **Before**: `kanjiId` wajib ada di skema objek body.
- **After**: Menyesuaikan skema agar tetap valid meskipun body kosong (karena `kanjiId` diinjeksi oleh controller dari URL).

## 3. Step-by-Step Implementasi

1.  **Update Validation**: Modifikasi `listUserKanjiValidation` atau buat skema baru jika perlu agar parameter body bersifat opsional.
2.  **Logic Update di Service**: Ubah `user-kanji-service.js` fungsi `upsert` untuk mengabaikan status hafalan dari luar dan selalu mensetnya ke `true`. Pastikan `difficulty` dan `note` tetap `null` jika tidak ada.
3.  **Refaktor Controller**: Sesuaikan `user-kanji-controller.js` guna menangani request tanpa body.
4.  **Update Endpoint Routing**: Ganti `apiRouter.put` menjadi `apiRouter.post` pada file `api.js`.
5.  **Pembersihan**: Hapus route `POST /api/user-kanji` yang lama jika sudah tidak digunakan.

## 4. Acceptance Criteria
- [ ] Endpoint `PUT /api/user-kanji/:kanjiId` diganti menjadi `POST /api/user-kanji/:kanjiId`.
- [ ] Request tanpa body ke `POST /api/user-kanji/:kanjiId` berhasil menyimpan data.
- [ ] Hasil simpan otomatis memiliki status `isMemorized: true`.
- [ ] Field `difficulty` dan `note` tetap `null` secara default.
- [ ] Format response data tidak berubah (konsistensi API tetap terjaga).
- [ ] Tidak ada perubahan pada file di luar scope `user-kanji`.
