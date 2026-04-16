# Migrasi dari CommonJS ke ES Modules (import/export)

## Deskripsi Tugas

Project backend oKanji saat ini menggunakan **CommonJS** (`require` / `module.exports`). Kita akan migrasi ke **ES Modules** (`import` / `export`) agar sesuai dengan standar modern JavaScript.

## Kenapa Perlu Migrasi?

- ES Modules adalah standar resmi JavaScript (bukan hanya Node.js)
- Mendukung **tree-shaking** (mengurangi bundle size)
- Syntax lebih bersih dan konsisten
- Lebih mudah jika nanti migrasi ke TypeScript

---

## Daftar File yang Harus Diubah (15 file)

### Source Code (`src/`)
1. `src/index.js`
2. `src/application/database.js`
3. `src/application/web.js`
4. `src/controller/user-controller.js`
5. `src/controller/user-kanji-controller.js`
6. `src/error/error-middleware.js`
7. `src/error/response-error.js`
8. `src/middleware/auth-middleware.js`
9. `src/routes/user-route.js`
10. `src/routes/user-kanji-route.js`
11. `src/services/user-service.js`
12. `src/services/user-kanji-service.js`
13. `src/validation/user-validation.js`
14. `src/validation/user-kanji-validation.js`

### Prisma
15. `prisma/seed.js`

### Konfigurasi
16. `package.json`

---

## Tahapan Implementasi (Step-by-Step)

### 1. Update `package.json`

Tambahkan `"type": "module"` di `package.json` agar Node.js memperlakukan semua file `.js` sebagai ES Modules:

```json
{
  "name": "backend",
  "type": "module",
  "main": "src/index.js",
  ...
}
```

> ⚠️ **PENTING**: Setelah langkah ini, **SEMUA** file `.js` yang masih pakai `require` akan error. Jadi pastikan langkah 2 dikerjakan juga sebelum testing.

---

### 2. Konversi Semua File

Untuk setiap file, lakukan 2 perubahan:

#### A. Ganti `require()` → `import`

**Sebelum (CommonJS):**
```js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { ResponseError } = require('../error/response-error');
```

**Sesudah (ES Module):**
```js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ResponseError } from '../error/response-error.js';
```

> ⚠️ **PENTING**: Di ES Modules, import file lokal **HARUS pakai ekstensi `.js`**.
> - ✅ `import { prisma } from '../application/database.js'`
> - ❌ `import { prisma } from '../application/database'` ← AKAN ERROR!
>
> Import dari `node_modules` (library) **TIDAK perlu ekstensi**:
> - ✅ `import express from 'express'`

#### B. Ganti `module.exports` → `export`

**Sebelum (CommonJS):**
```js
module.exports = { register, login };
```

**Sesudah (ES Module):**
```js
export { register, login };
```

Atau bisa juga langsung export di deklarasi fungsi:
```js
export const register = async (request) => { ... };
```

---

### 3. Perhatian Khusus Per File

#### `src/application/web.js`
```js
// SEBELUM
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// SESUDAH
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
```

#### `src/index.js`
```js
// SEBELUM
require('dotenv').config();
const { app } = require('./application/web');

// SESUDAH
import 'dotenv/config';
import { app } from './application/web.js';
```

> ⚠️ Perhatikan bahwa `require('dotenv').config()` berubah menjadi `import 'dotenv/config'` (bukan `import dotenv from 'dotenv'`).

#### `src/error/response-error.js`
```js
// SEBELUM
class ResponseError extends Error { ... }
module.exports = { ResponseError };

// SESUDAH
export class ResponseError extends Error { ... }
```

#### `src/services/user-service.js`
```js
// SEBELUM
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

// SESUDAH
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
```

> ⚠️ Perhatikan: `{ v4: uuid }` (destructuring CommonJS) berubah menjadi `{ v4 as uuid }` (ES Module rename syntax).

#### `prisma/seed.js`
```js
// SEBELUM
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

// SESUDAH
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
```

Dan juga ubah seed script di `package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```
Ini tidak perlu diganti karena Node.js sudah tahu bahwa file `.js` adalah ES Module dari setting `"type": "module"`.

---

### 4. Testing

Setelah semua file selesai dikonversi, lakukan test:

1. **Jalankan server**:
   ```bash
   bun run dev
   ```
   Pastikan server bisa start tanpa error.

2. **Test endpoint**:
   - `GET /api/health` → harus return `{ status: 'OK', message: 'Backend is running' }`
   - `POST /api/users` dengan body kosong `{}` → harus return 400 Validation Error
   - `GET /api/user-kanji` tanpa header Authorization → harus return 401 Unauthorized

3. **Test seed** (opsional):
   ```bash
   npx prisma db seed
   ```

---

### 5. Checklist Sebelum Commit

- [ ] Semua `require()` sudah diganti dengan `import`
- [ ] Semua `module.exports` sudah diganti dengan `export`
- [ ] Semua import file lokal sudah pakai ekstensi `.js`
- [ ] `"type": "module"` sudah ditambahkan di `package.json`
- [ ] `require('dotenv').config()` sudah diganti `import 'dotenv/config'`
- [ ] `{ v4: uuid }` sudah diganti `{ v4 as uuid }`
- [ ] Server bisa start tanpa error
- [ ] Semua endpoint berfungsi normal

---

**Catatan untuk Implementator**: Kerjakan satu folder dalam satu waktu (misal: `application/` dulu, lalu `error/`, lalu `validation/`, dst.). Jangan test sebelum SEMUA file selesai dikonversi, karena mencampur CommonJS dan ES Modules dalam satu project akan menyebabkan error.
