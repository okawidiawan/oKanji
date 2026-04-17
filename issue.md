# Perencanaan Implementasi Fitur: Pengambilan Data Kanji

## 1. Background & Tujuan
Saat ini aplikasi membutuhkan endpoint untuk menampilkan daftar kanji kepada pengguna secara umum yang tersimpan di database. Fitur ini dirancang khusus agar mendukung paginasi (page dan limit) dan filtrasi berbasis level (JLPT) untuk memastikan performa tetap optimal dan pengiriman data menjadi efisien. Sesuai arsitektur sistem, akses pada endpoint ini tetap dibatasi menggunakan sistem otorisasi token di header.

## 2. Spesifikasi Teknis
- **Endpoint HTTP:** `GET /api/kanjis`
- **Query Parameter (opsional):**
  - `level`: (string) Filter berdasarkan tingkat JLPT kanji, contoh: `N5`.
  - `page`: (number) Halaman aktif saat ini, contoh: `1` (default).
  - `limit`: (number) Batas kembalian jumlah data setiap halamannya, contoh: `20` (default).
- **Request Headers:**
  - `Authorization`: `Bearer <token>` (Divalidasi via `auth-middleware.js`).
- **Response Success (200 OK):**
  *(Catatan: Spesifikasi meminta format `"data": "OK"`, pada implementasinya bisa berupa pengembalian format JSON yang mengelola struktur standar).*
  ```json
  {
    "data": "OK",
    "paging": {
      "page": 1,
      "total_item": 150,
      "total_page": 8
    }
  }
  ```
- **Response Error (401 Unauthorized):**
  ```json
  {
    "errors": "Unauthorized"
  }
  ```

## 3. Step-by-step Implementasi Per File

Ikuti langkah-langkah presisi di bawah ini dan perhatikan konvensi *ES Modules (`import / export`)* serta blok *`try-catch`* memanggil `next(e)` yang berada di ekosistem sebelumnya terkhusus logika `Prisma` dan `Zod`.

**1. `src/validation/kanji-validation.js`**
- Buat file baru jika belum ada.
- Gunakan dan import paket `zod`.
- Buat variabel *schema* konvensi nama `getKanjiValidation`.
- Definisikan tipe input dan validasi keamanan dengan aturan berikut:
  - `level`: string opsional (opsional dikosongkan).
  - `page`: dikonversikan ke angka (number). Nilai tidak boleh negatif, nol, atau bukan angka (`NaN`). Titik minimal adalah `1` dengan nilai default `1`.
  - `limit`: dikonversikan ke angka (number). Nilai tidak boleh negatif, nol, atau `NaN`. Tetapkan maksimal batas *limit* (misal max `100`) agar *user* tidak dapat me-request semua data kanji sekaligus yang dapat menguras resource server. Nilai default `20`.
- Export `getKanjiValidation`.

**2. `src/services/kanji-service.js`**
- Buat file baru.
- _Import_ `prisma` dari koneksi utama `../application/database.js` serta validation object dari `kanji-validation.js`.
- Buat fungsi utama `const list = async (request) => { ... }`.
- Lakukan fungsi parse dengan `getKanjiValidation.parse(request)`.
- Siapkan variabel obj `filters = {}`. Jika request memiliki data `level`, jadikan property pada *where clause* menjadi: `{ level: request.level }`.
- Mulai kalkulasi limit paginasi dengan rumus: `const skip = (validatedReq.page - 1) * validatedReq.limit`.
- Gunakan konstruksi `Promise.all([ ... ])` untuk mengambil `prisma.kanji.findMany()` dengan param (*take, skip, where*) sekaligus mengambil total dokumen kanji yang tersisa dengan `prisma.kanji.count({ where: filters })`. Hal ini identik dengan konvensi pada `user-kanji-service.js`.
- Susun balikan data (return object) berisikan objek `data` dan objek meta `paging`.
- _Export_ fungsi `list`.

**3. `src/controller/kanji-controller.js`**
- Buat file baru.
- _Import_ `kanjiService` dari `kanji-service.js`.
- Buat variabel fungsi `const list = async (req, res, next) => { ... }`.
- Di dalam blok `try`, ambil/siapkan objek `request` yang isinya property `level`, `page`, dan `limit` yang dioper dari `req.query`.
- Panggil asynchronous func `await kanjiService.list(request)`.
- Jika sukses, kirim response `res.status(200).json(...)`. Sesuai spesifikasi, isi properti json-nya seperti konvensi response sistem.
- Di dalam blok `catch (e)`, cukup jalankan `next(e)` agar terlempar ke `error-middleware`.
- _Export_ fungsi `list`.

**4. `src/routes/kanji-route.js`**
- Buat file baru.
- _Import_ `express` router, import konvensi `authMiddleware` dari `../middleware/auth-middleware.js`, dan controllers.
- Buat router instance `const kanjiRouter = express.Router()`.
- Daftarkan secara global router ini menggunakan token: `kanjiRouter.use(authMiddleware)`.
- Definisikan _endpoint_: `kanjiRouter.get('/api/kanjis', kanjiController.list)`.
- Lakukan _export_ instance routernya.

**5. `src/application/web.js`**
- Buka entrypoint router backend ini.
- Tambahkan baris impor _`kanjiRouter`_ untuk di-ekspos ke `app`/`web`.
- Daftarkan `web.use(kanjiRouter)` di bawah definisi *router middlewares* yang sejenis.

## 4. Acceptance Criteria
- [ ] File `issue.md` ini dipahami seluruh skop pekerjaannya dan limitasinya tanpa mengubah struktur selain yang diinstruksikan.
- [ ] Endpoint `GET /api/kanjis?page=1&limit=20` sukses berjalan saat validasi Bearer Token lolos di tahap header.
- [ ] Pengaksesan tanpa token atau kredensial yang tidak sah tetap ditolak murni (berstatus `401`) hanya oleh `auth-middleware.js` dan bukan diverifikasi manual oleh domain controller kanji.
- [ ] Filter `level` untuk N5, N4, dst. berhasil menyusutkan list objek array hasil pengembalian database yang relevan.
- [ ] Validasi schema Zod berhasil memblokir secara agresif manipulasi *query parameter* `page` / `limit` agar tidak lolos dengan nilai negatif atau `NaN`.
- [ ] Berlaku batasan *limit* fetching data maksimum (ex: 100 entitas) agar terhindar dari *mass/dumping* pengambilan dari database.
- [ ] Format kode sudah menggunakan Common Module ECMAScript (`import/export`) yang konsisten dengan basis kodenya.
- [ ] Tidak ada instalasi dependensi luar atau modul baru.
