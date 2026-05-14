# Issue List — Halaman User Kanji, Indikator Tracking, & Fix Add Kotoba

> Dokumen ini berisi daftar issue untuk implementasi fitur halaman "My Kanji" (daftar kanji milik user), penambahan indikator visual tracking pada halaman Kanji List & Kanji Detail, serta perbaikan bug tombol "Add Kotoba" yang belum berfungsi.
> Setiap issue harus dikerjakan sesuai konvensi yang ada di `CONTEXT.md` dan `GUIDELINES.md`.
> Setelah setiap issue selesai, jalankan aplikasi frontend (`bun run dev`) dan pastikan tidak ada error di console browser.

---

## Issue #1: Buat Halaman "My Kanji" (User Kanji List Page)

**Tipe**: `Feature`
**Prioritas**: High
**File yang perlu dibuat/diubah**:
- `frontend/src/pages/user/UserKanjiListPage.jsx` [NEW]
- `frontend/src/router/index.jsx` [MODIFY]
- `frontend/src/components/common/Navbar.jsx` [MODIFY]

### Deskripsi

Saat ini di Navbar sudah ada link "My Kanji" (line 50-52) yang mengarah ke `/`, tetapi belum ada halaman yang menampilkan daftar kanji milik user. Perlu dibuat halaman baru `UserKanjiListPage` yang menampilkan **hanya kanji yang sudah ditambahkan oleh user** ke daftar belajarnya.

Data diambil dari endpoint `GET /api/user-kanji` yang sudah tersedia dan sudah terintegrasi di `use-user-progress-store.js` melalui action `fetchUserKanjis`.

### Perubahan

#### 1. Buat File Baru: `frontend/src/pages/user/UserKanjiListPage.jsx`

Halaman ini menampilkan grid kanji milik user dengan informasi status hafalan. Struktur minimal:

```jsx
// Gunakan useUserProgressStore untuk mengambil data
const { userKanjis, isLoading, error, paging, fetchUserKanjis } = useUserProgressStore();

// Panggil fetchUserKanjis() di useEffect
// Tampilkan grid card kanji dengan informasi:
// - kanji.character (karakter kanji)
// - kanji.meaning (arti)
// - isMemorized (status hafalan → tampilkan badge/icon)
// - reviewCount (jumlah review)
// - Link ke halaman detail: /kanji/{kanjiId}
```

