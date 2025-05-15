// require('dotenv').config();
// const { PrismaClient } = require('../../src/generated/prisma');
// const bcrypt = require('bcryptjs');

// const Role = {
//   USER: 'USER',
//   BUSINESS: 'BUSINESS',
//   ADMIN: 'ADMIN'
// };

// const prisma = new PrismaClient();
// const defaultImageUrl = process.env.IMAGEKIT_URL_ENDPOINT + "/default-image.jpg";

// // Helper function to hash passwords
// async function hashPassword(password) {
//   const salt = await bcrypt.genSalt(10);
//   const pepper = process.env.BCRYPT_SECRET;
//   return bcrypt.hash(password + pepper, salt);
// }

// async function main() {
//   console.log('Starting seed...');

//   // Clear existing data
//   await prisma.orderItem.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.orderGroup.deleteMany();
//   await prisma.productImage.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.business.deleteMany();
//   await prisma.discount.deleteMany();
//   await prisma.rating.deleteMany();
//   await prisma.user.deleteMany();
//   await prisma.subCategory.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.university.deleteMany();

//   console.log('Database cleared');

//   // Create universities
//   const university1 = await prisma.university.create({
//     data: {
//       name: 'University of Technology',
//     },
//   });

//   const university2 = await prisma.university.create({
//     data: {
//       name: 'State University',
//     },
//   });

//   console.log('Universities created');

//   // Create categories
//   const categories = await Promise.all([
//     prisma.category.create({
//       data: {
//         name: 'Electronics',
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: 'Books',
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: 'Clothing',
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: 'Food',
//       },
//     }),
//   ]);

//   // Create subcategories
//   const subCategories = await Promise.all([
//     // Electronics subcategories
//     prisma.subCategory.create({
//       data: {
//         name: 'Laptops',
//         categoryId: categories[0].id,
//       },
//     }),
//     prisma.subCategory.create({
//       data: {
//         name: 'Accessories',
//         categoryId: categories[0].id,
//       },
//     }),
//     // Books subcategories
//     prisma.subCategory.create({
//       data: {
//         name: 'Textbooks',
//         categoryId: categories[1].id,
//       },
//     }),
//     prisma.subCategory.create({
//       data: {
//         name: 'Fiction',
//         categoryId: categories[1].id,
//       },
//     }),
//     // Clothing subcategories
//     prisma.subCategory.create({
//       data: {
//         name: 'University Apparel',
//         categoryId: categories[2].id,
//       },
//     }),
//     prisma.subCategory.create({
//       data: {
//         name: 'Casual Wear',
//         categoryId: categories[2].id,
//       },
//     }),
//     // Food subcategories
//     prisma.subCategory.create({
//       data: {
//         name: 'Snacks',
//         categoryId: categories[3].id,
//       },
//     }),
//     prisma.subCategory.create({
//       data: {
//         name: 'Beverages',
//         categoryId: categories[3].id,
//       },
//     }),
//   ]);

//   console.log('Categories and subcategories created');

//   // Create users with hashed passwords
//   const normalUser = await prisma.user.create({
//     data: {
//       name: 'John Doe',
//       email: 'user@example.com',
//       password: await hashPassword('password123'),
//       universityId: university1.id,
//       role: Role.USER,
//       totalOrders: 0,
//       discountTier: 'NONE',
//     },
//   });

//   // Create business users
//   const businessUser1 = await prisma.user.create({
//     data: {
//       name: 'Jane Smith',
//       email: 'business1@example.com',
//       password: await hashPassword('password123'),
//       universityId: university1.id,
//       role: Role.BUSINESS,
//       totalOrders: 0,
//       discountTier: 'NONE',
//       business: {
//         create: {
//           name: 'Campus Tech Store',
//           description: 'We sell the latest tech gadgets for students',
//           universityId: university1.id,
//           isVerified: true,
//           categories: {
//             connect: [{ id: categories[0].id }] // Electronics
//           },
//           subCategories: {
//             connect: [
//               { id: subCategories[0].id }, // Laptops
//               { id: subCategories[1].id }  // Accessories
//             ]
//           }
//         },
//       },
//     },
//     include: {
//       business: true,
//     },
//   });

