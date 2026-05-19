# Feature: Klasifikasi Prioritas Belajar Kanji

## Deskripsi

Saat ini oKanji sudah memiliki fitur sort untuk mengurutkan kanji berdasarkan level JLPT (N5 → N1), namun belum ada pembagian prioritas **di dalam** masing-masing level. Fitur ini menambahkan field `priority` pada setiap kanji untuk menentukan urutan belajar yang direkomendasikan. Kanji dengan priority lebih kecil = lebih penting untuk dipelajari lebih dulu.

Contoh: Dalam level N5, kanji 日 (hari/matahari) memiliki priority lebih tinggi (angka lebih kecil) dibanding 鳥 (burung) karena frekuensi penggunaannya sehari-hari jauh lebih tinggi.

Selain itu, ditambahkan endpoint baru `PATCH /api/kanjis/priority` untuk batch update priority secara efisien.

## Scope Perubahan

| Layer | File | Aksi |
|-------|------|------|
| Database | `backend/prisma/schema.prisma` | Tambah field `priority` |
| Validation | `backend/src/validation/kanji-validation.js` | Tambah validasi sort & batch priority |
| Service | `backend/src/services/kanji-service.js` | Extend sort logic + fungsi batch update |
| Controller | `backend/src/controller/kanji-controller.js` | Tambah handler batch update priority |
| Route | `backend/src/routes/api.js` | Tambah route `PATCH /api/kanjis/priority` |
| Test | `backend/tests/kanji.test.js` | Tambah test case baru |
| Frontend Service | `frontend/src/services/kanji-service.js` | Tambah fungsi API batch update priority |
| Frontend Store | `frontend/src/stores/use-kanji-store.js` | Tambah `sort_by` di filters |
| Frontend Page | `frontend/src/pages/kanji/KanjiListPage.jsx` | Update dropdown sort |

---

## Langkah Implementasi

### 1. Update Database Schema

**File**: `backend/prisma/schema.prisma`

Tambahkan field `priority` bertipe `Int?` (nullable) pada model `Kanji`. Field ini nullable karena data priority akan diinput secara bertahap (tidak semua kanji langsung punya priority).

```prisma
model Kanji {
  id          String        @id @default(uuid())
  character   String        @unique @db.VarChar(10)
  jlptLevel   JlptLevel
  onyomi      String        @db.VarChar(255)
  kunyomi     String        @db.VarChar(255)
  meaning     String        @db.VarChar(500)
  strokeCount Int?
  radical     String?       @db.VarChar(10)
  priority    Int?                                   // <-- TAMBAHKAN INI
  createdAt   DateTime      @default(now())
  userKanjis  UserKanji[]
  kanjiKotoba KanjiKotoba[]

  @@map("kanjis")
}
```

Setelah menambahkan field, jalankan:

```bash
cd backend
npx prisma db push
```

> **Tips penomoran**: Gunakan kelipatan 10 (10, 20, 30, ...) agar mudah menyisipkan kanji baru di antara dua priority yang sudah ada tanpa harus menomori ulang semua data.

---

### 2. Update Validation Schema

**File**: `backend/src/validation/kanji-validation.js`

Ada dua hal yang perlu dilakukan di file ini:

#### 2a. Extend `sort_by` pada `getKanjiValidation`

Tambahkan `"priority"` sebagai opsi valid untuk `sort_by`. Saat ini hanya ada `"jlptLevel"`.

**Kondisi saat ini** (baris 11):
```javascript
sort_by: z.enum(["jlptLevel"]).default("jlptLevel"),
```

**Ubah menjadi**:
```javascript
sort_by: z.enum(["jlptLevel", "priority"]).default("jlptLevel"),
```

#### 2b. Tambahkan validation schema baru untuk batch update priority

Buat skema validasi baru bernama `updateKanjiPriorityValidation`. Schema ini memvalidasi array objek yang berisi `kanjiId` (UUID) dan `priority` (positive integer).

```javascript
/**
 * Skema validasi untuk satu item update priority kanji.
 */
const kanjiPriorityItemValidation = z.object({
  kanjiId: z.string().uuid("Invalid Kanji ID format"),
  priority: z.number().int().min(1, "Priority must be a positive integer"),
});

/**
 * Skema validasi untuk batch update priority kanji.
 * Menerima array item priority (minimal 1 item).
 */
const updateKanjiPriorityValidation = z
  .array(kanjiPriorityItemValidation)
  .min(1, "At least one kanji priority item is required");
```

Jangan lupa export skema baru ini di bagian bawah file:

```javascript
export { getKanjiValidation, getKanjiByIdValidation, updateKanjiPriorityValidation };
```