**Fitur yang harus ada di halaman ini**:
- Grid layout kanji card (mirip dengan `KanjiListPage` tapi untuk user's kanji saja)
- Badge atau indikator visual pada kanji yang sudah dihafal (`isMemorized: true`) — misalnya checklist hijau ✅
- Informasi `reviewCount` pada setiap card
- Paginasi (gunakan `paging` dari response)
- State kosong: tampilkan pesan "You haven't started learning any kanji yet." dengan link ke `/kanji` untuk mulai belajar
- Loading skeleton saat data sedang dimuat
- Filter `isMemorized` (opsional) — tombol toggle untuk menampilkan kanji yang sudah/belum dihafal

**Data response dari `GET /api/user-kanji`**:
```json
{
  "data": [
    {
      "userId": 1,
      "kanjiId": "uuid-1",
      "isMemorized": true,
      "reviewCount": 5,
      "difficulty": 3,
      "memorizedAt": "2026-05-10T...",
      "lastReviewed": "2026-05-13T...",
      "kanji": {
        "id": "uuid-1",
        "character": "食",
        "meaning": "eat, food",
        "jlptLevel": "N4"
      }
    }
  ],
  "paging": { "page": 1, "total_item": 15, "total_page": 2 }
}
```

#### 2. Update Router: `frontend/src/router/index.jsx`

Tambahkan rute baru di dalam blok `ProtectedRoute > MainLayout`:

```jsx
import UserKanjiListPage from "../pages/user/UserKanjiListPage";

// Di dalam children MainLayout:
{ path: "my-kanji", element: <UserKanjiListPage /> },
```

#### 3. Update Navbar: `frontend/src/components/common/Navbar.jsx`

Ubah link "My Kanji" yang saat ini mengarah ke `/` menjadi `/my-kanji`:

Sebelum (line 50-52):
```jsx
<Link to="/" className="hover:text-primary transition-colors">
  My Kanji
</Link>
```

Sesudah:
```jsx
<Link to="/my-kanji" className="hover:text-primary transition-colors">
  My Kanji
</Link>
```

### Catatan Penting

- Gunakan desain yang konsisten dengan `KanjiListPage` yang sudah ada (warna, rounded, spacing, dll).
- Setiap kanji card harus menjadi link ke `/kanji/{kanjiId}` untuk membuka detail kanji.
- Pastikan store `use-user-progress-store.js` memiliki data `kanji` yang di-include dari backend (sesuai response `GET /api/user-kanji`). Cek bahwa backend sudah menyertakan relasi `kanji` pada response list.

---

## Issue #2: Tambahkan Indikator "Sudah Dipelajari" di Kanji List (Global)

**Tipe**: `Feature`
**Prioritas**: Medium
**File yang perlu diubah**: `frontend/src/pages/kanji/KanjiListPage.jsx`

### Deskripsi

Halaman Kanji List (`/kanji`) menampilkan seluruh kanji tanpa informasi apakah user sudah menambahkan kanji tersebut ke daftar belajarnya. Setelah backend diperbarui (Issue #93, sekarang `GET /api/kanjis` menyertakan `userKanjis`), frontend perlu menampilkan **indikator visual** pada kanji yang sudah di-add oleh user.

### Data yang Tersedia

Setelah perubahan backend di Issue #93, setiap kanji dalam response `GET /api/kanjis` sudah memiliki field `userKanjis`:

```json
{
  "id": "uuid-1",
  "character": "食",
  "meaning": "eat, food",
  "jlptLevel": "N4",
  "userKanjis": [{ "isMemorized": false }]   // ← sudah di-add, belum hafal
}
```

```json
{
  "id": "uuid-2",
  "character": "飲",
  "meaning": "drink",
  "jlptLevel": "N4",
  "userKanjis": []   // ← belum di-add (array kosong)
}
```

### Perubahan di `KanjiListPage.jsx`

Di dalam loop `kanjis.map((kanji) => ...)` (sekitar line 71-81), tambahkan logika penandaan:

```jsx
kanjis.map((kanji) => {
  // Deteksi status tracking user
  const isLearning = kanji.userKanjis && kanji.userKanjis.length > 0;
  const isMemorized = isLearning && kanji.userKanjis[0].isMemorized === true;

  return (
    <Link key={kanji.id} to={`/kanji/${kanji.id}`}
      className={`relative overflow-hidden group aspect-square bg-background-lighter border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300
        ${isMemorized
          ? "border-green-500/50 bg-green-500/5 hover:border-green-500"
          : isLearning
            ? "border-primary/30 bg-primary/5 hover:border-primary"
            : "border-my-border hover:border-primary hover:bg-primary/5"
        }`}
    >
      {/* Indikator status tracking */}
      {isLearning && (
        <span className={`absolute top-0 left-0 p-1.5 rounded-br-lg text-xs
          ${isMemorized ? "bg-green-500 text-background" : "bg-primary/20 text-primary"}`}
        >
          {isMemorized ? "✓" : "📖"}
        </span>
      )}

      <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{kanji.character}</span>
      <span className="text-xs text-gray-400 group-hover:text-primary transition-colors text-center line-clamp-1 px-2">{kanji.meaning}</span>
      <span className="absolute top-0 right-0 text-sm font-bold text-primary/60 bg-primary/10 px-2.5 py-1.5 rounded uppercase">{kanji.jlptLevel}</span>
    </Link>
  );
})
```

**Indikator visual yang direkomendasikan**:
- **Sudah hafal** (`isMemorized: true`): Border hijau + icon checklist hijau di pojok kiri atas
- **Sedang dipelajari** (`isLearning && !isMemorized`): Border primary samar + icon buku 📖 di pojok kiri atas
- **Belum dipelajari** (`userKanjis` kosong): Tampilan default tanpa indikator (seperti sekarang)

### Catatan Penting

- Tidak perlu mengubah store `use-kanji-store.js` karena data `userKanjis` sudah otomatis tersimpan di state `kanjis`.
- Desain indikator di atas adalah **rekomendasi**, boleh disesuaikan selama visual cukup jelas membedakan ketiga status.
- Icon bisa menggunakan React Icons yang sudah terinstal di project, atau emoji/SVG inline.

---

## Issue #3: Tampilkan Indikator "Sudah Di-Track" pada Kotoba di Kanji Detail

**Tipe**: `Feature`
**Prioritas**: Medium
**File yang perlu diubah**: `frontend/src/pages/kanji/KanjiDetailPage.jsx`

### Deskripsi

Halaman `KanjiDetailPage` menampilkan daftar kotoba dari `currentKanji.kotoba` (data referensi kanji global dari `GET /api/kanjis/:kanjiId`). Data ini **tidak** mengandung informasi `userKotoba`, sehingga tombol "Add to Memorization List" dan "Toggle Memorized" tidak bisa mendeteksi status tracking user secara akurat.

Sementara itu, data `currentProgressDetail.kanji.kotoba` (dari `GET /api/user-kanji/:kanjiId`) sudah mengandung `userKotoba` per kotoba. Namun data ini **hanya tersedia jika user sudah men-add kanji tersebut** ke daftar belajarnya.

### Perubahan

Ubah sumber data kotoba di `KanjiDetailPage.jsx` agar menggabungkan (merge) data dari kedua sumber:
1. Data kotoba **referensi** dari `currentKanji.kotoba` (selalu ada)
2. Data kotoba **user progress** dari `currentProgressDetail?.kanji?.kotoba` (ada jika user sudah add kanji)

#### Logika Merge Data (sekitar line 236-237)

Sebelum:
```jsx
{currentKanji.kotoba && currentKanji.kotoba.length > 0 ? (
  currentKanji.kotoba.map((word) => {
    const userKotoba = word.userKotoba?.[0];
```

Sesudah:
```jsx
{(() => {
  // Gabungkan data kotoba referensi dengan data progress user
  const kotobaList = currentKanji.kotoba || [];
  const userKotobaMap = {};

  // Bangun lookup dari data progress user jika tersedia
  if (currentProgressDetail?.kanji?.kotoba) {
    currentProgressDetail.kanji.kotoba.forEach((k) => {
      if (k.userKotoba && k.userKotoba.length > 0) {
        userKotobaMap[k.id] = k.userKotoba[0];
      }
    });
  }

  return kotobaList.length > 0 ? (
    kotobaList.map((word) => {
      const userKotoba = userKotobaMap[word.id] || null;
      // ... sisanya sama
```

Dengan pendekatan ini:
- Semua kotoba tetap ditampilkan dari data referensi (`currentKanji.kotoba`)
- Status tracking user (`userKotoba`) diambil dari `currentProgressDetail` jika tersedia
- Jika user belum add kanji, semua kotoba tetap tampil tanpa status tracking (tombol "Add" muncul semua)

### Catatan Penting

- Pendekatan merge ini menghindari kebutuhan mengubah logic backend atau menambah API call baru.
- Pastikan skenario berikut berfungsi:
  1. User belum add kanji → semua kotoba tampil, semua tombol "Add" muncul
  2. User sudah add kanji, belum add kotoba → semua kotoba tampil, semua tombol "Add" muncul
  3. User sudah add kanji, sudah add beberapa kotoba → kotoba yang sudah di-add punya tombol toggle & remove, sisanya tombol "Add"

---

## Issue #4: Fix Bug Tombol "Add Kotoba" Tidak Berfungsi

**Tipe**: `Fix`
**Prioritas**: High
**File yang perlu diubah**: `frontend/src/pages/kanji/KanjiDetailPage.jsx`

### Deskripsi

Tombol "Add to Memorization List" (icon `+`) pada setiap kotoba di halaman `KanjiDetailPage` sudah ada dan visible (line 276-282), tetapi ketika diklik, kotoba **tidak berhasil ditambahkan** ke daftar hafalan user. Masalahnya ada pada cara state dikelola setelah operasi `addKotobaProgress` berhasil.

### Analisis Akar Masalah

Alur saat ini:
1. User klik tombol "+" → `handleAddKotoba(kotobaId)` dipanggil (line 104-106)
2. `addKotobaProgress(kotobaId)` di store memanggil `userKotobaService.add(kotobaId)` → **berhasil** di backend ✅
3. Store mengupdate `currentProgressDetail.kanji.kotoba` → menambahkan `userKotoba` ke kotoba yang sesuai ✅
4. **Tapi UI tidak berubah** ❌ → karena komponen merender dari `currentKanji.kotoba` (kanji-store), bukan dari `currentProgressDetail.kanji.kotoba` (user-progress-store)

Intinya: backend berhasil menyimpan data, store progress berhasil diupdate, tapi UI membaca dari sumber data yang **berbeda** (`currentKanji.kotoba` yang tidak punya `userKotoba`).

### Solusi

Solusi ini terkait langsung dengan Issue #3. Setelah merge data kotoba diimplementasikan (Issue #3), tombol add kotoba akan secara otomatis berfungsi karena:
1. `addKotobaProgress` memperbarui `currentProgressDetail.kanji.kotoba[x].userKotoba`
2. UI sekarang membaca `userKotoba` dari `currentProgressDetail` (melalui `userKotobaMap`)
3. Saat state berubah, React re-render dan tombol berubah dari "Add" menjadi "Toggle/Remove"

**Jadi Issue ini terselesaikan jika Issue #3 diimplementasikan dengan benar.**

### Verifikasi

Setelah Issue #3 selesai, pastikan skenario berikut berfungsi:
1. Buka halaman detail kanji yang sudah di-add user (misalnya `/kanji/uuid-1`)
2. Klik tombol "+" pada kotoba yang belum di-track
3. Tombol "+" berubah menjadi tombol toggle checklist dan tombol trash
4. Klik tombol checklist → status `isMemorized` berubah (toggle visual)
5. Klik tombol trash → muncul modal konfirmasi → setelah konfirmasi, tombol kembali ke "+"

### Skenario Tambahan: Add Kotoba Sebelum Add Kanji

Perlu diperhatikan: user mungkin ingin menambahkan kotoba ke hafalan **sebelum** menambahkan kanji ke daftar belajar. Pada kondisi ini, `currentProgressDetail` bernilai `null`.

**Rekomendasi**: Tampilkan tombol "Add" pada kotoba **hanya jika** user sudah menambahkan kanji (`currentProgressDetail !== null`). Jika belum, sembunyikan tombol kotoba atau tampilkan tooltip "Start learning this kanji first to track vocabulary".

Pertimbangan ini bersifat opsional, boleh diimplementasikan atau tidak. Jika tidak, pastikan `addKotobaProgress` menangani error 404 (kotoba progress tanpa kanji progress) dengan baik.

### Catatan Penting

- Issue ini bergantung pada Issue #3. Kerjakan Issue #3 terlebih dahulu.
- Tidak perlu mengubah backend atau store, hanya perbaikan pada cara data dibaca di komponen.

---

## Issue #5: Refresh Data Kanji List Setelah Add/Remove dari Detail

**Tipe**: `Fix`
**Prioritas**: Low
**File yang perlu diubah**: `frontend/src/stores/use-user-progress-store.js`

### Deskripsi

Setelah user melakukan `quickAddKanji` atau `removeKanjiProgress` dari halaman detail kanji, data di halaman Kanji List (`/kanji`) mungkin menjadi stale (tidak up-to-date). Khususnya field `userKanjis` pada setiap kanji yang menentukan indikator tracking (Issue #2).

### Solusi

Pada action `quickAddKanji` dan `removeKanjiProgress`, setelah operasi berhasil, panggil `useKanjiStore.getState().fetchKanjis()` untuk me-refresh data kanji list secara silent.

**Contoh perubahan pada `quickAddKanji`**:
```javascript
quickAddKanji: async (kanjiId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
    try {
        const result = await userKanjiService.add(kanjiId);
        const detailResult = await userKanjiService.getDetail(kanjiId);
        set({ currentProgressDetail: detailResult.data });

        // Refresh data kanji list agar indikator tracking di KanjiListPage terupdate
        useKanjiStore.getState().fetchKanjis();

        return result.data;
    } catch (error) { ... }
},
```

**Contoh perubahan pada `removeKanjiProgress`**:
```javascript
removeKanjiProgress: async (kanjiId) => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
    try {
        await userKanjiService.remove(kanjiId);
        // ... existing state cleanup ...

        // Refresh data kanji list agar indikator tracking di KanjiListPage terupdate
        useKanjiStore.getState().fetchKanjis();
    } catch (error) { ... }
},
```

### Catatan Penting

- Import `useKanjiStore` di file `use-user-progress-store.js` jika belum ada.
- Panggilan `fetchKanjis()` dilakukan secara fire-and-forget (tanpa `await`) agar tidak memperlambat operasi utama.
- Ini merupakan **nice-to-have**, karena data akan ter-refresh secara natural saat user kembali ke halaman Kanji List (karena `useEffect` di `KanjiListPage` sudah memanggil `fetchKanjis`). Namun jika user melakukan navigasi via browser back button, refresh ini memastikan data selalu terbaru.

---

## Ringkasan Urutan Pengerjaan

| Urutan | Issue | Prioritas | Catatan |
|--------|-------|-----------|---------|
| 1 | Issue #1: Halaman My Kanji | High | Independen, bisa dikerjakan pertama |
| 2 | Issue #2: Indikator di Kanji List | Medium | Independen, data backend sudah siap |
| 3 | Issue #3: Merge Data Kotoba | Medium | Wajib sebelum Issue #4 |
| 4 | Issue #4: Fix Add Kotoba | High | Otomatis selesai jika #3 benar |
| 5 | Issue #5: Refresh Kanji List | Low | Nice-to-have, opsional |
