const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Database Connectivity Test ---');
  const count = await prisma.user.count();
  console.log('Total users in DB:', count);

  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  console.log('Users by role:', roles);

  const booksCount = await prisma.book.count();
  console.log('Total books in DB:', booksCount);

  const ordersCount = await prisma.order.count();
  console.log('Total orders in DB:', ordersCount);

  // Check admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log('Admin account found:', admin?.email, '| Name:', admin?.name);

  // Check author user
  const author = await prisma.user.findFirst({ where: { role: 'AUTHOR' } });
  console.log('Author account found:', author?.email, '| Name:', author?.name);

  // Check student user
  const student = await prisma.user.findFirst({ where: { role: 'USER' } });
  console.log('Student account found:', student?.email, '| Name:', student?.name);

  console.log('✅ Database check completed successfully!');
}

run()
  .catch((err) => {
    console.error('DB test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
