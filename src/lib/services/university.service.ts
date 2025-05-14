import { prisma } from '../server/prisma';

export async function getUniversities(
  params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}
) {
  const { skip, take, where, orderBy = { name: 'asc' } } = params;
  return prisma.university.findMany({
    skip,
    take,
    where,
    orderBy,
  });
}

export async function getUniversityById(id: string) {
  return prisma.university.findUnique({
    where: { id },
  });
}

export async function getUniversityByName(name: string) {
  return prisma.university.findUnique({
    where: { name },
  });
}

export async function createUniversity(data: { name: string }) {
  return prisma.university.create({
    data,
  });
}

export async function updateUniversity(id: string, data: { name: string }) {
  return prisma.university.update({
    where: { id },
    data,
  });
}

export async function deleteUniversity(id: string) {
  return prisma.university.delete({
    where: { id },
  });
} 