// app/(auth)/link-expired/page.tsx
"use client"
import { useState } from 'react';
import { resendOtpLink } from '@/lib/actions/user.actions';

export default function LinkExpiredPage({ searchParams }: { searchParams: { email?: string } }) {
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    if (!searchParams.email) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      await resendOtpLink(searchParams.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="...">
      {/* ... existing UI ... */}
      <button 
        onClick={handleResend}
        disabled={isResending || success}
      >
        {isResending ? 'Sending...' : success ? 'Sent!' : 'Resend Link'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}