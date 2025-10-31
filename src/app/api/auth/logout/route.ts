import { NextResponse } from 'next/server';
import { ErrorHandlers } from '@/lib/apiResponse';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully.',
    });

    // Clear the auth token cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return ErrorHandlers.serverError(
      'Unable to log out. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
