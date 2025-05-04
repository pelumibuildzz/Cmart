'use server';

import { getUniversities, getUniversityById } from '@/lib/services/university.service';
import { getUserById } from '@/lib/services/user.service';

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
    // First get the user to find their university ID
    const user = await getUserById(userId);
    if (!user || !user.universityId) {
      return null;
    }

    // Then fetch the university details
    const university = await getUniversityById(user.universityId);
    if (!university) {
      return null;
    }

    // Return only necessary data
    return {
      id: university.id,
      name: university.name
    };
  } catch (error) {
    console.error('Error fetching university data:', error);
    return null;
  }
}