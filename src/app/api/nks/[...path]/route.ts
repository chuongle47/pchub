import { NextRequest, NextResponse } from 'next/server';

const NKS_BASE_URL = 'https://account.nks.vn/api';

/**
 * Universal NKS API Proxy — avoids CORS when calling from browser.
 * Route: /api/nks/[...path]
 * 
 * Example: POST /api/nks/nks/user/login
 *   → forwards to POST https://account.nks.vn/api/nks/user/login
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = `${NKS_BASE_URL}/${(path || []).join('/')}`;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward Authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization')! }
          : {}),
      },
      body: JSON.stringify(body),
      // Important: use no-store to always get fresh data
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error(`[NKS Proxy] Error forwarding to ${targetUrl}:`, error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Proxy error: cannot connect to NKS API' },
      { status: 502 }
    );
  }
}

// Also support GET for profile-type endpoints
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = `${NKS_BASE_URL}/${(path || []).join('/')}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization')! }
          : {}),
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Proxy error' },
      { status: 502 }
    );
  }
}
