import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@thearchive.com';
  const hashedPassword = await bcrypt.hash('ArchiveAdmin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      username: 'admin_utama',
      password: hashedPassword,
      role: 'Admin',
    },
    create: {
      username: 'admin_utama',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      noTelp: '-',
    },
  });

  console.log(
    `Akun Admin berhasil disiapkan! (Email: ${admin.email}, Username: ${admin.username})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
