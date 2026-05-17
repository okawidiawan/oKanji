# Feature: Optimasi Validasi Duplikat Kotoba dengan Relasi Many-to-Many

## Konteks Masalah

Saat ini, logika pembuatan kosakata (Kotoba) di `backend/src/services/kotoba-service.js` mencegah masuknya kombinasi `word` dan `reading` yang sama secara mutlak (global) dengan melemparkan error `"Vocabulary already registered"`.

Pendekatan ini bermasalah untuk kosakata bahasa Jepang yang saling beririsan dan dimiliki oleh lebih dari satu Kanji.
**Contoh Kasus:**
Kosakata `中国` (reading: `ちゅうごく`) terkait dengan kanji `中` dan `国`. Jika user sudah menambahkan `中国` pada kanji `中`, lalu kemudian ingin menambahkan `中国` pada kanji `国`, sistem akan menolak dengan error. Padahal seharusnya kosakata tersebut diizinkan dan cukup **dihubungkan (_linked_)** ke kanji yang baru tanpa membuat duplikat baris baru.

## Tujuan (Architectural Goal)

Kita memiliki relasi **Many-to-Many** antara `Kanji` dan `Kotoba` melalui tabel penghubung `KanjiKotoba` (lihat `backend/prisma/schema.prisma`).
Tujuannya adalah:

- **Jangan lempar error** saat mendeteksi duplikat `word` + `reading` pada endpoint Create.
- Alih-alih error, **cari data Kotoba yang sudah ada tersebut**, lalu **hubungkan (link) secara otomatis** ke `kanjiId` yang baru dikirimkan melalui tabel `KanjiKotoba`.
- Hal ini mencegah redundansi baris di tabel `kotoba` dan menjaga riwayat progres belajar user tetap terintegrasi sempurna.

## Instruksi Teknis untuk Developer / AI

Harap ubah logika di berkas `backend/src/services/kotoba-service.js`.

### 1. Hapus Validasi Duplikat Global di `create`

Pastikan pemanggilan `await validateDuplicateKotoba(...)` **dihapus** dari alur _single create_. Pengecekan duplikat akan kita ganti dengan logika "Pencarian dan Penghubungan (Find & Link)".

### 2. Ubah Skenario Single Create

Pada fungsi `create` (di bagian penanganan single object):

1. Lakukan pencarian data kotoba yang eksis menggunakan `prisma.kotoba.findFirst` berdasarkan `word` dan `reading` yang dikirimkan. Sertakan relasi `include: { kanjiKotoba: true }`.
2. Jika Kotoba **sudah ada**:
   - Ambil daftar `kanjiId` yang saat ini terhubung ke Kotoba tersebut.
   - Filter `kanjiIds` dari _request payload_ yang **belum terhubung**.
   - Lakukan `prisma.kanjiKotoba.createMany` untuk menghubungkan `kanjiId` baru ke Kotoba tersebut.
   - Gabungkan ID kanji yang lama dan baru, lalu _return_ response object tanpa mengeksekusi `prisma.kotoba.create`.
3. Jika Kotoba **belum ada**:
   - Eksekusi blok `prisma.kotoba.create` seperti biasa.

### 3. Terapkan Pola Serupa di Batch Create

Pada bagian blok `if (Array.isArray(validatedRequest))` di dalam transaksi `$transaction`:

- Hapus logika `if (existing > 0) throw new ResponseError(...)`.
- Ganti dengan pendekatan yang sama: Cari data kotoba. Jika sudah ada, gunakan `tx.kanjiKotoba.create` untuk meng-insert relasi barunya saja. Jika belum ada, eksekusi `tx.kotoba.create`.

### 4. Buat dan Perbarui Unit Test
Sesuai pedoman di `CONTEXT.md`, setiap penambahan fitur atau modifikasi logika wajib diikuti dengan pembuatan **Unit Test**. Gunakan framework **Bun Test** di direktori `backend/tests/` (terutama di `kotoba.test.js`).

Pastikan Anda menambahkan *test case* baru untuk memvalidasi skenario berikut:
1. **Insert Kotoba Baru**: Proses pembuatan kosakata yang belum ada berjalan seperti biasa.
2. **Re-use Kotoba (Skenario Utama)**: 
   - Lakukan pembuatan kosakata (`word` dan `reading`) yang *sama persis* dengan data yang sudah ada di DB, namun berikan `kanjiId` yang **berbeda**.
   - **Ekspektasi (Expectations)**:
     - API melempar status `200 OK` (tidak lagi melempar `400 Bad Request`).
     - Jumlah *record* di tabel `kotoba` (**tidak bertambah** / tidak ada duplikat baris).
     - Relasi tabel `kanji_kotoba` bertambah untuk `kanjiId` yang baru.
     - Response API mengembalikan array `kanjiIds` yang berisi gabungan ID kanji lama dan baru.

---

## Referensi Kode (Clue untuk Single Create)

Berikut adalah gambaran alur kode yang diharapkan untuk proses "Single Create" pada `kotoba-service.js`:

```javascript
// 1. Cari apakah Kotoba dengan kombinasi word & reading tersebut sudah terdaftar
const existingKotoba = await prisma.kotoba.findFirst({
  where: {
    word: validatedRequest.word,
    reading: validatedRequest.reading,
  },
  include: {
    kanjiKotoba: true, // Ambil semua kanji yang saat ini terhubung
  },
});

// 2. Jika SUDAH ADA, kita hubungkan dengan kanjiIds yang dikirimkan (jika belum terhubung)
if (existingKotoba) {
  const currentLinkedKanjiIds = existingKotoba.kanjiKotoba.map((k) => k.kanjiId);

  // Filter kanji mana saja yang belum terhubung ke kotoba ini
  const newLinks = validatedRequest.kanjiIds.filter((id) => !currentLinkedKanjiIds.includes(id));

  if (newLinks.length > 0) {
    // Buat relasi baru di tabel penghubung KanjiKotoba
    await prisma.kanjiKotoba.createMany({
      data: newLinks.map((kanjiId) => ({
        kanjiId: kanjiId,
        kotobaId: existingKotoba.id,
      })),
    });
  }

  // Gabungkan list kanji lama dengan yang baru untuk response data
  const allLinkedKanjiIds = [...new Set([...currentLinkedKanjiIds, ...validatedRequest.kanjiIds])];

  return {
    id: existingKotoba.id,
    word: existingKotoba.word,
    reading: existingKotoba.reading,
    meaning: existingKotoba.meaning,
    jlptLevel: existingKotoba.jlptLevel,
    kanjiIds: allLinkedKanjiIds,
  };
}

// 3. Jika BELUM ADA, jalankan pembuatan data Kotoba baru seperti biasa
const result = await prisma.kotoba.create({
  // ... data & select block bawaan ...
});
```
