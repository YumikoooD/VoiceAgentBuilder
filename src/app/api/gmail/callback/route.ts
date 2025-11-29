import { NextRequest, NextResponse } from 'next/server';

// This route handles the OAuth callback from Google
// It receives the authorization code and passes it to the frontend
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    // Redirect to frontend with error
    return NextResponse.redirect(
      new URL(`/builder?gmail_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/builder?gmail_error=no_code', request.url)
    );
  }

  // Redirect to frontend with the code
  // The frontend will exchange this code for tokens
  return NextResponse.redirect(
    new URL(`/builder?gmail_code=${encodeURIComponent(code)}`, request.url)
  );
}

