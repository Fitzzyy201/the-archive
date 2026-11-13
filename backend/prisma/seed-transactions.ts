import { PrismaClient, StatusPesanan } from '@prisma/client';

const prisma = new PrismaClient();

const PAID_STATUSES: StatusPesanan[] = ['SELESAI', 'DIPROSES', 'DIKIRIM'];
const REFUND_STATUSES: StatusPesanan[] = ['DIBATALKAN', 'DITOLAK'];
const TOTALS = [75000, 120000, 149000, 210000, 275000, 340000, 499000, 850000];
const SEED_PREFIX = 'SEED-';

async function main() {
  const existing = await prisma.transaksi.count({
    where: { midtransOrderId: { startsWith: SEED_PREFIX } },
  });
  if (existing > 0) {
    console.log(
      `Data seed sudah ada (${existing} transaksi), tidak menambah duplikat.`,
    );
    return;
  }

  const buyers = await prisma.user.findMany({
    where: { role: 'Buyer' },
    select: { id: true },
  });
  const tokos = await prisma.tokoSeller.findMany({
    select: { id: true, userId: true },
  });

  if (buyers.length === 0 || tokos.length === 0) {
    throw new Error('Butuh minimal 1 buyer dan 1 toko di database.');
  }

  const now = new Date();
  const periods = [
    { year: now.getFullYear(), month: now.getMonth() - 1 },
    { year: now.getFullYear(), month: now.getMonth() },
  ];
  if (periods[0].month < 0) {
    periods[0] = { year: periods[0].year - 1, month: 11 };
  }

  let created = 0;

  for (const period of periods) {
    const daysInMonth = new Date(period.year, period.month + 1, 0).getDate();
    const isCurrentMonth =
      period.year === now.getFullYear() && period.month === now.getMonth();
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;

    for (let day = 1; day <= maxDay; day++) {
      const transaksiPerHari = day % 3 === 0 ? 2 : 1;

      for (let i = 0; i < transaksiPerHari; i++) {
        const toko = tokos[(day + i) % tokos.length];
        const buyer = buyers[(day + i) % buyers.length];
        const total = TOTALS[(day + i) % TOTALS.length];
        const waktuTransaksi = new Date(
          period.year,
          period.month,
          day,
          9 + ((day + i) % 10),
          (day * 7 + i * 13) % 60,
        );

        const isPaid = (day + i) % 5 !== 0;
        const status: StatusPesanan = isPaid
          ? PAID_STATUSES[(day + i) % PAID_STATUSES.length]
          : REFUND_STATUSES[(day + i) % REFUND_STATUSES.length];

        const produk = await prisma.produk.findFirst({
          where: { tokoId: toko.id },
          select: { id: true, harga: true },
        });

        await prisma.transaksi.create({
          data: {
            buyerId: buyer.id,
            tokoId: toko.id,
            totalHarga: total,
            statusPesanan: status,
            waktuTransaksi,
            midtransOrderId: `${SEED_PREFIX}${period.year}${String(period.month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}-${created}`,
            midtransStatus: isPaid ? 'settlement' : 'cancel',
            settledAt: isPaid ? waktuTransaksi : null,
            expiredAt: new Date(waktuTransaksi.getTime() + 15 * 60 * 1000),
            detail: produk
              ? {
                  create: [
                    {
                      produkId: produk.id,
                      qty: 1,
                      hargaSatuan: produk.harga,
                      subtotal: produk.harga,
                    },
                  ],
                }
              : undefined,
          },
        });

        created += 1;
      }
    }
  }

  console.log(`Berhasil menambahkan ${created} transaksi seed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
