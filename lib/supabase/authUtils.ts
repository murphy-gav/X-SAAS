import { createClient } from './client'

export async function handleClientSessionRefresh() {
  const supabase = createClient()
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin'
    })
    
    if (!response.ok) {
      throw new Error('Session refresh failed')
    }
    
    const { access_token, refresh_token } = await response.json()
    
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      })
      
      if (error) throw error
      return true
    }
    
    return false
  } catch (error) {
    console.error('Session refresh error:', error)
    return false
  }
}

// lib/auth.ts - Heartbeat example
export function startSessionHeartbeat(interval = 5 * 60 * 1000) {
  const timer = setInterval(async () => {
    try {
      await handleClientSessionRefresh()
    } catch {
      clearInterval(timer)
    }
  }, interval)
  
  return () => clearInterval(timer)
}