# Pedoman Pengembangan Backend

Dokumen ini berisi standar dan pola kode yang **wajib** diikuti saat mengembangkan fitur baru atau memperbaiki kode di proyek ini maupun proyek serupa dengan stack yang sama (Express.js + Prisma + Zod).

> Referensi utama arsitektur dan status proyek ada di `CONTEXT.md`.

---

## 1. Alur Arsitektur (Request Flow)

Setiap request HTTP mengikuti alur satu arah berikut:

```
Client → Router → [authMiddleware] → Controller → Service → Prisma → Database
                                         ↓ (error)
                                    errorMiddleware → Client
```

### Tanggung Jawab Tiap Layer

| Layer | Tanggung Jawab | Contoh File |
|-------|---------------|-------------|
| **Router** | Mendefinisikan endpoint dan HTTP method. Tidak ada logika. | `routes/api.js` |
| **Middleware** | Autentikasi, rate limiting. Tidak ada logika bisnis. | `middleware/auth-middleware.js` |
| **Controller** | Menerima `req/res`, menyusun parameter, memanggil Service, mengirim response. | `controller/user-controller.js` |
| **Service** | Validasi input (Zod), logika bisnis, interaksi database (Prisma). | `services/user-service.js` |
| **Validation** | Mendefinisikan skema Zod. Tidak ada logika. | `validation/user-validation.js` |

### Aturan Penting

- **Controller TIDAK BOLEH** melakukan validasi, query database, atau logika bisnis.
- **Service TIDAK BOLEH** mengakses `req` atau `res` secara langsung.
- **Validation HANYA** berisi definisi skema Zod, tanpa logika apapun.

---

## 2. Konvensi Penamaan

### File & Folder

```
kebab-case.js         → user-service.js, auth-middleware.js
kebab-case-test.js    → users-test.js, kanji-test.js
```

### Variabel & Fungsi

```javascript
camelCase             → validatedRequest, kanjiCount, isMemorized
```

### Skema Zod

```
[aksi][Domain]Validation  → registerUserValidation, updateUserKanjiValidation
```

### Route Path

```
/api/[domain]             → /api/users, /api/kanjis
/api/[domain]/:paramId    → /api/user-kanji/:kanjiId
```

---

## 3. Pola Controller

Setiap fungsi controller mengikuti template berikut:

```javascript
/**
 * [Deskripsi singkat dalam Bahasa Indonesia]
 */
const namaFungsi = async (req, res, next) => {
  try {
    // 1. Ambil data dari req (params, query, body, user)
    const user = req.user;
    const request = { ...req.body, kanjiId: req.params.kanjiId };

    // 2. Panggil service
    const result = await someService.action(user, request);

    // 3. Kirim response dengan status code yang tepat
    res.status(200).json({ data: result });
  } catch (e) {
    // 4. SELALU teruskan error ke middleware
    next(e);
  }
};
```

### Aturan

- Selalu bungkus dengan `try...catch` dan teruskan ke `next(e)`.
- Jangan melakukan validasi atau query database di controller.
- Gunakan `req.user` untuk data user yang sudah terautentikasi (di-set oleh auth middleware).

---

## 4. Pola Service

### Struktur Umum

```javascript
const action = async (user, request) => {
  // 1. Validasi input menggunakan Zod
  const validatedRequest = actionValidation.parse(request);

  // 2. Cek keberadaan resource (jika perlu)
  const existing = await prisma.model.findUnique({ ... });
  if (!existing) {
    throw new ResponseError(404, "Resource tidak ditemukan");
  }

  // 3. Cek kepemilikan data (Data Isolation)
  // → Selalu sertakan user.id dalam query where

  // 4. Logika bisnis

  // 5. Operasi database
  return prisma.model.create/update/delete({ ... });
};
```

### Aturan

