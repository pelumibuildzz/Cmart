const { PrismaClient } = require('../../src/generated/prisma');
const { Role } = require("../../src/lib/constants.ts");

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.university.deleteMany();

  console.log('Database cleared');

  // Create universities
  const university1 = await prisma.university.create({
    data: {
      name: 'University of Technology',
    },
  });

  const university2 = await prisma.university.create({
    data: {
      name: 'State University',
    },
  });

  console.log('Universities created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Food',
      },
    }),
  ]);

  console.log('Categories created');

  // Create users
  const normalUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.USER,
    },
  });

  const businessUser = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'business@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.BUSINESS,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.ADMIN,
    },
  });

  console.log('Users created');

  // Create business
  const business = await prisma.business.create({
    data: {
      name: 'Campus Tech Store',
      description: 'We sell the latest tech gadgets for students',
      universityId: university1.id,
      categoryId: categories[0].id,
      userId: businessUser.id,
      isVerified: true,
    },
  });

  // Update business user with businessId
  await prisma.user.update({
    where: { id: businessUser.id },
    data: { businessId: business.id },
  });

  console.log('Business created');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop',
        description: 'Powerful laptop for students',
        imageUrl: 'https://ik.imagekit.io/demo/laptop-main.jpg',
        price: 999.99,
        stock: 10,
        businessId: business.id,
        categoryId: categories[0].id,
        images: {
          create: [
            { url: 'https://ik.imagekit.io/demo/laptop-angle1.jpg' },
            { url: 'https://ik.imagekit.io/demo/laptop-angle2.jpg' },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Headphones',
        description: 'Noise-cancelling headphones',
        imageUrl: 'https://ik.imagekit.io/demo/headphones-main.jpg',
        price: 199.99,
        stock: 20,
        businessId: business.id,
        categoryId: categories[0].id,
        images: {
          create: [
            { url: 'https://ik.imagekit.io/demo/headphones-side.jpg' },
            { url: 'https://ik.imagekit.io/demo/headphones-back.jpg' },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Textbook',
        description: 'Computer Science 101 Textbook',
        imageUrl: 'https://ik.imagekit.io/demo/textbook-cover.jpg',
        price: 79.99,
        stock: 15,
        businessId: business.id,
        categoryId: categories[1].id,
        images: {
          create: [
            { url: 'https://ik.imagekit.io/demo/textbook-back.jpg' },
            { url: 'https://ik.imagekit.io/demo/textbook-contents.jpg' },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
  ]);

  console.log('Products created');

  // Create an order
  await prisma.order.create({
    data: {
      userId: normalUser.id,
      productId: products[0].id,
      businessId: business.id,
      total: products[0].price,
      status: 'PENDING',
    },
  });

  console.log('Order created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });