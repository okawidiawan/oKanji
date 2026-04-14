# Peningkatan Kode: Perbaikan Schema, Logic Registrasi & Standarisasi Error Handling

## Deskripsi Tugas
Issue ini mencakup perbaikan skema database, penyesuaian logika validasi keamanan registrasi, serta peningkatan sistem penanganan error (Error Handling) agar lebih aman, terstandarisasi, dan *production-ready*.

## Spesifikasi Perubahan

### 1. Database Schema
Kini token autentikasi tidak harus diisi dengan *default value* berupa string kosong sejak awal (sebelum user login).
- Ubah definisi kolom `token` pada model `User` menjadi nullable:
  `token String? @unique @db.VarChar(255)`

### 2. Logic Registrasi
Memperbaiki bug pontesial ketika terjadi anomali banyak data pada DB yang menyebabkan nilai `countUser` tidak tepat 1.
- Ubah pengecekan validasi pada blok registrasi email di `user-service.js` dari `countUser === 1` menjadi `countUser > 0`.

### 3. Peningkatan Error Handling
Standarisasi format JSON error yang diberikan ke klien dan perlindungan dari kebocoran jejak *stack errors*.
- **Controlled Error**: Jika error adalah turunan/instansi `ResponseError` (error 400/401/404 yang dikelola), sampaikan pesan secara ramah pengguna (user-friendly).
- **Unexpected Error**: Jika error bukan dari `ResponseError` (bisa dari Prisma, Syntax, 500 dsb), lakukan pemblokiran pesan asli menuju klien dan timpa dengan balasan statis `"Internal Server Error"` pada mode Produksi.
- **Logging**: Rekam *stack* atau *message detail* dari error secara penuh menggunakan *winston* atau *console.error* hanya di terminal/console backend server. Jangan sampai terkirim (*send*) ke *response payload* client.
- **Standarisasi JSON**: Bungkus setiap pengembalian error dalam format `{ error: { code, message } }`. 
  Lalu, jika *environment* sedang tidak berada di `'production'`, sertakan rincian (*details/stack*) secara terpisah di JSON response.

---

## Tahapan Implementasi (Untuk Junior Programmer / AI Model)

Ikuti langkah teknis ini dengan hati-hati.

### Tahap 1: Perbarui Schema & Lakukan Migrasi
1. Buka file `backend/prisma/schema.prisma`.
2. Cari definisi data model `User`. Hapus atribut `@default("")` pada konfigurasi kolom `token`.
3. Tambahkan tanda tanya `?` di tipe data `String` untuk menjadikannya *nullable* (*optional*).
   Contoh kode baru: `token String? @unique @db.VarChar(255)`
4. Pastikan Docker/MySQL sedang berjalan lalu buka terminal di `backend/`.
5. Eksekusi deklarasi migrasinya melaui: `bun x prisma migrate dev --name alter_token_nullable`

### Tahap 2: Tambal Bug Pada Validasi Registrasi (`src/services/user-service.js`)
1. Buka file `backend/src/services/user-service.js`.
2. Pada fungsi `register`, scroll ke bagian *query count* ke Prisma untuk memastikan email valid/belum terdaftar.
3. Kamu akan menemukan baris kondisi: `if (countUser === 1)`. Ubah parameter kondisi tersebut ke versi yang lebih kuat: `if (countUser > 0)`.

### Tahap 3: Konstruksi Ulang Error Middleware (`src/error/error-middleware.js`)
1. Buka file sentral penanganan error: `backend/src/error/error-middleware.js`.
2. Di dalam *function* `errorMiddleware`, kumpulkan status *environment*:
   `const isProduction = process.env.NODE_ENV === 'production';`
3. Letakkan baris perintah untuk melayangkan *Logging Console Server* terlebih dahulu sebelum mengirim respons ke klien: 
   `console.error('[SERVER ERROR]:', err);` (Gunakan implementasi *winston* jika Anda berinisiatif men-*setup*-nya).
4. Buat penanganan dua alur format pengecekan error:
   - **Blok "if (err instanceof ResponseError)"**:
     Kirim status sesuai instansiat class (`err.status`) dan tanggapan berdasar kemasan:
     ```javascript
     res.status(err.status).json({
       error: {
         code: err.status,
         message: err.message
       }
     }).end();
     ```
   - **Blok *Else* (Unexpected Server Error / Format 500)**:
     Set respons ke kode 500. Jika variabel kondisi `isProduction` bernilai `true`, beri tanggapan `message` generik seperti: `"Internal Server Error"`. Jika bernilai `false`, beri message/detail jejak (*stack*) `err.message` aslinya.
     ```javascript
     const statusCode = 500;
     const errorMessage = isProduction ? "Internal Server Error" : err.message;
     const errorPayload = {
       code: statusCode,
       message: errorMessage
     };
     // Hanya tempel detail stack aslinya bagi para pengembang selama fase development
     if (!isProduction) {
       errorPayload.details = err.stack;
     }

     res.status(statusCode).json({ error: errorPayload }).end();
     ```
5. Simpan file `error-middleware.js`. Dengan modifikasi pada *Error Handler Global* ini, tidak perlu mengutak-atik lapisan *Controller* lagi karena blok *Catch* `next(e)` pada fungsi-fungsi controller sebelumnya akan mengeksekusi format ini dengan otomatis.
