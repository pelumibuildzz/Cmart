require('dotenv').config();
const { PrismaClient } = require('../../src/generated/prisma');

const Role = {
  USER: 'USER',
  BUSINESS: 'BUSINESS',
  ADMIN: 'ADMIN'
};

const prisma = new PrismaClient();
const defaultImageUrl = process.env.IMAGEKIT_URL_ENDPOINT + "/default-image.jpg";

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.orderGroup.deleteMany();
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

  // Create business users
  const businessUser1 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'business1@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.BUSINESS,
      business: {
        create: {
          name: 'Campus Tech Store',
          description: 'We sell the latest tech gadgets for students',
          universityId: university1.id,
          categoryId: categories[0].id, // Electronics
          isVerified: true,
        },
      },
    },
    include: {
      business: true,
    },
  });

  const businessUser2 = await prisma.user.create({
    data: {
      name: 'Mike Johnson',
      email: 'business2@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.BUSINESS,
      business: {
        create: {
          name: 'Campus Bookstore',
          description: 'Your one-stop shop for all academic books',
          universityId: university1.id,
          categoryId: categories[1].id, // Books
          isVerified: true,
        },
      },
    },
    include: {
      business: true,
    },
  });

  const businessUser3 = await prisma.user.create({
    data: {
      name: 'Sarah Williams',
      email: 'business3@example.com',
      password: 'password123',
      universityId: university1.id,
      role: Role.BUSINESS,
      business: {
        create: {
          name: 'University Fashions',
          description: 'Trendy clothing for students',
          universityId: university1.id,
          categoryId: categories[2].id, // Clothing
          isVerified: true,
        },
      },
    },
    include: {
      business: true,
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

  console.log('Users created with businesses');

  // Create products for Tech Store
  const techProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop',
        description: 'Powerful laptop for students',
        imageUrl: defaultImageUrl,
        price: 900000,
        stock: 10,
        businessId: businessUser1.business.id,
        categoryId: categories[0].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
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
        imageUrl: defaultImageUrl,
        price: 19000,
        stock: 20,
        businessId: businessUser1.business.id,
        categoryId: categories[0].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
  ]);

  // Create products for Bookstore
  const bookProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Computer Science Textbook',
        description: 'Computer Science 101 Textbook',
        imageUrl: defaultImageUrl,
        price: 7900,
        stock: 15,
        businessId: businessUser2.business.id,
        categoryId: categories[1].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Engineering Mathematics',
        description: 'Comprehensive guide to engineering mathematics',
        imageUrl: defaultImageUrl,
        price: 8500,
        stock: 12,
        businessId: businessUser2.business.id,
        categoryId: categories[1].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
  ]);

  // Create products for Fashion Store
  const fashionProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'University Hoodie',
        description: 'Comfortable hoodie with university logo',
        imageUrl: defaultImageUrl,
        price: 12000,
        stock: 25,
        businessId: businessUser3.business.id,
        categoryId: categories[2].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jeans',
        description: 'Classic denim jeans for everyday wear',
        imageUrl: defaultImageUrl,
        price: 15000,
        stock: 18,
        businessId: businessUser3.business.id,
        categoryId: categories[2].id,
        images: {
          create: [
            { url: defaultImageUrl },
            { url: defaultImageUrl },
          ],
        },
      },
      include: {
        images: true,
      },
    }),
  ]);

  console.log('Products created');

  // Create an order group with multiple business orders
  const orderGroup = await prisma.orderGroup.create({
    data: {
      userId: normalUser.id,
      total: techProducts[0].price + bookProducts[0].price + fashionProducts[0].price, // Total across all businesses
      status: 'PENDING',
      paymentId: 'mock_payment_' + Date.now(),
      orders: {
        create: [
          // Order from Tech Store
          {
            userId: normalUser.id,
            businessId: businessUser1.business.id,
            total: techProducts[0].price,
            status: 'PENDING',
            OrderItems: {
              create: [
                {
                  productId: techProducts[0].id,
                  quantity: 1,
                  price: techProducts[0].price
                }
              ]
            }
          },
          // Order from Bookstore
          {
            userId: normalUser.id,
            businessId: businessUser2.business.id,
            total: bookProducts[0].price,
            status: 'PENDING',
            OrderItems: {
              create: [
                {
                  productId: bookProducts[0].id,
                  quantity: 1,
                  price: bookProducts[0].price
                }
              ]
            }
          },
          // Order from Fashion Store
          {
            userId: normalUser.id,
            businessId: businessUser3.business.id,
            total: fashionProducts[0].price,
            status: 'PENDING',
            OrderItems: {
              create: [
                {
                  productId: fashionProducts[0].id,
                  quantity: 1,
                  price: fashionProducts[0].price
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      orders: {
        include: {
          OrderItems: true,
          Business: true
        }
      }
    }
  });

  console.log('Order Group created with orders from multiple businesses');
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