---

### 3. Update Kanji Service

**File**: `backend/src/services/kanji-service.js`

Ada dua perubahan di file ini:

#### 3a. Update logic `orderBy` pada fungsi `list`

Saat ini fungsi `list` menggunakan `orderBy` sederhana (baris 35-37):

```javascript
orderBy: {
  [validatedRequest.sort_by]: validatedRequest.sort_order,
},
```

Ubah menjadi logic yang menangani sort by `priority` dengan **null values di akhir**. Ketika user memilih sort by `priority`, kanji yang belum punya priority (null) harus ditampilkan paling akhir. Prisma mendukung ini dengan opsi `nulls`.

**Logika yang diharapkan**:
- Jika `sort_by` = `"priority"` → gunakan format `{ priority: { sort: 'asc'/'desc', nulls: 'last' } }`
- Jika `sort_by` = `"jlptLevel"` (atau default) → gunakan format lama `{ jlptLevel: 'asc'/'desc' }`

Contoh implementasi:

```javascript
// Menyusun orderBy berdasarkan sort_by yang dipilih
let orderBy;
if (validatedRequest.sort_by === "priority") {
  // Sort berdasarkan priority, kanji tanpa priority ditaruh paling akhir
  orderBy = { priority: { sort: validatedRequest.sort_order, nulls: "last" } };
} else {
  // Sort default berdasarkan jlptLevel
  orderBy = { [validatedRequest.sort_by]: validatedRequest.sort_order };
}
```

Lalu gunakan variabel `orderBy` ini di query `prisma.kanji.findMany`:

```javascript
prisma.kanji.findMany({
  where: filters,
  take: validatedRequest.size,
  skip: skip,
  orderBy: orderBy,  // <-- Gunakan variabel orderBy
  include: { ... },
}),
```

#### 3b. Tambahkan fungsi baru `updatePriority`

Fungsi ini menerima array data `[{ kanjiId, priority }, ...]`, memvalidasi input, lalu melakukan batch update menggunakan `prisma.$transaction` untuk memastikan semua update bersifat atomik (semua berhasil atau semua gagal).

```javascript
import { updateKanjiPriorityValidation } from '../validation/kanji-validation.js';

/**
 * Batch update priority kanji.
 * Menggunakan transaksi database agar semua update berhasil atau gagal secara bersamaan.
 */
const updatePriority = async (request) => {
  // Validasi input: harus berupa array minimal 1 item
  const validatedRequest = updateKanjiPriorityValidation.parse(request);

  // Jalankan semua update dalam satu transaksi
  const updates = validatedRequest.map((item) =>
    prisma.kanji.update({
      where: { id: item.kanjiId },
      data: { priority: item.priority },
    })
  );

  const results = await prisma.$transaction(updates);

  return { updated: results.length };
};
```

Jangan lupa export fungsi baru ini:
```javascript
export { list, get, updatePriority };
```

> **Catatan**: Prisma akan otomatis melempar error jika `kanjiId` tidak ditemukan di database. Error ini akan tertangkap oleh `error-middleware.js` dan dikembalikan sebagai response error.

---

### 4. Update Kanji Controller

**File**: `backend/src/controller/kanji-controller.js`

Tambahkan handler baru `updatePriority` yang menerima request body (array JSON) dan meneruskan ke service.

```javascript
/**
 * Batch update priority kanji.
 * Menerima array JSON berisi { kanjiId, priority } di request body.
 */
const updatePriority = async (req, res, next) => {
  try {
    const result = await kanjiService.updatePriority(req.body);
    res.status(200).json({ data: result });
  } catch (e) {
    next(e);
  }
};
```

Jangan lupa export fungsi baru ini:
```javascript
export { list, get, updatePriority };
```

---

### 5. Tambahkan Route Baru

**File**: `backend/src/routes/api.js`

Tambahkan route baru **di bawah** route `GET /api/kanjis/:kanjiId` yang sudah ada (baris 28). Urutan penting: route dengan path spesifik seperti `/api/kanjis/priority` harus didefinisikan **sebelum** route dengan parameter dinamis `/api/kanjis/:kanjiId`, agar Express tidak menganggap `priority` sebagai `kanjiId`.

**Kondisi saat ini** (baris 27-28):
```javascript
apiRouter.get("/api/kanjis", kanjiController.list);
apiRouter.get("/api/kanjis/:kanjiId", kanjiController.get);
```

**Ubah menjadi**:
```javascript
apiRouter.get("/api/kanjis", kanjiController.list);
apiRouter.patch("/api/kanjis/priority", kanjiController.updatePriority);  // <-- SEBELUM :kanjiId
apiRouter.get("/api/kanjis/:kanjiId", kanjiController.get);
```

