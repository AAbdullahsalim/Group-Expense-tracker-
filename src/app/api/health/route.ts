import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check - you can add more sophisticated checks here
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'group-expense-tracker'
    })
  } catch {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
} 