/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { connectExchange } from '@/lib/actions/user.actions'
import { SUPPORTED_EXCHANGES } from '@/constants'
import { SupportedExchange } from '@/constants'

export default function ExchangeOnboarding({ userId }: { userId: string }) {
  const router = useRouter()
  const [exchange, setExchange] = useState<SupportedExchange>('binance')
  const [apiKey, setApiKey] = useState('')
  const [secret, setSecret] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isTestnet, setIsTestnet] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await connectExchange({
        exchange,
        apiKey,
        secret,
        userId,
        isTestnet
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Redirect after a short delay to show success message
        setTimeout(() => router.push('/d'), 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-green-900 text-green-100 rounded-lg">
        <p>Exchange connected successfully! Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="exchange" className="block text-sm font-medium text-gray-300 mb-1">
          Exchange
        </label>
        <select
          id="exchange"
          value={exchange}
          onChange={(e) => setExchange(e.target.value as SupportedExchange)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {SUPPORTED_EXCHANGES.map((ex) => (
            <option key={ex} value={ex}>
              {ex.charAt(0).toUpperCase() + ex.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="testnet"
          checked={isTestnet}
          onChange={(e) => setIsTestnet(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="testnet" className="text-sm text-gray-300">
          Connect to Testnet
        </label>
      </div>

      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
          API Key
        </label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="secret" className="block text-sm font-medium text-gray-300 mb-1">
          API Secret
        </label>
        <input
          type="password"
          id="secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <div className="p-2 bg-red-900 text-red-100 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
      >
        {isLoading ? 'Connecting...' : 'Connect Exchange'}
      </button>
    </form>
  )
}