> ⚠️ **Penting**: Route `/api/kanjis/priority` HARUS berada di atas `/api/kanjis/:kanjiId`. Jika diletakkan di bawah, Express akan mencocokkan `priority` sebagai parameter `kanjiId` dan mengarahkan ke handler yang salah.

---

### 6. Buat dan Perbarui Unit Test

**File**: `backend/tests/kanji.test.js`

#### 6a. Update mock object

Tambahkan mock method yang dibutuhkan di `prismaMock`. Saat ini sudah ada `findMany`, `count`, dan `findUnique`. Tambahkan:

```javascript
const prismaMock = {
    user: {
        findUnique: mock()
    },
    kanji: {
        findMany: mock(),
        count: mock(),
        findUnique: mock(),
        update: mock()          // <-- TAMBAHKAN
    },
    $transaction: mock()        // <-- TAMBAHKAN
};
```

Jangan lupa reset mock baru ini di `beforeEach`:

```javascript
beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.kanji.findMany.mockReset();
    prismaMock.kanji.count.mockReset();
    prismaMock.kanji.findUnique.mockReset();
    prismaMock.kanji.update.mockReset();     // <-- TAMBAHKAN
    prismaMock.$transaction.mockReset();     // <-- TAMBAHKAN
});
```

#### 6b. Tambahkan test case untuk sort by priority

Di dalam `describe("GET /api/kanjis", ...)`, tambahkan test berikut:

**Test 1: Sort by priority berhasil**
- Kirim request `GET /api/kanjis?sort_by=priority&sort_order=asc`
- Verifikasi response status 200
- Verifikasi `findMany` dipanggil dengan `orderBy` yang mengandung `priority` dan `nulls: "last"`

**Test 2: Sort by priority descending**
- Kirim request `GET /api/kanjis?sort_by=priority&sort_order=desc`
- Verifikasi `orderBy` menggunakan `sort: "desc"` dan tetap `nulls: "last"`

**Test 3: Gagal jika sort_by tidak valid**
- Kirim request `GET /api/kanjis?sort_by=invalid`
- Verifikasi response status 400

#### 6c. Tambahkan describe baru untuk endpoint batch update priority

Buat `describe("PATCH /api/kanjis/priority", ...)` dengan test case berikut:

**Test 1: Berhasil batch update priority**
- Request body: `[{ "kanjiId": "valid-uuid-1", "priority": 10 }, { "kanjiId": "valid-uuid-2", "priority": 20 }]`
- Mock `$transaction` agar resolve dengan array hasil update
- Verifikasi response status 200
- Verifikasi response body `{ data: { updated: 2 } }`
- Verifikasi `$transaction` dipanggil

**Test 2: Gagal jika body kosong (array kosong)**
- Request body: `[]`
- Verifikasi response status 400
- Verifikasi error message tentang "At least one kanji priority item is required"

**Test 3: Gagal jika kanjiId bukan UUID valid**
- Request body: `[{ "kanjiId": "bukan-uuid", "priority": 10 }]`
- Verifikasi response status 400

**Test 4: Gagal jika priority bukan positive integer**
- Request body: `[{ "kanjiId": "valid-uuid", "priority": -5 }]`
- Verifikasi response status 400

**Test 5: Gagal jika priority bukan integer (decimal)**
- Request body: `[{ "kanjiId": "valid-uuid", "priority": 1.5 }]`
- Verifikasi response status 400

**Test 6: Gagal (401) jika tidak menyertakan token**
- Kirim request tanpa header Authorization
- Verifikasi response status 401

---

### 7. Update Frontend Kanji Service

**File**: `frontend/src/services/kanji-service.js`

Tambahkan fungsi baru `updateKanjiPriority` untuk memanggil endpoint batch update. Fungsi ini menerima array objek `[{ kanjiId, priority }, ...]`.

```javascript
/**
 * Batch update priority kanji
 * @param {Array<Object>} priorities - Array berisi { kanjiId, priority }
 * @returns {Promise<Object>} Mengembalikan { data: { updated: number } }
 */
updateKanjiPriority: async (priorities) => {
  const response = await api.patch('/kanjis/priority', priorities);
  return response.data;
},
```

---

### 8. Update Frontend Zustand Store

**File**: `frontend/src/stores/use-kanji-store.js`

Tambahkan `sort_by` di state `filters`. Saat ini filters hanya berisi `level`, `search`, dan `sort_order`.

**Kondisi saat ini** (baris 15-19):
```javascript
filters: {
  level: "",
  search: "",
  sort_order: "asc",
},
```

