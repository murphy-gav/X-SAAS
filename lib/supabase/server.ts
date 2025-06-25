// /lib/supabase/server.ts
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const cookieHandlers = {
    getAll: () => {
      return cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
      }))
    },

    setAll: (newCookies: {
      name: string
      value: string
      path?: string
      domain?: string
      expires?: Date
      maxAge?: number
      sameSite?: 'lax' | 'strict' | 'none'
      secure?: boolean
    }[]) => {
      for (const cookie of newCookies) {
        cookieStore.set({
          name: cookie.name,
          value: cookie.value,
          path: cookie.path,
          domain: cookie.domain,
          expires: cookie.expires,
          maxAge: cookie.maxAge,
          sameSite: cookie.sameSite,
          secure: cookie.secure,
        })
      }
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieHandlers,
    }
  )
}