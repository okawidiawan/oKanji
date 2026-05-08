---

# Issue: Feature: Implementasi Auth Store, API Service, dan Halaman Login/Register

## Tujuan

Membangun infrastruktur autentikasi frontend secara lengkap, mulai dari layer data (Zustand store dengan persist + API service) hingga layer UI (halaman Login dan Register yang fungsional). Setelah issue ini selesai, pengguna dapat melakukan registrasi akun baru, login untuk mendapatkan token, dan token tersimpan secara persisten di `localStorage` sehingga sesi tetap aktif setelah refresh halaman. Halaman yang dibuat cukup fungsional — tidak perlu dekorasi atau styling premium.

## Lokasi File

- `frontend/src/services/auth-service.js` **(Baru)** — Fungsi API call autentikasi
- `frontend/src/stores/use-auth-store.js` **(Modifikasi)** — Lengkapi store dengan persist middleware, state loading/error, dan integrasi service
- `frontend/src/lib/api.js` **(Modifikasi)** — Aktifkan request & response interceptor
- `frontend/src/layouts/AuthLayout.jsx` **(Modifikasi)** — Ganti placeholder menjadi layout fungsional
- `frontend/src/pages/auth/LoginPage.jsx` **(Modifikasi)** — Implementasi form login
- `frontend/src/pages/auth/RegisterPage.jsx` **(Modifikasi)** — Implementasi form registrasi
- `frontend/src/components/common/ProtectedRoute.jsx` **(Baru)** — Route guard untuk halaman yang butuh autentikasi
- `frontend/src/router/index.jsx` **(Modifikasi)** — Terapkan ProtectedRoute pada rute authorized

## Dependency & Prerequisite

- Backend API sudah running dan endpoint berikut sudah tersedia:
  - `POST /api/users` (Register)
  - `POST /api/users/login` (Login)
  - `GET /api/users/current` (Get Profile)
  - `DELETE /api/users/logout` (Logout)
- Zustand sudah terinstall dan `use-auth-store.js` sudah ada (scaffold).
- Axios sudah terkonfigurasi di `src/lib/api.js` (scaffold).
- React Router v7 sudah terkonfigurasi dengan rute `/auth/login` dan `/auth/register`.

## Referensi API Backend

### Register — `POST /api/users`

- **Request Body**: `{ username, name, email, password }`
- **Validasi**:
  - `username`: string, 3-100 karakter, wajib
  - `name`: string, 3-100 karakter, wajib
  - `email`: format email valid, wajib
  - `password`: string, min 8 karakter, wajib
- **Response Sukses** (201): `{ data: { username, name, email } }`
- **Response Error**: `{ error: "..." }` — pesan dalam Bahasa Indonesia

### Login — `POST /api/users/login`

