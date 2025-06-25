// app/(auth)/error/page.tsx
"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resendOtpLink } from "@/lib/actions/user.actions";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error: string; email?: string; type?: 'signup' | 'reset' };
}) {
  const errorMessage = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : "An unknown error occurred";

  const handleResend = async () => {
    if (!searchParams.email) return;
    await resendOtpLink(searchParams.email);
    window.location.href = `/email-sent?email=${encodeURIComponent(searchParams.email)}`;
  };

  return (
    <div className="text-left flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-2 md:gap-8 ml-10">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-ledt">Authentication Error</h1>
        <p className="text-left text-red-800">{errorMessage}</p>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            {errorMessage.includes("expired") && (
              <>Your verification link has expired. Please request a new one.</>
            )}
          </p>
          
          {searchParams.type === 'reset' ? (
            <Button variant="outline" asChild className="w-full">
              <Link href="/reset-password">Request New Password Reset</Link>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="px-9 py-1 bg-bank-gradient"
              onClick={handleResend}
            >
              Resend Verification Link
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}