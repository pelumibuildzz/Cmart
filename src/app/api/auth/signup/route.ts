import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/services/user.service';
import { Role } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { name, email, password, universityId } = await request.json();
    
    // Validate input
    if (!name || !email || !password || !universityId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await createUser({
      name,
      email,
      password, // In production, you would hash this password
      universityId,
      role: Role.USER,
    });
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}