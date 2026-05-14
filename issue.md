# Feature: Implementasi Sort Kanji Berdasarkan Level JLPT

## Deskripsi

Menambahkan fitur pengurutan (sort) pada daftar kanji berdasarkan level JLPT. Saat ini endpoint `GET /api/kanjis` belum mendukung parameter sort, sehingga data dikembalikan dalam urutan default database. Fitur ini memungkinkan user mengurutkan kanji dari N5→N1 (ascending) atau N1→N5 (descending) melalui UI dropdown di halaman Kanji List.

## Latar Belakang

- Data kanji menggunakan paginasi (`page` & `size`), sehingga **sorting harus dilakukan di level backend/database** agar urutan konsisten di seluruh halaman.
- Field `jlptLevel` adalah `ENUM (N5, N4, N3, N2, N1)` di Prisma/MySQL. Prisma mengurutkan enum berdasarkan urutan definisi: `ASC` = N5→N1, `DESC` = N1→N5.

## Scope Perubahan

### Branch

`feature/sort-kanji-list`

---

## Backend

### 1. Update Validasi Zod

**File**: `backend/src/validation/kanji-validation.js`

Tambahkan dua field baru ke skema `getKanjiValidation`:

- `sort_by`: Field yang akan diurutkan. Untuk saat ini hanya mendukung `jlptLevel`. Gunakan `z.enum()` agar hanya menerima nilai yang valid. Berikan default `jlptLevel`.
- `sort_order`: Arah pengurutan, hanya menerima `asc` atau `desc`. Gunakan `z.enum()`. Berikan default `asc`.

**Referensi kode saat ini** (baris 6-11):

```javascript
const getKanjiValidation = z.object({
  level: z.string().regex(/^N[1-5]$/, "Level format must be N1-N5").optional(),
  search: z.string().min(1).max(50).optional(),
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  size: z.coerce.number().min(1, "Size must be at least 1").max(100, "Size must not exceed 100").default(20),
});
```

**Yang perlu ditambahkan** di dalam object `z.object({})`:

- `sort_by`: `z.enum(["jlptLevel"]).default("jlptLevel")`
- `sort_order`: `z.enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" }).default("asc")`

### 2. Update Service Layer

**File**: `backend/src/services/kanji-service.js`

Tambahkan property `orderBy` ke dalam query `prisma.kanji.findMany()` di fungsi `list`.

**Referensi kode saat ini** (baris 30-45):

```javascript
const [data, total] = await Promise.all([
  prisma.kanji.findMany({
    where: filters,
    take: validatedRequest.size,
    skip: skip,
    include: {
      userKanjis: {
        where: { userId: user.id },
        select: { isMemorized: true },
      },
    },
  }),
  prisma.kanji.count({ where: filters })
]);
```

**Yang perlu ditambahkan** di dalam `prisma.kanji.findMany({})`, setelah `skip`:

```javascript
orderBy: {
  [validatedRequest.sort_by]: validatedRequest.sort_order
},
```

**Perbarui juga dokumentasi JSDoc** di atas fungsi `list` (baris 6-8) untuk menyertakan informasi sorting.

### 3. Update Controller

**File**: `backend/src/controller/kanji-controller.js`

Tambahkan dua query parameter baru ke objek `request` di fungsi `list`.

**Referensi kode saat ini** (baris 9-14):

```javascript
const request = {
  level: req.query.level,
  search: req.query.search,
  page: req.query.page,
  size: req.query.size
};
```

**Yang perlu ditambahkan** di dalam object `request`:

- `sort_by: req.query.sort_by`
- `sort_order: req.query.sort_order`

### 4. Update Unit Test

**File**: `backend/tests/kanji.test.js`

Tambahkan test case baru di dalam `describe("GET /api/kanjis")`:

