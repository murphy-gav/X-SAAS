// app/(dashboard)/error.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Dashboard Error:', error)
    
    // Handle specific auth errors
    if (error.message.includes('auth') || error.message.includes('session')) {
      router.push('/login?error=auth_failure')
    }
  }, [error, router])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-bold">Dashboard Error</h2>
      <p className="text-muted-foreground">
        {error.message || 'Something went wrong!'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}