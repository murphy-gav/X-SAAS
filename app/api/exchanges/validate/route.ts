/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { validateExchangeCredentials } from '@/lib/actions/user.actions'
import { SUPPORTED_EXCHANGES } from '@/constants'

export async function POST(req: Request) {
  try {
    const { exchange, apiKey, secret } = await req.json()

    if (!SUPPORTED_EXCHANGES.includes(exchange as any)) {
      return NextResponse.json(
        { error: 'Unsupported exchange' },
        { status: 400 }
      )
    }

    const isValid = await validateExchangeCredentials(exchange, apiKey, secret)
    
    return NextResponse.json({ valid: isValid })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Validation failed' },
      { status: 400 }
    )
  }
}