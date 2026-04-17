# Standarisasi Pesan Error (Custom Error Zod)

## 1. Background & Tujuan
Saat ini, proyek oKanji sudah memakai validasi dari library ekosistem Zod (`zod`). Namun untuk sebagian besar konfigurasinya—terutama terkait pembatasan *maximum limit*—belum mendefinisikan kustomisasi peringatan dengan format Bahasa Indonesia.

Tujuan *issue* ini adalah untuk menambahkan pesan error custom dalam Bahasa Indonesia pada fungsi `.max()` (atau batas lain yang belum berbahasa Indonesia) di setiap skema validasi. Hal ini agar API senantiasa me-*return* informasi yang konsisten untuk kenyamanan pengguna (*user experience*), serta menjaga agar UI dapat menggunakan pesan API secara langsung.

## 2. Perubahan yang Diperlukan

Berikut adalah daftar file yang perlu diperbarui valuenya.

### **1. `backend/src/validation/user-validation.js`**
**Before (Register):**
```javascript
name: z.string().min(1, "Nama tidak boleh kosong").max(255),
email: z.string().email("Format email tidak valid").max(255),
password: z.string().min(8, "Password minimal 8 karakter").max(255),
```
**After (Register):**
```javascript
name: z.string().min(1, "Nama tidak boleh kosong").max(255, "Nama maksimal 255 karakter"),
email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
password: z.string().min(8, "Password minimal 8 karakter").max(255, "Password maksimal 255 karakter"),
```
*(Terapkan perlakuan yang persis sama untuk schema `loginUserValidation` pada parameter `email` dan `password` di file yang sama).*

### **2. `backend/src/validation/kanji-validation.js`**
**Before (List Kanji):**
```javascript
limit: z.coerce.number().min(1).max(100).default(20),
```
**After (List Kanji):**
```javascript
limit: z.coerce.number()
  .min(1, "Limit minimal adalah 1")
  .max(100, "Limit maksimal adalah 100")
  .default(20),
```
*(Tambahkan pesan `min(1, ...)` juga pada parameter `page`).*

### **3. `backend/src/validation/user-kanji-validation.js`**
**(Upsert Data Kanji):**
```javascript
// Tambahkan pesan custom pada error min dan max rating
difficulty: z.number()
  .min(1, "Tingkat kesulitan minimal 1")
  .max(5, "Tingkat kesulitan maksimal 5")
  .optional(),
```
**(List Kanji Pagination):**
```javascript
// Tambahkan constraint yang sama dengan kanji-validation
size: z.coerce.number()
  .min(1, "Size minimal adalah 1")
  .max(100, "Size maksimal adalah 100")
  .default(10),
```

## 3. Step-by-step Implementasi
1. Buka file `user-validation.js`, tambahkan argumen kedua pada fungsi `max` berupa string berbahasa Indonesia yang informatif.
2. Buka file `kanji-validation.js`, temukan limit, dan berikan pesan pada `min` dan `max`.
3. Buka file `user-kanji-validation.js`, dan lengkapi pesan eror untuk `difficulty` (max 5) dan `size` (max 100).
4. Pastikan unit test di branch Anda saat ini berjalan sukses menggunakan `bun test` usai Anda mengganti pesannya *(Anda difasilitasi kebebasan mengubah isi string, test suite kita dinamis dan tak akan break)*.

## 4. Acceptance Criteria
- [ ] Argument pesan *custom* berbahasa Indonesia disematkan pada seluruh batasan batas atas (max) karakter untuk pendaftaran dan login *user*.
- [ ] Argument pesan disertakan pada constraint limit paginasi (Kanji & User-Kanji api).
- [ ] Argument pesan disertakan pada constraint skala `difficulty` (skala maksimum 5).
- [ ] Bebas dari kata bawaan bahasa Inggris (seperti `String must contain at most 255 character(s)`).
- [ ] Unit Test `bun test` dikonfirmasi masih mencapai level *Success* hijau 100%.