//   const businessUser2 = await prisma.user.create({
//     data: {
//       name: 'Mike Johnson',
//       email: 'business2@example.com',
//       password: await hashPassword('password123'),
//       universityId: university1.id,
//       role: Role.BUSINESS,
//       totalOrders: 0,
//       discountTier: 'NONE',
//       business: {
//         create: {
//           name: 'Campus Bookstore',
//           description: 'Your one-stop shop for all academic books',
//           universityId: university1.id,
//           isVerified: true,
//           categories: {
//             connect: [{ id: categories[1].id }] // Books
//           },
//           subCategories: {
//             connect: [
//               { id: subCategories[2].id }, // Textbooks
//               { id: subCategories[3].id }  // Fiction
//             ]
//           }
//         },
//       },
//     },
//     include: {
//       business: true,
//     },
//   });

//   const businessUser3 = await prisma.user.create({
//     data: {
//       name: 'Sarah Williams',
//       email: 'business3@example.com',
//       password: await hashPassword('password123'),
//       universityId: university1.id,
//       role: Role.BUSINESS,
//       totalOrders: 0,
//       discountTier: 'NONE',
//       business: {
//         create: {
//           name: 'University Fashions',
//           description: 'Trendy clothing for students',
//           universityId: university1.id,
//           isVerified: true,
//           categories: {
//             connect: [{ id: categories[2].id }] // Clothing
//           },
//           subCategories: {
//             connect: [
//               { id: subCategories[4].id }, // University Apparel
//               { id: subCategories[5].id }  // Casual Wear
//             ]
//           }
//         },
//       },
//     },
//     include: {
//       business: true,
//     },
//   });

//   const adminUser = await prisma.user.create({
//     data: {
//       name: 'Admin User',
//       email: 'admin@example.com',
//       password: await hashPassword('password123'),
//       universityId: university1.id,
//       role: Role.ADMIN,
//       totalOrders: 0,
//       discountTier: 'NONE',
//     },
//   });

//   console.log('Users created with businesses');

//   // Create products for Tech Store
//   const techProducts = await Promise.all([
//     prisma.product.create({
//       data: {
//         name: 'Laptop',
//         description: 'Powerful laptop for students',
//         imageUrl: defaultImageUrl,
//         basePrice: 900000,
//         markupPercent: 5,
//         finalPrice: 945000, // 900000 + 5% markup
//         stock: 10,
//         businessId: businessUser1.business.id,
//         categories: {
//           connect: [{ id: categories[0].id }] // Electronics
//         },
//         subCategories: {
//           connect: [{ id: subCategories[0].id }] // Laptops
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//     prisma.product.create({
//       data: {
//         name: 'Headphones',
//         description: 'Noise-cancelling headphones',
//         imageUrl: defaultImageUrl,
//         basePrice: 19000,
//         markupPercent: 10,
//         finalPrice: 20900, // 19000 + 10% markup
//         stock: 20,
//         businessId: businessUser1.business.id,
//         categories: {
//           connect: [{ id: categories[0].id }] // Electronics
//         },
//         subCategories: {
//           connect: [{ id: subCategories[1].id }] // Accessories
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//   ]);

//   // Create products for Bookstore
//   const bookProducts = await Promise.all([
//     prisma.product.create({
//       data: {
//         name: 'Computer Science Textbook',
//         description: 'Computer Science 101 Textbook',
//         imageUrl: defaultImageUrl,
//         basePrice: 7900,
//         markupPercent: 8,
//         finalPrice: 8532, // 7900 + 8% markup
//         stock: 15,
//         businessId: businessUser2.business.id,
//         categories: {
//           connect: [{ id: categories[1].id }] // Books
//         },
//         subCategories: {
//           connect: [{ id: subCategories[2].id }] // Textbooks
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//     prisma.product.create({
//       data: {
//         name: 'Engineering Mathematics',
//         description: 'Comprehensive guide to engineering mathematics',
//         imageUrl: defaultImageUrl,
//         basePrice: 8500,
//         markupPercent: 7,
//         finalPrice: 9095, // 8500 + 7% markup
//         stock: 12,
//         businessId: businessUser2.business.id,
//         categories: {
//           connect: [{ id: categories[1].id }] // Books
//         },
//         subCategories: {
//           connect: [{ id: subCategories[2].id }] // Textbooks
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//   ]);

