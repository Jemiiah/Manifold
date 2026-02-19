import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  ? 'http://localhost:3001'
  : 'https://blockseer.onrender.com';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500; // ms

async function fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
      });
      return response;
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      console.warn(`Proxy attempt ${attempt + 1} failed, retrying in ${RETRY_DELAY}ms...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter'); // 'pending' | 'locked' | null

  const endpoint = filter ? `${BACKEND_URL}/markets/${filter}` : `${BACKEND_URL}/markets`;

  try {
    const response = await fetchWithRetry(endpoint, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetchWithRetry(`${BACKEND_URL}/markets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to create market' }, { status: 502 });
  }
}
