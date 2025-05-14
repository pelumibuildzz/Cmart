import { prisma } from '../server/prisma';
import bcrypt from 'bcryptjs';

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: any) {
  // Hash the password with bcrypt using 10 salt rounds and the BCRYPT_SECRET as pepper
  const salt = await bcrypt.genSalt(10);
  const pepper = process.env.BCRYPT_SECRET || '';
  const hashedPassword = await bcrypt.hash(data.password + pepper, salt);
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
}

export async function updateUser(id: string, data: any) {
  // If the data includes a password, hash it before saving
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    const pepper = process.env.BCRYPT_SECRET || '';
    data.password = await bcrypt.hash(data.password + pepper, salt);
  }
  
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

// Function to verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  const pepper = process.env.BCRYPT_SECRET || '';
  return bcrypt.compare(plainPassword + pepper, hashedPassword);
} 