- **Validasi SELALU di Service**, bukan di Controller.
- Gunakan `ResponseError` untuk semua error yang bisa diprediksi (400, 401, 404).
- Untuk validasi ID dari URL parameter, gunakan `safeParse` + throw 404 jika invalid:
  ```javascript
  const result = validation.safeParse(id);
  if (!result.success) {
    throw new ResponseError(404, "Data tidak ditemukan");
  }
  ```

---

## 5. Format Response

### Response Sukses

```json
// Single resource
{ "data": { "id": "...", "name": "..." } }

// Collection dengan paginasi
{
  "data": [ ... ],
  "paging": {
    "page": 1,
    "total_item": 50,
    "total_page": 5
  }
}

// Operasi tanpa return data (logout, delete)
{ "data": "OK" }
```

### Response Error

```json
// Error aplikasi (ResponseError)
{ "error": "Pesan error dalam Bahasa Indonesia" }

// Error validasi (ZodError)
{
  "error": "Validation Error",
  "details": [
    { "field": "email", "message": "Format email tidak valid" }
  ]
}

// Error server (500)
{ "error": "Internal Server Error" }
```

---

## 6. HTTP Status Code

| Code | Penggunaan | Contoh |
|------|-----------|--------|
| `200` | Operasi berhasil (GET, PATCH, DELETE) | Get profil, update data, hapus data |
| `201` | Resource baru berhasil dibuat (POST) | Registrasi user |
| `400` | Input tidak valid atau duplikat data | Email sudah terdaftar, validasi Zod gagal |
| `401` | Tidak terautentikasi | Token tidak ada atau tidak valid |
| `404` | Resource tidak ditemukan | User/Kanji tidak ada di database |
| `429` | Terlalu banyak request | Rate limiter terpicu |
| `500` | Error internal server | Error database yang tidak terduga |

---

## 7. Pola Validasi Zod

### Konvensi Pesan Error

Semua pesan error validasi **wajib Bahasa Indonesia**:

```javascript
z.string().min(1, "Nama tidak boleh kosong")
z.string().email("Format email tidak valid")
z.string().min(8, "Password minimal 8 karakter")
z.number().min(1, "Tingkat kesulitan minimal 1").max(5, "Tingkat kesulitan maksimal 5")
```

### Query Parameter (dengan default & coerce)

```javascript
const listValidation = z.object({
  page: z.coerce.number().min(1, "Page minimal adalah 1").default(1),
  size: z.coerce.number().min(1, "Size minimal adalah 1").max(100, "Size maksimal adalah 100").default(10),
  isMemorized: z.coerce.boolean().optional(),
});
```

- Gunakan `z.coerce` untuk query parameter karena nilainya selalu string dari URL.
- Gunakan `.default()` untuk memberikan nilai bawaan.
- Gunakan `size` (bukan `limit`) sebagai nama parameter ukuran halaman.

### Partial Update (PATCH)

Untuk endpoint PATCH, semua field opsional tapi minimal satu harus diisi:

```javascript
const updateValidation = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
}).refine(data => data.name !== undefined || data.email !== undefined, {
  message: "Minimal satu field harus diisi (name atau email)"
});
```

---

## 8. Pola Paginasi

Semua endpoint yang mengembalikan list **wajib** mendukung paginasi:

### Query Parameter

| Param | Tipe | Default | Keterangan |
|-------|------|---------|-----------|
| `page` | number | 1 | Halaman yang diminta |
| `size` | number | 10 atau 20 | Jumlah item per halaman |

### Implementasi di Service

```javascript
const skip = (validatedRequest.page - 1) * validatedRequest.size;

const [data, total] = await Promise.all([
  prisma.model.findMany({
    where: filters,
    take: validatedRequest.size,
    skip: skip,
    orderBy: { updatedAt: "desc" },
  }),
  prisma.model.count({
    where: filters,
  }),
]);

return {
  data,
  paging: {
    page: validatedRequest.page,
    total_item: total,
    total_page: Math.ceil(total / validatedRequest.size),
  },
};
```

### Aturan

