# Refactor: Migrasi useEffect ke React Router v7 Loader & Custom Hook

## Ringkasan

Saat ini semua halaman (pages) di frontend menggunakan `useEffect` untuk data fetching, redirect, dan side effect lainnya. Ini bisa disederhanakan dan dibuat lebih idiomatis dengan memanfaatkan fitur **React Router v7 `loader`** dan **custom hook**.

**Jumlah useEffect yang akan dimigrasi: 7 buah** (di 6 halaman).

**Branch**: `refactor/migrate-useeffect`

---

## Daftar Perubahan

### Task 1: Buat Custom Hook `useDebounce`

> **File baru**: `frontend/src/hooks/useDebounce.js`

Buat custom hook sederhana untuk menangani debounce value. Hook ini menggantikan pola `useEffect` + `setTimeout` yang ada di `KanjiListPage.jsx`.

**Spesifikasi Hook:**
- Nama: `useDebounce(value, delay)`
- Parameter:
  - `value` — nilai yang ingin di-debounce (tipe apapun)
  - `delay` — waktu tunggu dalam milidetik (number)
- Return: `debouncedValue` — nilai yang sudah di-debounce
- Logika: Gunakan `useEffect` + `setTimeout` secara internal. Setiap kali `value` berubah, set timeout baru. Cleanup timeout lama saat value berubah lagi atau komponen unmount.

**Contoh penggunaan nanti:**
```jsx
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Dokumentasi:** Tambahkan komentar berbahasa Indonesia di atas fungsi, jelaskan kegunaan hook ini.

---

### Task 2: Migrasi `LandingPage.jsx` — Hapus useEffect Redirect

> **File yang diubah**: `frontend/src/router/index.jsx`, `frontend/src/pages/LandingPage.jsx`

**Kondisi sekarang:**
```jsx
// LandingPage.jsx (baris 15-19)
useEffect(() => {
  if (isAuthenticated) {
    navigate("/profile", { replace: true });
  }
}, [isAuthenticated, navigate]);
```

**Yang harus dilakukan:**

1. Di `router/index.jsx`, tambahkan property `loader` pada route `/`:
   ```jsx
   {
     path: "/",
     element: <LandingPage />,
     loader: () => {
       const { isAuthenticated } = useAuthStore.getState();
       if (isAuthenticated) {
         return redirect("/profile");
       }
       return null;
     },
   },
   ```
   > **Catatan penting**: Import `redirect` dari `react-router-dom`. Panggil `useAuthStore.getState()` (bukan hook `useAuthStore()`) karena loader bukan React component.

2. Di `LandingPage.jsx`:
   - Hapus import `useEffect` (jika tidak dipakai di tempat lain)
   - Hapus import `useNavigate` dari `react-router`
   - Hapus import `useAuthStore`
   - Hapus seluruh blok `useEffect` dan variabel `navigate`, `isAuthenticated`
   - Komponen menjadi murni render saja (tidak ada state/effect)

---

### Task 3: Migrasi `LoginPage.jsx` & `RegisterPage.jsx` — Hapus useEffect clearError

> **File yang diubah**: `frontend/src/router/index.jsx`, `frontend/src/pages/auth/LoginPage.jsx`, `frontend/src/pages/auth/RegisterPage.jsx`

**Kondisi sekarang (sama di kedua file):**
```jsx
useEffect(() => {
  clearError();
}, [clearError]);
```

**Yang harus dilakukan:**

1. Di `router/index.jsx`, tambahkan `loader` pada route `login` dan `register`:
   ```jsx
   {
     path: "auth",
     element: <AuthLayout />,
     children: [
       {
         path: "login",
         element: <LoginPage />,
         loader: () => {
           useAuthStore.getState().clearError();
           return null;
         },
       },
       {
         path: "register",
         element: <RegisterPage />,
         loader: () => {
           useAuthStore.getState().clearError();
           return null;
         },
       },
     ],
   },
   ```

2. Di `LoginPage.jsx`:
   - Hapus blok `useEffect` (baris 19-22)
   - **Pertahankan** `clearError` di destructuring store — karena masih dipakai di `handleChange` (baris 28)
   - Hapus import `useEffect` dari React. Ubah baris 1 menjadi: `import { useState } from "react";`

3. Di `RegisterPage.jsx`:
   - Lakukan hal yang sama persis seperti LoginPage
   - Hapus blok `useEffect` (baris 28-31)
   - **Pertahankan** `clearError` di destructuring store — masih dipakai di `handleChange` (baris 36)
   - Hapus import `useEffect` dari React. Ubah baris 1 menjadi: `import { useState } from "react";`

---

### Task 4: Migrasi `KanjiListPage.jsx` — Ganti useEffect Debounce dengan Custom Hook

> **File yang diubah**: `frontend/src/pages/kanji/KanjiListPage.jsx`

**Kondisi sekarang — ada 2 useEffect:**

```jsx
// Effect 1: Debounce search (baris 10-16)
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    setFilters({ search: searchTerm });
  }, 500);
  return () => clearTimeout(delayDebounceFn);
}, [searchTerm, setFilters]);

