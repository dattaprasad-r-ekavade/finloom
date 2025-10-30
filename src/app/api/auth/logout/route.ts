import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In a real application, you would clear server-side session/JWT token here
    // For this client-side implementation, we just return success
    return NextResponse.json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error', error);
    return NextResponse.json(
      { error: 'Unable to log out. Please try again later.' },
      { status: 500 }
    );
  }
}
