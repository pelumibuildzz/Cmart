'use server';

import { getUniversities } from '@/lib/services/university.service';

export async function fetchUniversities() {
  try {
    const universities = await getUniversities();
    return { universities };
  } catch (error) {
    return { error: 'Failed to fetch universities' };
  }
} 