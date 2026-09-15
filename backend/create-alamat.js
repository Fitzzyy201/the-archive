const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alamat = await prisma.alamatPengiriman.create({
    data: {
      userId: 2,
      namaPenerima: "Test Buyer",
      kotaPenerima: "Jakarta",
      alamatLengkap: "Jl. Test No. 123",
      catatanKurir: "Test"
    }
  });
  console.log("Alamat created:", JSON.stringify(alamat, null, 2));
}

main().finally(()=>prisma.$disconnect())