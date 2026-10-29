import { PrismaClient, AuthorStatus, BookStatus, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoEmails = {
  admin: 'admin@demo.ebookhub.invalid',
  author: 'author@demo.ebookhub.invalid',
  pendingAuthor: 'applicant@demo.ebookhub.invalid',
  student: 'student@demo.ebookhub.invalid',
};
const demoBookSlugs = ['demo-intro-to-programming', 'demo-draft-programming-guide'];
const demoCategorySlug = 'demo-computer-science';

async function cleanDemoRecords() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: Object.values(demoEmails) } },
    select: { id: true },
  });
  const demoBooks = await prisma.book.findMany({
    where: { slug: { in: demoBookSlugs } },
    select: { id: true },
  });
  const [userOrders, bookOrders, bookReferences] = await Promise.all([
    prisma.order.count({ where: { userId: { in: demoUsers.map((user) => user.id) } } }),
    prisma.orderItem.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
    Promise.all([
      prisma.cartItem.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
      prisma.wishlistItem.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
      prisma.review.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
      prisma.readingProgress.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
      prisma.bookmark.count({ where: { bookId: { in: demoBooks.map((book) => book.id) } } }),
    ]).then((counts) => counts.reduce((total, count) => total + count, 0)),
  ]);

  if (userOrders > 0 || bookOrders > 0 || bookReferences > 0) {
    throw new Error('Demo accounts or books have activity history; cleanup stopped without deleting anything.');
  }

  await prisma.book.deleteMany({ where: { slug: { in: demoBookSlugs } } });
  await prisma.authorApplication.deleteMany({
    where: { user: { email: demoEmails.pendingAuthor } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: Object.values(demoEmails) } },
  });

  const remainingBooks = await prisma.book.count({ where: { category: { slug: demoCategorySlug } } });
  if (remainingBooks === 0) {
    await prisma.category.deleteMany({ where: { slug: demoCategorySlug } });
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development demo data cannot be seeded in production.');
  }

  if (process.argv.includes('--cleanup')) {
    await cleanDemoRecords();
    console.log('Removed only eBookHub development demo records.');
    return;
  }

  const passwordHash = await bcrypt.hash('DemoOnly@123', 12);
  const category = await prisma.category.upsert({
    where: { slug: demoCategorySlug },
    update: { name: 'Demo Computer Science' },
    create: {
      name: 'Demo Computer Science',
      slug: demoCategorySlug,
      description: 'Clearly labeled development demonstration content.',
      icon: 'Code',
    },
  });

  await prisma.user.upsert({
    where: { email: demoEmails.admin },
    update: {},
    create: {
      email: demoEmails.admin,
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      profile: { create: { fullName: 'Demo Administrator' } },
    },
  });

  const authorUser = await prisma.user.upsert({
    where: { email: demoEmails.author },
    update: {},
    create: {
      email: demoEmails.author,
      passwordHash,
      role: Role.AUTHOR,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      profile: { create: { fullName: 'Demo Author' } },
      authorProfile: {
        create: {
          fullName: 'Demo Author',
          bio: 'A fictional profile used only for local development.',
          expertise: ['Programming'],
          status: AuthorStatus.APPROVED,
        },
      },
    },
    include: { authorProfile: true },
  });

  const authorProfile = authorUser.authorProfile ?? await prisma.authorProfile.findUniqueOrThrow({
    where: { userId: authorUser.id },
  });

  const applicant = await prisma.user.upsert({
    where: { email: demoEmails.pendingAuthor },
    update: {},
    create: {
      email: demoEmails.pendingAuthor,
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      profile: { create: { fullName: 'Demo Applicant' } },
      authorProfile: {
        create: {
          fullName: 'Demo Applicant',
          bio: 'A fictional development-only author application.',
          expertise: ['Education'],
          status: AuthorStatus.PENDING,
        },
      },
      authorApplications: {
        create: {
          fullName: 'Demo Applicant',
          email: demoEmails.pendingAuthor,
          bio: 'A fictional development-only author application.',
          expertise: ['Education'],
          status: AuthorStatus.PENDING,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: demoEmails.student },
    update: {},
    create: {
      email: demoEmails.student,
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      profile: { create: { fullName: 'Demo Student' } },
    },
  });

  await prisma.book.upsert({
    where: { slug: demoBookSlugs[0] },
    update: {},
    create: {
      slug: demoBookSlugs[0],
      title: 'Demo Introduction to Programming',
      description: 'A fictional sample title for local development. Not a real publication.',
      categoryId: category.id,
      authorId: authorProfile.id,
      price: 10000,
      language: 'English',
      status: BookStatus.APPROVED,
    },
  });

  await prisma.book.upsert({
    where: { slug: demoBookSlugs[1] },
    update: {},
    create: {
      slug: demoBookSlugs[1],
      title: 'Demo Draft Programming Guide',
      description: 'A fictional pending sample for moderation workflow development.',
      categoryId: category.id,
      authorId: authorProfile.id,
      price: 10000,
      language: 'English',
      status: BookStatus.PENDING_APPROVAL,
    },
  });

  console.log('Development demo records are ready.');
  console.log('Demo login for all roles: DemoOnly@123');
  console.log(`Administrator: ${demoEmails.admin}`);
  console.log(`Approved author: ${demoEmails.author}`);
  console.log(`Pending author application: ${demoEmails.pendingAuthor} (user ${applicant.id})`);
  console.log(`Student: ${demoEmails.student}`);
}

main()
  .catch((error) => {
    console.error('Development seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
