/**
 * Normalisasi nomor telepon yang sudah ada di database ke format +62.
 *
 * Aturan:
 * - 08xxx / 03xxx -> +628xxx / +623xxx
 * - 628xxx        -> +628xxx
 * - 8xxx          -> +628xxx
 * - +62xxx        -> tidak diubah
 * - Nilai yang tidak wajar ("-", kosong, atau kepanjangan setelah
 *   dinormalisasi) -> TIDAK diubah, hanya dilaporkan.
 *
 * Jalankan: node scripts/normalize-phone.js
 */
const path = require('path');
const backendRoot = path.join(__dirname, '..');
require(path.join(backendRoot, 'node_modules/dotenv')).config({
  path: path.join(backendRoot, '.env'),
});
const { PrismaClient } = require(path.join(backendRoot, 'node_modules/@prisma/client'));

const prisma = new PrismaClient();

function normalizePhone(raw) {
  if (typeof raw !== 'string') return null;
  const value = raw.replace(/[\s-]/g, '');
  if (!value) return null;

  let normalized;
  if (value.startsWith('+62')) normalized = value;
  else if (value.startsWith('0')) normalized = `+62${value.slice(1)}`;
  else if (value.startsWith('62')) normalized = `+62${value.slice(2)}`;
  else if (/^\d/.test(value)) normalized = `+62${value}`;
  else return null;

  // Valid: +62 diikuti 8-12 digit (total 10-14 digit angka)
  if (!/^\+62\d{8,12}$/.test(normalized)) return null;
  return normalized;
}

async function processRows(label, rows, update) {
  let changed = 0;
  const skipped = [];

  for (const row of rows) {
    const before = row.noTelp;
    const after = normalizePhone(before);

    if (after && after !== before) {
      await update(row.id, after);
      changed += 1;
      console.log(`  [UBAH] ${label} #${row.id}: "${before}" -> "${after}"`);
    } else if (!after && before && !/^\+62\d{8,12}$/.test(before)) {
      skipped.push(`  [LEWAT] ${label} #${row.id}: "${before}"`);
    }
  }

  return { changed, skipped };
}

async function main() {
  console.log('=== Normalisasi nomor telepon ke format +62 ===');

  const users = await prisma.user.findMany({
    select: { id: true, noTelp: true },
  });
  const tokos = await prisma.tokoSeller.findMany({
    select: { id: true, noTelp: true },
  });

  const userResult = await processRows('user', users, (id, noTelp) =>
    prisma.user.update({ where: { id }, data: { noTelp } }),
  );
  const tokoResult = await processRows('toko', tokos, (id, noTelp) =>
    prisma.tokoSeller.update({ where: { id }, data: { noTelp } }),
  );

  console.log('');
  console.log(`Selesai. user diubah: ${userResult.changed}, toko diubah: ${tokoResult.changed}`);

  const skipped = [...userResult.skipped, ...tokoResult.skipped];
  if (skipped.length > 0) {
    console.log('');
    console.log('Data di bawah TIDAK diubah (tidak valid / kepanjangan), perbaiki manual:');
    skipped.forEach((line) => console.log(line));
  }
}

main()
  .catch((e) => {
    console.error('GAGAL:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
