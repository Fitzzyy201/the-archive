const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const produk = await prisma.produk.findMany();
  console.log("Produk:", JSON.stringify(produk, null, 2));
  
  const user = await prisma.user.findMany();
  console.log("Users:", JSON.stringify(user, null, 2));
}

main().finally(()=>prisma.$disconnect())