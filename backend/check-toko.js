const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const toko = await prisma.tokoSeller.findMany({include:{user:true,produk:true}});
  console.log(JSON.stringify(toko,null,2));
}

main().finally(()=>prisma.$disconnect())