- Selalu gunakan `Promise.all` untuk query data dan count secara paralel.
- Object `paging` selalu memiliki 3 key: `page`, `total_item`, `total_page`.
- Key menggunakan `snake_case` (konsisten dengan konvensi response).

---

## 9. Keamanan & Data Isolation

### Authentication

- Endpoint publik (register, login, health) → daftarkan di `publicRouter`.
- Endpoint yang butuh autentikasi → daftarkan di `apiRouter` (sudah dilindungi `authMiddleware` secara global).
- **Jangan** menambahkan `authMiddleware` per-route di `apiRouter` (sudah otomatis).

### Data Isolation

Setiap query yang menyangkut data milik user **WAJIB** menyertakan `user.id` dalam klausa `where`:

```javascript
// ✅ BENAR — Data terisolasi per user
prisma.userKanji.findUnique({
  where: {
    userId_kanjiId: {
      userId: user.id,        // ← WAJIB
      kanjiId: validatedId,
    },
  },
});

// ❌ SALAH — Bisa akses data user lain
prisma.userKanji.findUnique({
  where: { id: someId },
});
```

### Token Parsing

```javascript
// ✅ BENAR — Validasi format dulu
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({ error: "Unauthorized" });
}
const token = authHeader.slice(7);

// ❌ SALAH — Rawan edge case
const token = authHeader.replace("Bearer ", "");
```

---

## 10. Pola Error Handling

### Class ResponseError

Gunakan `ResponseError` untuk semua error yang bisa diprediksi:

```javascript
import { ResponseError } from "../error/response-error.js";

// Gunakan
throw new ResponseError(400, "Email sudah terdaftar");
throw new ResponseError(401, "Email atau password salah");
throw new ResponseError(404, "Data tidak ditemukan");
```

### Bahasa Pesan Error

- Pesan error dari `ResponseError` → **Bahasa Indonesia**.
- Pesan error dari Zod validation → **Bahasa Indonesia**.
- Key `"error"` dan `"Unauthorized"` → Bahasa Inggris (standar HTTP).

### Middleware Error

Semua error ditangani oleh `errorMiddleware`. Urutan pengecekan:

1. `ResponseError` → status code kustom + pesan.
2. `ZodError` → 400 + detail per-field.
3. Error lainnya → 500 Internal Server Error.

### Aturan

- **Jangan** catch error di Service kecuali untuk transformasi error.
- **Jangan** panggil `.end()` setelah `.json()` — sudah dipanggil otomatis.
- **Selalu** bungkus async middleware/controller dengan `try...catch` + `next(e)`.

---

## 11. Pola Testing

### Struktur File Test

```javascript
import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import request from "supertest";

// 1. Definisikan mock Prisma
const prismaMock = {
  user: { findUnique: mock(), count: mock(), create: mock(), update: mock() },
  model: { findMany: mock(), count: mock(), /* ... */ },
};

// 2. Mock module database
mock.module("../src/application/database.js", () => {
  return { prisma: prismaMock };
});

// 3. Import app SETELAH mock
import { app } from "../src/application/web.js";

describe("Domain API", () => {
  beforeEach(() => {
    // 4. Reset semua mock sebelum setiap test
    prismaMock.user.findUnique.mockReset();
    // ... reset semua mock
  });

  // 5. Helper untuk auth
  const mockAuthSuccess = () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      username: "TestUser",
      email: "test@example.com",
      token: "valid-token",
    });
  };

  describe("GET /api/resource", () => {
    it("seharusnya berhasil [deskripsi]", async () => {
      mockAuthSuccess();
      // setup mock → call endpoint → assert response
    });
  });
});
```

### Test Case Wajib per Endpoint