1. **Test sort ascending (default)**: Pastikan `findMany` dipanggil dengan `orderBy: { jlptLevel: "asc" }` ketika tidak ada parameter sort yang dikirim.
2. **Test sort descending**: Kirim query `?sort_order=desc` dan pastikan `findMany` dipanggil dengan `orderBy: { jlptLevel: "desc" }`.
3. **Test sort_order tidak valid**: Kirim query `?sort_order=invalid` dan pastikan response status 400.

**Penting**: Karena `sort_by` dan `sort_order` memiliki nilai default, semua test case yang sudah ada harus tetap lolos. Periksa kembali apakah assertion `expect.objectContaining` di test lama perlu disesuaikan untuk mengakomodasi properti `orderBy` yang sekarang selalu ada di query.

---

## Frontend

### 5. Update Zustand Store

**File**: `frontend/src/stores/use-kanji-store.js`

Tambahkan state `sort_order` ke dalam object `filters`.

**Referensi kode saat ini** (baris 15-18):

```javascript
filters: {
  level: "",
  search: "",
},
```

**Yang perlu ditambahkan** di dalam `filters`:

- `sort_order: "asc"` (nilai default)

Tidak perlu mengubah logika `fetchKanjis` karena filters sudah di-spread ke params secara dinamis (baris 35: `...filters`).

### 6. Update Kanji List Page

**File**: `frontend/src/pages/kanji/KanjiListPage.jsx`

Tambahkan elemen UI berupa dropdown/select atau tombol toggle untuk memilih urutan sort.

**Langkah-langkah**:

1. Destructure `filters` dari store (sudah ada di baris 7).
2. Buat handler baru untuk mengubah sort order:
   ```javascript
   const handleSortChange = (order) => {
     setFilters({ sort_order: order });
   };
   ```
3. Tambahkan UI element (misal: `<select>` atau tombol toggle) di area header halaman, dekat filter level JLPT (sekitar baris 44-54).
4. Pastikan `useEffect` yang memantau `filters` (baris 18-20) sudah otomatis memicu `fetchKanjis` ulang saat sort berubah — ini seharusnya sudah bekerja tanpa modifikasi karena `filters` sudah menjadi dependency.

**Contoh UI yang disarankan** (pilih salah satu pendekatan):

- **Opsi A (Select Dropdown)**: `<select>` dengan opsi "N5 → N1" dan "N1 → N5".
- **Opsi B (Toggle Button)**: Tombol dengan icon panah atas/bawah yang bisa diklik untuk toggle antara `asc`/`desc`.

**Styling**: Sesuaikan dengan design system yang sudah ada (gunakan class `bg-background-lighter`, `border-my-border`, `text-gray-400`, `rounded-lg`, dll).

---

## Checklist Implementasi

- [ ] Update `backend/src/validation/kanji-validation.js` — tambah field `sort_by` dan `sort_order`.
- [ ] Update `backend/src/services/kanji-service.js` — tambah `orderBy` ke query Prisma.
- [ ] Update `backend/src/controller/kanji-controller.js` — teruskan query params baru.
- [ ] Update `backend/tests/kanji.test.js` — tambah test case untuk sorting + sesuaikan test lama jika perlu.
- [ ] Jalankan dan loloskan semua unit test (`bun test`).
- [ ] Update `frontend/src/stores/use-kanji-store.js` — tambah `sort_order` ke filters.
- [ ] Update `frontend/src/pages/kanji/KanjiListPage.jsx` — tambah UI sort dan handler.
- [ ] Verifikasi manual di browser: sort ascending dan descending berfungsi dengan benar.
- [ ] Update `CONTEXT.md` jika ada perubahan signifikan pada API (penambahan query parameter baru).

## Verifikasi

1. Jalankan `bun test` di folder `backend/` dan pastikan semua test (lama + baru) lolos.
2. Buka browser, akses halaman Kanji List:
   - Default harus menampilkan urutan N5 → N1.
   - Pilih sort descending, kanji harus menampilkan urutan N1 → N5.
   - Kombinasi sort + filter level + search harus tetap bekerja normal.
   - Paginasi harus tetap konsisten saat sort aktif.
