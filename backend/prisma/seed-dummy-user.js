// ============================================================
// Seed Dummy User — User yang sudah menghafal 10 kanji N5
// Jalankan: node prisma/seed-dummy-user.js
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🚀 Membuat dummy user...\n");

  // 1. Buat user dummy
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "tanaka@example.com" },
    update: {},
    create: {
      username: "Tanaka Yuki",
      email: "tanaka@example.com",
      password: hashedPassword,
    },
  });

  console.log(`✅ User dibuat: ${user.username} (${user.email})`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Password: password123\n`);

  // 2. Ambil 10 kanji N5 dari database
  const kanjiN5 = await prisma.kanji.findMany({
    where: { jlptLevel: "N5" },
    take: 10,
    orderBy: { character: "asc" },
  });

  if (kanjiN5.length === 0) {
    console.log("❌ Tidak ada kanji N5 di database. Jalankan seed kanji dulu:");
    console.log("   npx prisma db seed\n");
    return;
  }

  console.log(`📚 Mengambil ${kanjiN5.length} kanji N5:\n`);

  // 3. Buat UserKanji records (sudah dihafal)
  const now = new Date();

  for (const kanji of kanjiN5) {
    const userKanji = await prisma.userKanji.upsert({
      where: {
        userId_kanjiId: {
          userId: user.id,
          kanjiId: kanji.id,
        },
      },
      update: {
        isMemorized: true,
        memorizedAt: now,
      },
      create: {
        userId: user.id,
        kanjiId: kanji.id,
        isMemorized: true,
        reviewCount: 3,
        difficulty: 2,
        lastReviewed: now,
        memorizedAt: now,
      },
    });

    console.log(
      `   ✅ ${kanji.character} — ${kanji.meaning} (${kanji.onyomi})`
    );
  }

  console.log(`\n🎉 Selesai! ${kanjiN5.length} kanji N5 ditandai sudah dihafal.`);
  console.log(`\n📋 Login info:`);
  console.log(`   Email:    tanaka@example.com`);
  console.log(`   Password: password123\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
