# Feature: Membuat Model Database Kanji

## Deskripsi Tugas
Tugas ini bertujuan untuk membangun struktur lapisan database untuk menyimpan data koleksi kanji. Entitas tabel `Kanji` yang dibuat akan berisi rincian huruf kanji, tingkat kesulitan (JLPT), cara baca (onyomi/kunyomi), serta artinya. 

## Spesifikasi Schema Database (Prisma)

Kamu perlu memodifikasi file `schema.prisma` dengan menambahkan *Enum* dan *Model/Table* baru sesuai spesifikasi di bawah.

1. **Enum JlptLevel**: Tipe data khusus untuk menjamin nilai tingkatan JLPT valid (misalnya hanya N5, N4, N3, N2, N1).
2. **Model Kanji**:
   - `id`: Tipe `String` yang dibentuk dari UUID, di-set sebagai *Primary Key*.
   - `character`: Tipe `String`, maksimal 10 karakter, bersifat `Unique`.
   - `jlptLevel`: Menggunakan tipe bentukan enum `JlptLevel`.
   - `onyomi`: Tipe `String`, batas maksimal 255 karakter.
   - `kunyomi`: Tipe `String`, batas maksimal 255 karakter.
   - `meaning`: Tipe `String`, batas diperbesar maksimal 500 karakter karena terjemahan bahasa bisa panjang.
   - `strokeCount`: Tipe angka `Integer` *(Opsional / Nullable)*, menyimpan rasio jumlah coretan kuas.
   - `radical`: Tipe `String`, maksimal 10 karakter *(Opsional / Nullable)*.
   - `createdAt`: Tipe `DateTime` dengan nilai default `now()`.

---

## Tahapan Implementasi (Panduan Untuk Junior Programmer / AI)

Silakan ikuti instruksi teknis di bawah dengan teliti:

### Tahap 1: Modifikasi File Prisma Schema
1. Buka file di dalam *directory codebase*: `backend/prisma/schema.prisma`.
2. Pertama, definisikan `enum` bernama `JlptLevel` (ini penting karena tipe data ini dipakai oleh model `Kanji`). Kamu bisa menaruhnya di bawah blok `model User` atau dekat awal baris.
   Formatnya:
   ```prisma
   enum JlptLevel {
     N5
     N4
     N3
     N2
     N1
   }
   ```
3. Kedua, deklarasikan bentuk blok skema tabelnya. Salin struktur dan relasi *database map* di bawah ini secara utuh:
   ```prisma
   model Kanji {
     id          String    @id @default(uuid())
     character   String    @unique @db.VarChar(10)  
     jlptLevel   JlptLevel
     onyomi      String    @db.VarChar(255)
     kunyomi     String    @db.VarChar(255)
     meaning     String    @db.VarChar(500)
     strokeCount Int?
     radical     String?   @db.VarChar(10)
     createdAt   DateTime  @default(now())
   
     // Kami membiasakan standarisasi nama tabel bentuk jamak/plural
     @@map("kanjis")
   }
   ```
   **Penting:** Perhatikan simbol tanda tanya `?` pada nilai `Int?` dan `String?` yang berarti nilainya boleh kosong (Not Required/Nullable).

### Tahap 2: Sinkronisasi ke Database (Migrasi)
Setelah kode Prisma selesai dimasukkan dan disimpan (`.prisma`), saatnya menerapkan struktur ini ke Server Database lokal mu.

1. Buka *terminal/command line* di direktori `backend/`.
2. Pastikan servis database MySQL menyala, dan file `.env` kamu terkonfigurasi dengan benar.
3. Jalankan sintaks:
   ```bash
   bun x prisma migrate dev --name create_kanji_table
   ```
4. Apabila berhasil, terminal akan memunculkan konfirmasi bahwa file SQL migrasi terbentuk di dalam folder `prisma/migrations/` dan *Prisma Client* yang baru berhasil di-*generate*.

### Tahap 3: Verifikasi
Uji periksa apakah migrasimu berhasil dengan menjalankan Prisma Studio.
- Jalankan perintah: `bun x prisma studio` (Bila di dalam folder backend).
- Buka browser yang terpampang di konsol dan periksa keberadaan tab tabel **`Kanji`**. Pastikan kolom opsional maupun validasinya tertata dengan benar sesuai susunan `schema.prisma`.