- **Request Body**: `{ username, password }`
- **Response Sukses** (200): `{ data: { token, username, name, email } }`
- **Response Error**: `{ error: "..." }` — pesan dalam Bahasa Indonesia
- **Catatan**: Backend menerapkan **Single Session Login** — setiap login menimpa token sebelumnya (Keputusan Arsitektur #10). Client menerima token asli (belum di-hash).

### Get Current User — `GET /api/users/current`

- **Header**: `Authorization: Bearer <token>`
- **Response Sukses** (200): `{ data: { username, name, email } }`

### Logout — `DELETE /api/users/logout`

- **Header**: `Authorization: Bearer <token>`
- **Response Sukses** (200): `{ data: "OK" }`

---

## Step-by-Step Implementasi

### Step 1: Membuat Auth Service Layer

- **Apa yang dibuat**: `frontend/src/services/auth-service.js`
- **Method/Function**:
  - `register({ username, name, email, password })` — memanggil `POST /api/users`
  - `login({ username, password })` — memanggil `POST /api/users/login`
  - `getCurrentUser()` — memanggil `GET /api/users/current`
  - `logout()` — memanggil `DELETE /api/users/logout`
- **Hook yang digunakan**: Tidak ada (pure function).
- **State Management**: Tidak ada.
- **Catatan**:
  - Import instance `api` dari `src/lib/api.js`.
  - Setiap fungsi return `response.data` secara langsung (contoh: `const response = await api.post('/users/login', data); return response.data;`).
  - Jangan tangkap error di sini — biarkan error di-propagate ke caller (store/component) agar bisa ditampilkan ke user.

---

### Step 2: Melengkapi Auth Store dengan Persist Middleware

- **Apa yang dimodifikasi**: `frontend/src/stores/use-auth-store.js`
- **Method/Function**:
  - **State**: `user` (object|null), `token` (string|null), `isAuthenticated` (boolean), `isLoading` (boolean), `error` (string|null)
  - **Action `login(credentials)`**: Panggil `authService.login()`, simpan `token` dan `user` ke state. Set `isLoading` selama proses. Set `error` jika gagal (ambil dari `error.response.data.error` — pesan error backend sudah Bahasa Indonesia, langsung tampilkan).
  - **Action `register(userData)`**: Panggil `authService.register()`. Hanya return data sukses, jangan auto-login. Set `isLoading` dan `error` sama seperti login.
  - **Action `logout()`**: Panggil `authService.logout()`, lalu reset semua state ke nilai awal. Bungkus dalam try-catch — tetap reset state meskipun API call gagal (misal token sudah expired).
  - **Action `fetchCurrentUser()`**: Panggil `authService.getCurrentUser()` untuk me-refresh data user dari backend. Berguna saat app pertama kali load untuk validasi apakah token yang tersimpan masih valid.
  - **Action `clearError()`**: Reset state `error` ke null.
- **Hook yang digunakan**: Tidak ada (ini Zustand store, bukan komponen React).
- **State Management**: Zustand dengan `persist` middleware.
- **Catatan**:
  - Gunakan `persist` middleware dari `zustand/middleware` agar `token` dan `user` tersimpan di `localStorage`.
  - Konfigurasi `persist` hanya menyimpan field `token`, `user`, dan `isAuthenticated` — jangan simpan `isLoading` atau `error`.
  - Contoh pattern persist:
    ```js
    import { create } from 'zustand';
    import { persist } from 'zustand/middleware';

    const useAuthStore = create(
      persist(
        (set, get) => ({
          // state dan actions
        }),
        {
          name: 'auth-storage',
          partialize: (state) => ({
            token: state.token,
            user: state.user,
            isAuthenticated: state.isAuthenticated,
          }),
        }
      )
    );
    ```
  - Untuk action async, gunakan `try...catch...finally` pattern:
    ```js
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authService.login(credentials);
        set({ user: result.data, token: result.data.token, isAuthenticated: true });
      } catch (error) {
        const message = error.response?.data?.error || 'Terjadi kesalahan';
        set({ error: message });
        throw error; // re-throw agar component bisa handle
      } finally {
        set({ isLoading: false });
      }
    },
    ```

---

### Step 3: Mengaktifkan Axios Interceptor

- **Apa yang dimodifikasi**: `frontend/src/lib/api.js`
- **Method/Function**: Request interceptor dan response interceptor.
- **Hook yang digunakan**: Tidak ada.
- **State Management**: Akses Zustand store via `useAuthStore.getState()` (di luar komponen React).
- **Catatan**:
  - **Request Interceptor**: Ambil token dari `useAuthStore.getState().token`. Jika ada, tambahkan header `Authorization: Bearer ${token}` ke setiap request.
  - **Response Interceptor (error handler)**: Jika response status `401`, panggil `useAuthStore.getState().logout()` untuk membersihkan state tanpa memanggil API logout (karena token sudah tidak valid). Lalu redirect ke `/auth/login` menggunakan `window.location.href = '/auth/login'` (bukan `useNavigate`, karena ini di luar React component tree).
  - **Penting**: Untuk menghindari *circular import*, import `useAuthStore` secara *lazy* di dalam callback interceptor, ATAU pastikan urutan import tidak membentuk cycle. Cara paling aman adalah import di top-level karena Zustand store tidak bergantung pada `api.js` — yang bergantung pada `api.js` adalah `auth-service.js`, bukan store-nya.

---

### Step 4: Membangun AuthLayout yang Fungsional

- **Apa yang dimodifikasi**: `frontend/src/layouts/AuthLayout.jsx`
- **Method/Function**: `export default function AuthLayout()`
- **Hook yang digunakan**:
  - `useNavigate` dari `react-router` untuk redirect.
  - `useAuthStore` untuk cek status login.
- **State Management**: Zustand `useAuthStore` (hanya *read* `isAuthenticated`).
- **Catatan**:
  - Ganti placeholder dengan layout sederhana: centered container dengan `<Outlet />` di dalamnya.
  - Tambahkan pengecekan redirect: jika `isAuthenticated === true`, redirect ke `/kanji` menggunakan `useNavigate` di dalam `useEffect`.
  - Styling cukup minimal — yang penting form terletak di tengah halaman. Contoh: `min-h-screen`, `flex`, `items-center`, `justify-center`.

---

### Step 5: Implementasi Halaman Login

- **Apa yang dimodifikasi**: `frontend/src/pages/auth/LoginPage.jsx`
- **Method/Function**: `export default function LoginPage()`
- **Hook yang digunakan**:
  - `useState` dari `react` untuk state form (`username`, `password`).
  - `useNavigate` dari `react-router` untuk redirect setelah login sukses.
- **State Management**: `useAuthStore` — gunakan action `login()`, state `isLoading`, dan `error`.
- **Catatan**:
  - Buat form sederhana dengan dua input: `username` dan `password`.
  - Pada submit form:
    1. Panggil `login({ username, password })` dari auth store.
    2. Jika sukses, navigate ke `/kanji`.
    3. Jika error, tampilkan pesan error dari store (`error` state) di atas atau di bawah form.
  - Tambahkan link navigasi ke halaman register: `<Link to="/auth/register">Belum punya akun? Daftar</Link>`.
  - Disable tombol submit selama `isLoading === true`.
  - Panggil `clearError()` saat component mount atau saat user mulai mengetik, agar pesan error lama tidak mengganggu.
  - **Tidak perlu dekorasi** — cukup form fungsional yang bisa digunakan.

---

### Step 6: Implementasi Halaman Register

- **Apa yang dimodifikasi**: `frontend/src/pages/auth/RegisterPage.jsx`
- **Method/Function**: `export default function RegisterPage()`
- **Hook yang digunakan**:
  - `useState` dari `react` untuk state form (`username`, `name`, `email`, `password`).
  - `useNavigate` dari `react-router` untuk redirect setelah registrasi sukses.
- **State Management**: `useAuthStore` — gunakan action `register()`, state `isLoading`, dan `error`.
- **Catatan**:
  - Buat form dengan empat input: `username`, `name`, `email`, `password`.
  - Pada submit form:
    1. Panggil `register({ username, name, email, password })` dari auth store.
    2. Jika sukses, navigate ke `/auth/login` (jangan auto-login, biarkan user login manual agar flow-nya jelas).
    3. Jika error, tampilkan pesan error dari store.
  - Tambahkan link navigasi ke halaman login: `<Link to="/auth/login">Sudah punya akun? Masuk</Link>`.
  - Disable tombol submit selama `isLoading === true`.
  - **Tidak perlu dekorasi** — cukup form fungsional.

---

### Step 7: Membuat ProtectedRoute Component

- **Apa yang dibuat**: `frontend/src/components/common/ProtectedRoute.jsx`
- **Method/Function**: `export default function ProtectedRoute()`
- **Hook yang digunakan**:
  - `useAuthStore` untuk cek `isAuthenticated`.
- **State Management**: Zustand `useAuthStore` (hanya *read*).
- **Catatan**:
  - Komponen ini membungkus `<Outlet />` dari `react-router`.
  - Jika `isAuthenticated === false`, render `<Navigate to="/auth/login" replace />` dari `react-router`.
  - Jika `isAuthenticated === true`, render `<Outlet />` seperti biasa.
  - Contoh penggunaan di router:
    ```jsx
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            { path: "kanji", element: <KanjiListPage /> },
            // ...
          ],
        },
      ],
    }
    ```

---

### Step 8: Update Konfigurasi Router

- **Apa yang dimodifikasi**: `frontend/src/router/index.jsx`
- **Method/Function**: Update array rute di `createBrowserRouter`.
- **Hook yang digunakan**: Tidak ada.
- **State Management**: Tidak ada.
- **Catatan**:
  - Import `ProtectedRoute` dari `src/components/common/ProtectedRoute.jsx`.
  - Bungkus rute-rute yang membutuhkan autentikasi (di bawah `MainLayout`) dengan `ProtectedRoute`.
  - Struktur rute akhir:
    ```
    /                → LandingPage (public)
    /auth/login      → LoginPage (public, di bawah AuthLayout)
    /auth/register   → RegisterPage (public, di bawah AuthLayout)
    /kanji           → KanjiListPage (protected, di bawah MainLayout)
    /kanji/:id       → KanjiDetailPage (protected, di bawah MainLayout)
    /profile         → ProfilePage (protected, di bawah MainLayout)
    ```

---

## Struktur Komponen

```text
App
├── LandingPage (public, standalone)
├── AuthLayout (public)
│   ├── LoginPage
│   │   └── Form (username, password)
│   └── RegisterPage
│       └── Form (username, name, email, password)
└── ProtectedRoute (auth guard)
    └── MainLayout
        ├── KanjiListPage
        ├── KanjiDetailPage
        └── ProfilePage
```

## Alur Data & Interaksi

```text
[LoginPage] → useAuthStore.login()
                → authService.login() → api.post('/users/login')
                    → Backend response { data: { token, username, name, email } }
                → Store simpan token + user ke state + localStorage (persist)
                → Navigate ke /kanji

[Setiap API Call] → api interceptor
                    → Baca token dari useAuthStore.getState().token
                    → Inject header Authorization: Bearer <token>

[Error 401] → api response interceptor
                → useAuthStore.getState() → reset state (tanpa API call)
                → Redirect ke /auth/login

[App Refresh] → Zustand persist middleware
                → Otomatis restore token + user dari localStorage
                → isAuthenticated = true → user tetap login
```

## Catatan Arsitektur

1. **Jangan auto-login setelah register** — redirect ke halaman login agar alur lebih jelas dan user sadar bahwa akunnya berhasil dibuat.
2. **Persist middleware** hanya menyimpan `token`, `user`, dan `isAuthenticated` — state sementara (`isLoading`, `error`) tidak perlu disimpan.
3. **Logout di interceptor 401** hanya reset state lokal tanpa memanggil API `DELETE /api/users/logout`, karena jika dapat 401 artinya token sudah tidak valid di backend.
4. **Username bersifat immutable** — di-set saat registrasi dan tidak bisa diubah. Pastikan form register memiliki field username yang terpisah dari name.
5. **Error message dari backend sudah dalam Bahasa Indonesia** — langsung tampilkan ke user tanpa perlu diterjemahkan.