// Effect 2: Fetch data (baris 18-20)
useEffect(() => {
  fetchKanjis(paging.page);
}, [paging.page, filters]);
```

**Yang harus dilakukan:**

1. **Ganti Effect 1** dengan custom hook `useDebounce` (dari Task 1):
   ```jsx
   import useDebounce from "../../hooks/useDebounce";

   // Di dalam komponen:
   const debouncedSearch = useDebounce(searchTerm, 500);

   // Lalu gunakan useEffect BARU yang lebih bersih untuk sync ke store:
   useEffect(() => {
     setFilters({ search: debouncedSearch });
   }, [debouncedSearch, setFilters]);
   ```
   > **Catatan**: useEffect ini masih ada, tapi sekarang jauh lebih bersih — hanya 1 baris, tanpa setTimeout manual. Logika debounce sudah dienkapsulasi di hook.

2. **Effect 2 tetap dipertahankan** — fetch data di halaman ini bergantung pada perubahan `filters` dan `paging.page` yang bisa berubah secara interaktif (bukan hanya saat pertama kali load). Loader hanya berjalan saat navigasi, sedangkan filter/pagination berubah tanpa navigasi ulang. Jadi effect ini **tetap diperlukan**.

3. **Hapus** import `useEffect` yang lama hanya jika sudah tidak dipakai (dalam kasus ini masih dipakai, jadi tetap pertahankan).

---

### Task 5: Migrasi `KanjiDetailPage.jsx` — Ganti useEffect Fetch dengan Loader

> **File yang diubah**: `frontend/src/router/index.jsx`, `frontend/src/pages/kanji/KanjiDetailPage.jsx`

**Kondisi sekarang:**
```jsx
// baris 31-38
useEffect(() => {
  if (id) {
    fetchKanjiDetail(id);
    if (isAuthenticated) {
      fetchProgressDetail(id);
    }
  }
}, [id, isAuthenticated]);
```

**Yang harus dilakukan:**

1. Di `router/index.jsx`, tambahkan `loader` pada route `kanji/:id`:
   ```jsx
   {
     path: "kanji/:id",
     element: <KanjiDetailPage />,
     loader: ({ params }) => {
       const { isAuthenticated } = useAuthStore.getState();
       useKanjiStore.getState().fetchKanjiDetail(params.id);
       if (isAuthenticated) {
         useUserProgressStore.getState().fetchProgressDetail(params.id);
       }
       return null;
     },
   },
   ```
   > **Catatan penting**: Karena `fetchKanjiDetail` dan `fetchProgressDetail` adalah async, kita **tidak perlu await** di sini. Store sudah mengatur `isLoading` secara internal, dan komponen sudah menampilkan loading spinner berdasarkan `isLoading`. Loader cukup *trigger* fetch-nya saja (fire-and-forget).

   > **Import yang perlu ditambahkan di `router/index.jsx`**:
   > ```jsx
   > import useAuthStore from "../stores/use-auth-store";
   > import useKanjiStore from "../stores/use-kanji-store";
   > import useUserProgressStore from "../stores/use-user-progress-store";
   > ```

2. Di `KanjiDetailPage.jsx`:
   - Hapus seluruh blok `useEffect` (baris 31-38)
   - Hapus import `useEffect` dari React. Ubah baris 1 menjadi: `import { useState } from "react";`
   - **JANGAN hapus** import `useParams` — masih dibutuhkan oleh handler lain (`handleQuickAdd`, `handleToggleMemorized`, dll) yang menggunakan `id`
   - **JANGAN hapus** `isAuthenticated` dari `useAuthStore` — masih dipakai di JSX untuk conditional rendering tombol
   - **JANGAN hapus** `fetchKanjiDetail` dan `fetchProgressDetail` dari destructuring store — hanya hapus blok `useEffect` saja

---

### Task 6: Migrasi `UserKanjiListPage.jsx` — Pisahkan Initial Load ke Loader

> **File yang diubah**: `frontend/src/router/index.jsx`, `frontend/src/pages/user/UserKanjiListPage.jsx`

**Kondisi sekarang:**
```jsx
// baris 30-37
useEffect(() => {
  const params = { page: paging.page || 1 };
  if (filterMemorized === "memorized") params.isMemorized = true;
  if (filterMemorized === "learning") params.isMemorized = false;
  fetchUserKanjis(params);
}, [paging.page, filterMemorized]);
```

**Yang harus dilakukan:**

Halaman ini memiliki filter interaktif (`filterMemorized`) yang berubah tanpa navigasi ulang, mirip seperti KanjiListPage. Oleh karena itu:

1. Di `router/index.jsx`, tambahkan `loader` pada route `my-kanji` untuk **initial load** saja:
   ```jsx
   {
     path: "my-kanji",
     element: <UserKanjiListPage />,
     loader: () => {
       useUserProgressStore.getState().fetchUserKanjis({ page: 1 });
       return null;
     },
   },
   ```

2. Di `UserKanjiListPage.jsx`:
   - **Ubah** useEffect agar hanya merespons perubahan filter (bukan initial load):
     ```jsx
     useEffect(() => {
       const params = { page: 1 };
       if (filterMemorized === "memorized") params.isMemorized = true;
       if (filterMemorized === "learning") params.isMemorized = false;
       fetchUserKanjis(params);
     }, [filterMemorized]);
     ```
   - Hapus `paging.page` dari dependency array karena initial load sudah ditangani loader, dan perubahan halaman sudah ditangani oleh `handlePageChange` yang memanggil `fetchUserKanjis` secara langsung.

---

## Ringkasan Perubahan File

| File | Aksi |
|---|---|
| `frontend/src/hooks/useDebounce.js` | **BARU** — Custom hook debounce |
| `frontend/src/router/index.jsx` | **UBAH** — Tambah loader di 5 route, tambah import store & redirect |
| `frontend/src/pages/LandingPage.jsx` | **UBAH** — Hapus useEffect, hapus import yang tidak perlu |
| `frontend/src/pages/auth/LoginPage.jsx` | **UBAH** — Hapus blok useEffect, hapus import useEffect |
| `frontend/src/pages/auth/RegisterPage.jsx` | **UBAH** — Hapus blok useEffect, hapus import useEffect |
| `frontend/src/pages/kanji/KanjiListPage.jsx` | **UBAH** — Ganti debounce manual dengan `useDebounce` hook |
| `frontend/src/pages/kanji/KanjiDetailPage.jsx` | **UBAH** — Hapus useEffect fetch, hapus import useEffect |
| `frontend/src/pages/user/UserKanjiListPage.jsx` | **UBAH** — Ubah useEffect, hapus dependency `paging.page` |

## Catatan Penting

1. **Jangan ubah logika bisnis atau tampilan UI** — refactor ini hanya mengubah *di mana* dan *bagaimana* side effect dipanggil, bukan *apa* yang dilakukan.
2. **Semua store action tetap sama** — tidak ada perubahan di file `stores/`.
3. **Pastikan setiap task di-test manual** — buka halaman terkait, pastikan data tetap muncul dengan benar, filter dan pagination tetap berfungsi.
4. **Kerjakan secara berurutan** dari Task 1 sampai Task 6, karena Task 4 bergantung pada Task 1.
5. **Import `redirect`** dari `react-router-dom` di `router/index.jsx` (dibutuhkan di Task 2).
6. Di `router/index.jsx`, loader mengakses store via `.getState()` (bukan hook), karena loader **bukan** React component.

## Verifikasi

Setelah semua task selesai, pastikan:
- [ ] Halaman Landing: user yang sudah login otomatis diarahkan ke `/profile`
- [ ] Halaman Login/Register: tidak ada error lama yang muncul saat berpindah halaman
- [ ] Halaman Kanji List: search debounce berfungsi (ketik → tunggu 500ms → hasil muncul), filter level dan sorting berfungsi, pagination berfungsi
- [ ] Halaman Kanji Detail: data kanji dan progress muncul saat halaman dibuka
- [ ] Halaman My Kanji: data muncul saat pertama kali buka, filter Memorized/Learning berfungsi, pagination berfungsi
- [ ] Tidak ada error di console browser
- [ ] Aplikasi bisa dijalankan tanpa crash (`bun run dev` di folder frontend)
