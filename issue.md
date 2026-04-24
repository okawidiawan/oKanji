# Feature: Implementasi API POST Kotoba (Single & Batch)

## 1. Background & Tujuan
Saat ini, proyek oKanji membutuhkan fitur untuk menambahkan data *kotoba* (kosakata) ke dalam database dan menghubungkannya dengan *kanji* tertentu. Sesuai dengan spesifikasi pada `CONTEXT.md`, kotoba bertindak sebagai *sub-resource* dari kanji, sehingga penambahannya perlu memuat relasi ke kanji terkait (`kanjiIds`). Endpoint ini ditujukan untuk memfasilitasi input data kotoba secara manual, baik dalam format tunggal (*single*) maupun masal (*batch*), untuk mempercepat dan mempermudah proses pengisian data kosakata ke dalam aplikasi.

## 2. Spesifikasi Teknis
- **Endpoint**: `POST /api/kotoba`
- **Authentication**: Diperlukan (`Authorization: Bearer <token>`)
- **Logic**: 
  - Menerima input berupa satu objek kotoba (*single*) atau sebuah *array* berisi beberapa objek kotoba (*batch*).
  - Menyimpan data kotoba ke dalam database (tabel `Kotoba`).
  - Membuat relasi (junction) antara kotoba yang ditambahkan dengan kanji yang dikirimkan pada `kanjiIds` (tabel `KanjiKotoba`).
  - Endpoint ini harus terhubung dengan `authMiddleware` dan menggunakan validasi Zod berbahasa Indonesia.

### Contoh Request Body
**Single Input**:
```json
{
  "word": "食べる",
  "reading": "たべる",
  "meaning": "makan",
  "jlptLevel": "N5",
  "kanjiIds": ["kanji-uuid-食"]
}
```

**Batch Input**:
```json
[
  { 
    "word": "食べる", 
    "reading": "たべる", 
    "meaning": "makan", 
    "jlptLevel": "N5",
    "kanjiIds": ["kanji-uuid-食"] 
  },
  { 
    "word": "食事", 
    "reading": "しょくじ", 
    "meaning": "makan (formal)", 
    "jlptLevel": "N5",
    "kanjiIds": ["kanji-uuid-食"] 
  }
]
```

### Contoh Response Success
**Single Input**:
```json
{
  "data": {
    "id": "uuid-kotoba-baru",
    "word": "食べる",
    "reading": "たべる",
    "meaning": "makan",
    "jlptLevel": "N5",
    "kanjiIds": ["kanji-uuid-食"]
  }
}
```

**Batch Input**:
```json
{
  "data": {
    "count": 2
  }
}
```

### Contoh Response Error
**Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```
**Validation Error** (Contoh):
```json
{
  "error": "Word tidak boleh kosong"
}
```

## 3. Step-by-Step Implementasi Per File

1. **`backend/src/validation/kotoba-validation.js`**:
   - Buat file Zod validation untuk data kotoba (`createKotobaValidation`).
   - Sediakan skema untuk `word`, `reading`, `meaning` (string wajib), `jlptLevel` (string opsional), dan `kanjiIds` (array string yang berisi UUID dari kanji).
   - Pastikan *error message* menggunakan Bahasa Indonesia sesuai `CONTEXT.md`.
   - Buat juga skema untuk batch validation: `z.array(createKotobaValidation)`.

2. **`backend/src/services/kotoba-service.js`**:
   - Buat fungsi `create(request)` yang membedakan apakah input berupa array (batch) atau objek tunggal (single).
   - Lakukan validasi input menggunakan `kotoba-validation.js`.
   - Jika *batch*, gunakan iterasi atau `Prisma.transaction` untuk membuat kumpulan data kotoba dan menyambungkannya ke `kanjiIds` via junction `KanjiKotoba`. Return jumlah yang berhasil dibuat (`count`).
   - Jika *single*, langsung jalankan `prisma.kotoba.create` beserta relasi `kanjiIds`. Return format data kotoba tunggal yang berhasil dibuat.

3. **`backend/src/controller/kotoba-controller.js`**:
   - Buat `create` method.
   - Panggil `kotobaService.create(req.body)`.
   - Format response sesuai dengan bentuk hasil service (mengembalikan objek `{ data: { ... } }` jika single, atau `{ data: { count: X } }` jika batch).
   - Panggil `next(e)` menggunakan standard `error-middleware.js` apabila terjadi error.

4. **`backend/src/routes/api.js`**:
   - Daftarkan endpoint `POST /api/kotoba`.
   - Endpoint harus diletakkan pada rute yang menggunakan auth (di dalam `apiRouter` yang mengimplementasikan `authMiddleware`).
   - Arahkan ke `kotobaController.create`.

5. **`backend/tests/kotoba-test.js`**:
   - Tulis unit test untuk skenario *single input success*.
   - Tulis unit test untuk skenario *batch input success*.
   - Tulis unit test untuk validasi yang salah (memastikan validation error Zod berbahasa Indonesia).
   - Tulis unit test saat request tanpa token otorisasi (mengembalikan Unauthorized error).
   - Jalankan test `bun test` untuk memastikan semua fungsi berjalan lancar.

6. **`CONTEXT.md`**:
   - Perbarui bagian *Authorized API* (opsional setelah selesai implementasi) dari `[ ] POST /api/kotoba` menjadi `[x] POST /api/kotoba`.

## 4. Acceptance Criteria
- [ ] Endpoint `POST /api/kotoba` dapat menerima payload berbentuk objek (*single*) maupun array dari objek (*batch*).
- [ ] Request memvalidasi input menggunakan Zod dan mengembalikan pesan error menggunakan Bahasa Indonesia apabila input tak valid.
- [ ] Endpoint mereturn HTTP 200 dan data kotoba yang baru dibuat (beserta data `kanjiIds`) apabila input *single* berhasil.
- [ ] Endpoint mereturn HTTP 200 dan `count` apabila input *batch* berhasil.
- [ ] Endpoint mengembalikan HTTP 401 dan response `{ "error": "Unauthorized" }` jika request dilakukan tanpa token otorisasi yang valid.
- [ ] Tersimpannya relasi antara kotoba dengan kanji terkait yang berhasil disimpan di *junction table* (`KanjiKotoba`).
- [ ] Telah dibuat unit test komprehensif di dalam `kotoba-test.js` yang melingkupi skenario single, batch, validasi error, dan unauthorized request.
- [ ] Menjalankan *test runner* (`bun test`) menunjukkan semua pengujian terkait API ini telah dinyatakan sukses/passed.