| Endpoint | Test Case Wajib |
|----------|----------------|
| **POST** (create) | Sukses, validasi gagal, duplikat data, tanpa auth |
| **GET** (single) | Sukses, data tidak ditemukan (404), ID format invalid, tanpa auth |
| **GET** (list) | Sukses default pagination, custom pagination, filter, parameter invalid |
| **PATCH** (update) | Sukses, body kosong (400), data tidak ditemukan (404), data milik user lain (404), tanpa auth |
| **DELETE** | Sukses, data tidak ditemukan (404), tanpa auth |

### Konvensi Nama Test

Gunakan format deskriptif dalam Bahasa Indonesia:

```javascript
it("seharusnya berhasil mendaftarkan pengguna baru", ...);
it("seharusnya menolak registrasi jika email sudah terdaftar", ...);
it("seharusnya gagal (401) jika tidak terautentikasi", ...);
it("seharusnya gagal (404) jika data tidak ditemukan", ...);
```

---

## 12. Checklist Menambah Fitur Baru

Saat menambahkan endpoint API baru, ikuti urutan berikut:

### 1. Schema (jika perlu model baru)

- [ ] Tambahkan model di `prisma/schema.prisma`
- [ ] Jalankan `npx prisma db push` atau `npx prisma migrate dev`

### 2. Validation

- [ ] Buat file `validation/[domain]-validation.js`
- [ ] Definisikan skema Zod untuk setiap operasi
- [ ] Pesan error dalam Bahasa Indonesia
- [ ] Gunakan `.refine()` untuk PATCH (minimal satu field)

### 3. Service

- [ ] Buat file `services/[domain]-service.js`
- [ ] Validasi input di awal setiap fungsi
- [ ] Implementasi data isolation (`user.id` di where clause)
- [ ] Gunakan `ResponseError` untuk error yang bisa diprediksi
- [ ] Tambahkan komentar/dokumentasi dalam Bahasa Indonesia

### 4. Controller

- [ ] Buat file `controller/[domain]-controller.js`
- [ ] Setiap fungsi: `try { ... } catch (e) { next(e) }`
- [ ] Ambil data dari `req`, panggil service, kirim response
- [ ] Status code: 201 untuk POST create, 200 untuk sisanya

### 5. Router

- [ ] Daftarkan route di `routes/api.js` (protected) atau `routes/public-api.js` (public)
- [ ] Ikuti pola URL: `/api/[domain]` atau `/api/[domain]/:id`

### 6. Testing

- [ ] Buat file `tests/[domain]-test.js`
- [ ] Ikuti pola mock Prisma yang sudah ada
- [ ] Cover semua test case wajib (lihat tabel di Bagian 11)
- [ ] Jalankan `bun test` dan pastikan semua lolos

### 7. Dokumentasi

- [ ] Update `CONTEXT.md` bagian Status Progress API
- [ ] Tandai endpoint baru dengan `[x]`
- [ ] Tambahkan keputusan arsitektur baru jika ada

---

## 13. Contoh Lengkap: Menambah Endpoint Baru

Contoh menambah `GET /api/kanjis/:id` (detail satu kanji):

### Validation (`validation/kanji-validation.js`)

```javascript
const getKanjiByIdValidation = z.string().uuid("Format ID Kanji tidak valid");
```

### Service (`services/kanji-service.js`)

```javascript
/**
 * Mengambil detail data satu kanji berdasarkan ID.
 */
const get = async (kanjiId) => {
  const result = getKanjiByIdValidation.safeParse(kanjiId);
  if (!result.success) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
  }

  const kanji = await prisma.kanji.findUnique({
    where: { id: result.data },
  });

  if (!kanji) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
  }

  return kanji;
};
```

### Controller (`controller/kanji-controller.js`)

```javascript
/**
 * Mengambil detail satu kanji berdasarkan ID.
 */
const get = async (req, res, next) => {
  try {
    const result = await kanjiService.get(req.params.id);
    res.status(200).json({ data: result });
  } catch (e) {
    next(e);
  }
};
```

### Router (`routes/api.js`)

```javascript
apiRouter.get('/api/kanjis/:id', kanjiController.get);
```
