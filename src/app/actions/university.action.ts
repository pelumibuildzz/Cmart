'use server';

import { getUniversities } from '@/lib/services/university.service';
import { prisma } from '@/lib/server/prisma';

export async function fetchUniversities() {
  try {
    const universities = await getUniversities();
    return { universities };
  } catch (error) {
    return { error: 'Failed to fetch universities' };
  }
}

export async function fetchUniversityData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { universityId: true }
    });

    if (!user) {
      return null;
    }

    const university = await prisma.university.findUnique({
      where: { id: user.universityId }
    });

    return university;
  } catch (error) {
    console.error('Error fetching university data:', error);
    return null;
  }
}