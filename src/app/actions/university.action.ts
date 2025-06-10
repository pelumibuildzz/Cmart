'use server';

import { getUniversities, createUniversity } from '@/lib/services/university.service';
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

export async function createUniversityAction(name: string) {
  try {
    // Check if university with this name already exists
    const existingUniversity = await prisma.university.findUnique({
      where: { name: name.trim() }
    });

    if (existingUniversity) {
      return { error: 'A university with this name already exists' };
    }

    const university = await createUniversity({ name: name.trim() });
    return { success: true, university };
  } catch (error) {
    console.error('Error creating university:', error);
    return { error: 'Failed to create university' };
  }
}