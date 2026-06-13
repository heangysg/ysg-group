import { NextResponse } from 'next/server'

export async function GET() {
  // Mock audit logs as it was in the backend
  return NextResponse.json({ logs: [] })
}
