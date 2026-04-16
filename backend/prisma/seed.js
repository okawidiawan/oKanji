// ============================================================
// Prisma Seed Script — Generated from kanjidic2.xml
// Jalankan: npx prisma db seed
//
// Setup di package.json:
// "prisma": { "seed": "node prisma/seed.js" }
//
// Pastikan file kanjidic2.xml ada di root project,
// atau sesuaikan path XML_PATH di bawah.
// ============================================================

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { XMLParser } from 'fast-xml-parser'

const prisma = new PrismaClient()

// Sesuaikan path ke file kanjidic2.xml
const XML_PATH = './kanjidic2.xml'

// Mapping JLPT lama (kanjidic2) ke format baru
const JLPT_MAP = {
  4: 'N5',
  3: 'N4',
  2: 'N3',
  1: 'N2', // N1 dan N2 digabung di kanjidic2, kita set N2 dulu
}

// Filter hanya level ini yang mau di-seed (hapus yang tidak perlu)
const JLPT_FILTER = ['N5', 'N4', 'N3', 'N2']

function parseKanjidic(xmlPath) {
  console.log('📖 Membaca file XML...')
  const xml = fs.readFileSync(xmlPath, 'utf-8')

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) =>
      ['character', 'reading', 'meaning', 'nanori', 'rad_value', 'cp_value'].includes(tagName),
  })

  console.log('🔄 Parsing XML...')
  const result = parser.parse(xml)
  const characters = result.kanjidic2.character

  console.log(`✅ Total karakter ditemukan: ${characters.length}`)

  const kanjis = []

  for (const char of characters) {
    // Ambil JLPT level (format lama)
    const jlptOld = char.misc?.jlpt
    if (!jlptOld) continue // Skip kanji tanpa JLPT level

    const jlptLevel = JLPT_MAP[jlptOld]
    if (!JLPT_FILTER.includes(jlptLevel)) continue

    // Karakter kanji
    const character = char.literal

    // Stroke count (ambil yang pertama)
    const strokeCount = Array.isArray(char.misc?.stroke_count)
      ? char.misc.stroke_count[0]
      : char.misc?.stroke_count ?? null

    // Radical
    const radValues = char.radical?.rad_value ?? []
    const classicalRad = radValues.find((r) => r['@_rad_type'] === 'classical')
    const radical = classicalRad ? String(classicalRad['#text'] ?? classicalRad) : null

    // Reading & Meaning
    const rmgroup = char.reading_meaning?.rmgroup
    if (!rmgroup) continue

    // Onyomi (ja_on)
    const readings = Array.isArray(rmgroup.reading) ? rmgroup.reading : rmgroup.reading ? [rmgroup.reading] : []
    const onyomiList = readings
      .filter((r) => r['@_r_type'] === 'ja_on')
      .map((r) => String(r['#text'] ?? r))
      .filter(Boolean)

    // Kunyomi (ja_kun)
    const kunyomiList = readings
      .filter((r) => r['@_r_type'] === 'ja_kun')
      .map((r) => String(r['#text'] ?? r))
      .filter(Boolean)

    // Meaning (bahasa Inggris saja, tanpa atribut m_lang)
    const meanings = Array.isArray(rmgroup.meaning) ? rmgroup.meaning : rmgroup.meaning ? [rmgroup.meaning] : []
    const meaningList = meanings
      .filter((m) => typeof m === 'string' || (typeof m === 'object' && !m['@_m_lang']))
      .map((m) => (typeof m === 'string' ? m : String(m['#text'] ?? '')))
      .filter(Boolean)

    if (meaningList.length === 0) continue

    kanjis.push({
      character,
      jlptLevel,
      onyomi: onyomiList.join(','),
      kunyomi: kunyomiList.join(','),
      meaning: meaningList.slice(0, 5).join(', '), // Ambil max 5 arti
      strokeCount: typeof strokeCount === 'number' ? strokeCount : null,
      radical,
    })
  }

  return kanjis
}

async function main() {
  console.log('\n🚀 Mulai seeding database...\n')

  const kanjis = parseKanjidic(XML_PATH)

  // Summary per level
  const summary = JLPT_FILTER.reduce((acc, level) => {
    acc[level] = kanjis.filter((k) => k.jlptLevel === level).length
    return acc
  }, {})

  console.log('📊 Kanji yang akan di-seed:')
  for (const [level, count] of Object.entries(summary)) {
    console.log(`   ${level}: ${count} kanji`)
  }
  console.log(`   Total: ${kanjis.length} kanji\n`)

  // Hapus data lama dulu (opsional, comment jika tidak mau reset)
  console.log('🗑️  Menghapus data kanji lama...')
  // await prisma.kotoba.deleteMany()
  // await prisma.userKanji.deleteMany()
  await prisma.kanji.deleteMany()

  // Insert dalam batch agar tidak timeout
  const BATCH_SIZE = 100
  let inserted = 0

  console.log('💾 Menyimpan data kanji...')
  for (let i = 0; i < kanjis.length; i += BATCH_SIZE) {
    const batch = kanjis.slice(i, i + BATCH_SIZE)
    await prisma.kanji.createMany({ data: batch, skipDuplicates: true })
    inserted += batch.length
    process.stdout.write(`\r   Progress: ${inserted}/${kanjis.length}`)
  }

  console.log('\n\n✅ Seeding selesai!')
  console.log(`   ${inserted} kanji berhasil disimpan ke database.`)
  console.log('\n💡 Tip: Untuk menambah kotoba, buat file seed terpisah')
  console.log('   dan referensikan kanji via field "character".\n')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