**Ubah menjadi**:
```javascript
filters: {
  level: "",
  search: "",
  sort_by: "jlptLevel",    // <-- TAMBAHKAN: default sort by jlptLevel
  sort_order: "asc",
},
```

Tidak perlu mengubah fungsi `fetchKanjis` karena sudah menggunakan spread operator `...filters` yang otomatis menyertakan field baru ini ke request params.

---

### 9. Update Frontend Sort UI

**File**: `frontend/src/pages/kanji/KanjiListPage.jsx`

Update dropdown sort yang saat ini hanya menampilkan arah sorting (N5→N1 / N1→N5). Ubah agar menampilkan opsi sort berdasarkan **jenis sorting** dan **arah sorting** sekaligus.

#### 9a. Update handler sort

**Kondisi saat ini** (baris 28-30):
```jsx
const handleSortChange = (order) => {
  setFilters({ sort_order: order });
};
```

**Ubah menjadi**:
```jsx
const handleSortChange = (value) => {
  // Nilai dropdown menggabungkan sort_by dan sort_order, dipisah dengan tanda "|"
  // Contoh: "jlptLevel|asc", "priority|asc"
  const [sortBy, sortOrder] = value.split("|");
  setFilters({ sort_by: sortBy, sort_order: sortOrder });
};
```

#### 9b. Update elemen `<select>`

**Kondisi saat ini** (baris 59-66):
```jsx
<select
  value={filters.sort_order || "asc"}
  onChange={(e) => handleSortChange(e.target.value)}
  className="..."
>
  <option value="asc">N5 → N1</option>
  <option value="desc">N1 → N5</option>
</select>
```

**Ubah menjadi**:
```jsx
<select
  value={`${filters.sort_by || "jlptLevel"}|${filters.sort_order || "asc"}`}
  onChange={(e) => handleSortChange(e.target.value)}
  className="..."
>
  <option value="jlptLevel|asc">JLPT: N5 → N1</option>
  <option value="jlptLevel|desc">JLPT: N1 → N5</option>
  <option value="priority|asc">Priority: Recommended Order</option>
  <option value="priority|desc">Priority: Reverse Order</option>
</select>
```

---

### 10. Update CONTEXT.md

Setelah semua implementasi selesai dan test lolos, update `CONTEXT.md`:

1. Tambahkan endpoint baru di **Bagian 4 (Status Progress API)** di bawah section **Kanji Data**:
   ```
   - [x] `PATCH /api/kanjis/priority`: Batch update priority kanji.
     - Body: Array `[{ kanjiId, priority }]`.
   ```

2. Tambahkan query param `sort_by` baru pada dokumentasi `GET /api/kanjis`:
   ```
   - Query Params: ..., `sort_by` (jlptLevel/priority), ...
   ```

3. Tambahkan keputusan arsitektur baru di **Bagian 6**:
   ```
   XX. **Kanji Priority System**: Field `priority` (Int, nullable) pada model Kanji digunakan untuk menentukan urutan belajar yang direkomendasikan. Saat sort by priority, kanji tanpa priority (null) ditampilkan di akhir menggunakan Prisma `nulls: 'last'`. Penomoran menggunakan kelipatan 10 untuk memudahkan penyisipan data baru.
   ```

---

## Contoh Penggunaan Endpoint

### Batch Update Priority

```bash
# Update priority untuk 3 kanji sekaligus
curl -X PATCH http://localhost:5000/api/kanjis/priority \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    { "kanjiId": "uuid-kanji-日", "priority": 10 },
    { "kanjiId": "uuid-kanji-一", "priority": 20 },
    { "kanjiId": "uuid-kanji-大", "priority": 30 }
  ]'

# Response:
# { "data": { "updated": 3 } }
```

### Sort Kanji by Priority

```bash
# Ambil kanji diurutkan berdasarkan priority (recommended order)
curl http://localhost:5000/api/kanjis?sort_by=priority&sort_order=asc \
  -H "Authorization: Bearer <token>"
```

---

## Checklist Verifikasi

- [ ] `npx prisma db push` berhasil tanpa error
- [ ] Semua test lama masih lolos (`bun run test`)
- [ ] Test baru untuk sort by priority lolos
- [ ] Test baru untuk `PATCH /api/kanjis/priority` lolos (semua 6 test case)
- [ ] Frontend dropdown sort menampilkan 4 opsi
- [ ] Sort by "Priority: Recommended Order" menampilkan kanji sesuai urutan priority
- [ ] Kanji tanpa priority tampil di akhir list saat sort by priority
- [ ] Update CONTEXT.md sudah dilakukan