//   // Create products for Fashion Store
//   const fashionProducts = await Promise.all([
//     prisma.product.create({
//       data: {
//         name: 'University Hoodie',
//         description: 'Comfortable hoodie with university logo',
//         imageUrl: defaultImageUrl,
//         basePrice: 12000,
//         markupPercent: 15,
//         finalPrice: 13800, // 12000 + 15% markup
//         stock: 25,
//         businessId: businessUser3.business.id,
//         categories: {
//           connect: [{ id: categories[2].id }] // Clothing
//         },
//         subCategories: {
//           connect: [{ id: subCategories[4].id }] // University Apparel
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//     prisma.product.create({
//       data: {
//         name: 'Denim Jeans',
//         description: 'Classic denim jeans for everyday wear',
//         imageUrl: defaultImageUrl,
//         basePrice: 15000,
//         markupPercent: 12,
//         finalPrice: 16800, // 15000 + 12% markup
//         stock: 18,
//         businessId: businessUser3.business.id,
//         categories: {
//           connect: [{ id: categories[2].id }] // Clothing
//         },
//         subCategories: {
//           connect: [{ id: subCategories[5].id }] // Casual Wear
//         },
//         images: {
//           create: [
//             { url: defaultImageUrl },
//             { url: defaultImageUrl },
//           ],
//         },
//       },
//       include: {
//         images: true,
//         categories: true,
//         subCategories: true,
//       },
//     }),
//   ]);

//   console.log('Products created');

//   // Create discount for user
//   const discount = await prisma.discount.create({
//     data: {
//       userId: normalUser.id,
//       percentage: 10,
//       isUsed: false,
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//     },
//   });

//   console.log('Discount created');

//   // Create an order group with multiple business orders
//   const orderGroup = await prisma.orderGroup.create({
//     data: {
//       userId: normalUser.id,
//       total: techProducts[0].finalPrice + bookProducts[0].finalPrice + fashionProducts[0].finalPrice, // Total across all businesses
//       status: 'PENDING',
//       paymentId: 'mock_payment_' + Date.now(),
//       shippingName: normalUser.name,
//       shippingHall: 'Main Campus Hall',
//       shippingUniversityId: university1.id,
//       orders: {
//         create: [
//           // Order from Tech Store
//           {
//             userId: normalUser.id,
//             businessId: businessUser1.business.id,
//             total: techProducts[0].finalPrice,
//             status: 'PENDING',
//             orderItems: {
//               create: [
//                 {
//                   productId: techProducts[0].id,
//                   quantity: 1,
//                   price: techProducts[0].finalPrice
//                 }
//               ]
//             }
//           },
//           // Order from Bookstore
//           {
//             userId: normalUser.id,
//             businessId: businessUser2.business.id,
//             total: bookProducts[0].finalPrice,
//             status: 'PENDING',
//             orderItems: {
//               create: [
//                 {
//                   productId: bookProducts[0].id,
//                   quantity: 1,
//                   price: bookProducts[0].finalPrice
//                 }
//               ]
//             }
//           },
//           // Order from Fashion Store - with discount applied
//           {
//             userId: normalUser.id,
//             businessId: businessUser3.business.id,
//             total: fashionProducts[0].finalPrice * 0.9, // Apply 10% discount
//             status: 'PENDING',
//             orderItems: {
//               create: [
//                 {
//                   productId: fashionProducts[0].id,
//                   quantity: 1,
//                   price: fashionProducts[0].finalPrice
//                 }
//               ]
//             },
//             discountId: discount.id
//           }
//         ]
//       }
//     },
//     include: {
//       orders: {
//         include: {
//           orderItems: true,
//           business: true,
//           discount: true
//         }
//       }
//     }
//   });

//   // Create a rating for the order
//   const rating = await prisma.rating.create({
//     data: {
//       rating: 5,
//       comment: "Great products, fast delivery!",
//       userId: normalUser.id,
//       orderId: orderGroup.id,
//     }
//   });

//   console.log('Order Group created with orders from multiple businesses');
//   console.log('Rating created for the order');
//   console.log('Seed completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });