// context/ProtectedProvider.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { handleClientSessionRefresh } from '@/lib/supabase/authUtils'

export function useProtectedSession() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          // Session refreshed successfully
        } else if (event === 'SIGNED_OUT') {
          router.push('/login?reason=session_expired')
        } else if (event === 'INITIAL_SESSION') {
          if (!session) {
            const refreshed = await handleClientSessionRefresh()
            if (!refreshed) {
              router.push('/login?reason=session_invalid')
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return { supabase }
}