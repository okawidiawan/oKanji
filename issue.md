# Feature: Implementasi API Get Kanji Detail

## 1. Background & Tujuan

Menambahkan fungsionalitas untuk mengambil detail data spesifik dari sebuah Kanji berdasarkan `kanjiId`. Endpoint ini juga akan mengembalikan relasi data Kotoba (kosakata) yang terkait dengan kanji tersebut. Hal ini sejalan dengan dokumentasi arsitektur di mana Kotoba ditampilkan sebagai sub-resource dari Kanji.

## 2. Spesifikasi Teknis

- **Endpoint**: `GET /api/kanjis/:kanjiId`
- **Auth**: Membutuhkan Token (`Authorization: Bearer <token>`)
- **Method**: `GET`
- **Request Parameter**:
  - `kanjiId` (string, UUID)

- **Response Success (200 OK)**:

```json
{
  "data": {
    "id": "uuid-kanji-123",
    "character": "食",
    "jlptLevel": "N5",
    "onyomi": "ショク",
    "kunyomi": "た.べる",
    "meaning": "makan",
    "strokeCount": 9,
    "radical": "食",
    "kotoba": [
      {
        "id": "uuid-kotoba-456",
        "word": "食べる",
        "reading": "たべる",
        "meaning": "makan",
        "jlptLevel": "N5"
      }
    ]
  }
}
```

- **Response Error (401 Unauthorized)**:

```json
{
  "error": "Unauthorized"
}
```

- **Response Error (404 Not Found)**:

```json
{
  "error": "Kanji tidak ditemukan"
}
```

## 3. Step-by-step Implementasi

1. **`backend/src/validation/kanji-validation.js`**
   - Tambahkan skema validasi baru `getKanjiValidation` menggunakan Zod untuk memvalidasi parameter `kanjiId` (pastikan input tidak kosong dan bertipe string).

2. **`backend/src/services/kanji-service.js`**
   - Buat fungsi `get(kanjiId)` untuk menangani logika pengambilan data.
   - Lakukan validasi `kanjiId` menggunakan `getKanjiValidation`.
   - Gunakan Prisma client untuk mencari kanji di database:
     - Gunakan `prisma.kanji.findUnique`.
     - Lakukan `include` untuk relasi `kanjiKotoba`, dan di dalamnya sertakan (`include`) entitas `kotoba`.
   - Jika kanji tidak ditemukan, lempar error `ResponseError(404, "Kanji tidak ditemukan")`.
   - Format response agar struktur object mengembalikan array `kotoba` secara langsung (ekstrak dari `kanjiKotoba` junction table) sebelum dikembalikan ke controller.

3. **`backend/src/controller/kanji-controller.js`**
   - Tambahkan method `get(req, res, next)` yang akan menangkap `kanjiId` dari `req.params`.
   - Panggil `kanjiService.get(kanjiId)`.
   - Kirimkan balikan JSON success dalam properti `data`.
   - Tangkap exception dengan `catch (e)` dan teruskan ke middleware error melalui `next(e)`.

4. **`backend/src/routes/api.js`**
   - Daftarkan route baru `apiRouter.get('/api/kanjis/:kanjiId', kanjiController.get)`.
   - Pastikan route berada di file router yang terproteksi (menggunakan auth middleware).

5. **`backend/tests/kanji-test.js`**
   - Tambahkan test block `describe('GET /api/kanjis/:kanjiId', () => { ... })`.
   - Buat test case untuk skenario **sukses** (mengembalikan 200 OK dengan format json data kanji dan relasi kotoba).
   - Buat test case untuk skenario **gagal: unauthorized** (401 Unauthorized jika tanpa token).
   - Buat test case untuk skenario **gagal: not found** (404 Not Found jika kanjiId tidak eksis di database).

## 4. Acceptance Criteria

- [ ] Endpoint `GET /api/kanjis/:kanjiId` berhasil dibuat dan dapat diakses.
- [ ] Request ke endpoint tersebut membutuhkan token authentikasi.
- [ ] Response sukses harus mencakup detail kanji beserta _array_ `kotoba` yang terkait.
- [ ] Struktur data response sesuai dengan spesifikasi.
- [ ] Zod validation digunakan untuk memvalidasi `kanjiId`.
- [ ] Error handler standar (seperti NotFound dan Unauthorized) berfungsi dengan baik dan melempar `ResponseError`.
- [ ] Relasi _many-to-many_ antara Kanji dan Kotoba (melalui junction `kanjiKotoba`) telah ditransformasi menjadi format response yang bersih (mengeluarkan object `kotoba` dari _junction table_).
- [ ] Seluruh unit test terkait endpoint ini berjalan mulus dan lulus (Coverage mencakup success, unauthorized, dan not found).
- [ ] Tidak ada dependency baru yang ditambahkan dan tidak ada file di luar ruang lingkup (scope) fitur yang berubah.
