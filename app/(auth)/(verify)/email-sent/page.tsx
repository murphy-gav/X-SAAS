/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { resendOtpLink } from "@/lib/actions/user.actions"
import { useSearchParams } from "next/navigation"
import Link from "next/link"


export default function EmailSentPage() {
  const params = useSearchParams()
  const email = params.get("email") ?? ""

  // local UI state
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email || isResending) return

    setError(null)
    setIsResending(true)

    try {
      await resendOtpLink(email)
      setResent(true)
    } catch (err: any) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : "Could not resend. Please try again later."
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full max-w-[420px] mx-auto flex-col justify-center gap-5 py-10 md:gap-8 px-10">
      <h1 className="text-2xl font-bold">Check your inbox</h1>
      <p className="mt-4">
        We just sent a confirmation link to{" "}
        <strong className="break-all">{email}</strong>. Click it to verify
        your address.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {!resent ? (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="px-6 py-2 bg-bank-gradient"
          >
            {isResending ? "Sending…" : "Resend Link"}
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-green-500 text-lg">
          ✅ Link sent! Please check your email.
        </p>
      )}

      {resent && (
        <p className="mt-4 text-sm text-gray-400">
          Still didn&apos;t get it?{" "}
          <Link
            href="/support"
            className="text-blue-500 underline text-sm"
          >
            Contact Support
          </Link>
          .
        </p>
      )}
    </div>
  )
}