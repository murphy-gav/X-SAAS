import Link from "next/link"

export default function VerifySuccessPage() {
  return (
    <div className="text-left flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-2 md:gap-8 ml-10">
      <h1 className="text-2xl font-bold">Email verified!</h1>
      <div className="flex flex-col space-y-2">
        <p className="mt-4">
          Your email has been confirmed. You&apos;re all set to sign in.
        </p>
        <Link href="/sign-in">
          <button className="text-16 rounded-lg border border-bankGradient bg-bank-gradient font-semibold text-white shadow-form px-9 py-1">Sign In</button>
        </Link>
      </div>
      
    </div>
  )
}




