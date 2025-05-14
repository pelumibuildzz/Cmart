import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      { 
        universities,
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch universities', success: false },
      { status: 500 }
    );
  }
} 