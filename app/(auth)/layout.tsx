"use client"
import Image from "next/image";
import { usePathname } from 'next/navigation';

// import "./base.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldShowImage = !(
    pathname.startsWith('/email-sent') || 
    pathname.startsWith('/verify-success') || 
    pathname.startsWith('/error')
  )
  return (
    <main className="flex min-h-screen w-full justify-between font-inter">
      {children}
      <div className="flex h-screen w-full sticky top-0 items-center justify-end bg-sky-1 max-lg:hidden">
        <div>
        {shouldShowImage && (
          <Image 
            src="/assets/icon/auth-image.svg"
            alt="Auth image"
            width={500}
            height={500}
            className="rounded-l-xl object-contain"
          />
        )}
        </div>
      </div>
    </main>
  );
}
