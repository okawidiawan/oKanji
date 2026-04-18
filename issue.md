# Feature: Penambahan Kolom Name pada Table User

## 1. Background & Tujuan
Saat ini, tabel `users` pada database hanya menyimpan `username`, `email`, dan `password`. Padahal pada pendaftaran (registrasi), payload menerima atribut `name` yang kini di-*mapping* secara paksa menjadi `username`. 

Tujuan dari perbaikan ini adalah menambahkan kolom (field) `name` secara eksplisit pada tabel `users` untuk menyimpan "Nama Asli / Display Name" dari pengguna. Sehingga antara `username` (sebagai identitas logik) dan `name` (sebagai label personalisasi) memiliki kedudukan yang independen.

## 2. Spesifikasi Teknis
- **Skema Database**: Menambahkan kolom `name` bertipe `String` (`VARCHAR(255)`) pada tabel `users` yang bersifat **Wajib (Not Null)**. Karena perubahan ini memengaruhi data lama yang tidak memiliki field `name`, instruksikan untuk menghapus seluruh data pengguna lama terlebih dahulu (*database reset*).
- **Service API Terpengaruh**:
  - `POST /api/users` (Register): Harus memasukkan data dari `request.name` ke kolom `name`.
  - `GET /api/users/current`: Harus menambahkan `name` ke dalam *select response* sehingga objek kembalian menjadi `{ "username": "...", "email": "...", "name": "..." }`.

## 3. Step-by-step Implementasi
Terdiri dari perubahan Skema, Logic, dan Testing. Patuhi urutan spesifik di bawah ini:

1. **`backend/prisma/schema.prisma`**
   - Hapus semua data di tabel `users` MySQL terlebih dahulu untuk menghindari *error migration* (bisa menggunakan GUI seperti DBeaver/TablePlus, atau melalui perintah reset Prisma).
   - Buka model `User`.
   - Tambahkan properti/field baru: `name String @db.VarChar(255)` tepat di bawah `username`.
   - Buka *terminal* pada folder `backend/`, lalu jalankan eksekusi pembaruan schema ke MySQL:
     `npx prisma db push --force-reset` (atau `--accept-data-loss` bila diperlukan untuk menghapus data lama dan menerapkan schema mutlak).

2. **`backend/src/services/user-service.js`**
   - Cari blok fungsi `register`.
   - Pada metode `prisma.user.create({ data: { ... } })`, tambahkan deklarasi *insert* untuk: `name: request.name`.
   - Bebaskan nilai `username` pada bagian insert (misalnya tetap menggunakan `request.name` atau dibiarkan saja bergantung instruksi yang sudah ada, asalkan kolom `name` ikut terisi).
   - Selanjutnya cari blok fungsi `get` (current user).
   - Pada metode pencariannya (`select`), tambahkan *property* `name: true`.

3. **`backend/tests/users-test.js`**
   - Sesuaikan ekspektasi mock *test* pada skenario `GET /api/users/current`.
   - Buka object mock `prismaMock.user.findUnique.mockResolvedValue` dan pastikan menambah *dummy data* `name: "Oka Widiawan"`.
   - Tambahkan asersi (`expect(response.body.data.name).toBe("Oka Widiawan");`) untuk membuktikan *field* baru berhasil dikirim sampai ke *client*.

## 4. Acceptance Criteria
- [ ] Kolom `name` berhasil ditambahkan di tabel `users` MySQL (dibuktikan via `prisma db push` sukses).
- [ ] Proses registrasi (`POST /api/users`) tidak *error* dan mampu menyimpan input nama pengguna ke dalam kolom `name`.
- [ ] Endpoint Get Current User mendistribusikan JSON response yang berisi parameter `name`.
- [ ] Tidak ada struktur *database* lain yang berubah di luar tabel `User`.
- [ ] Evaluasi pengujian unit (`bun test ./tests/users-test.js`) mencetak pesan *100% pass*.
