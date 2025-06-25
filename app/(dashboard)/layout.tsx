// app/(dashboard)/layout.tsx
import MobileNav from "@/components/section/navbar/MobileNav";
import Sidebar from "@/components/section/sidebar/Sidebar";
import { getUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ThemeProvider } from '@/context/ThemeProvider'
import SpinnerLoader from '@/components/shared/SpinnerLoader'
import { Suspense } from 'react'
import styles from './styles.module.css'

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const loggedIn = await getUser();

  if (!loggedIn) {
    redirect('/sign-in');
  }

  return (
    <ThemeProvider>
       <Suspense fallback={
        <div className={styles.loadingContainer}>
          <SpinnerLoader />
        </div>
      }>
        <div className="flex h-screen w-full font-inter">
          <Sidebar user={loggedIn} />
          
          <div className="flex size-full flex-col">
            <div className="flex h-16 items-center justify-between p-5 shadow-creditCard sm:p-8 md:hidden">
              <Image 
                src="/assets/images/StratSync.svg" 
                width={125} 
                height={75} 
                alt="logo" 
              />
              <MobileNav user={loggedIn} />
            </div>
            {children}
          </div>
        </div>
      </Suspense>
    </ThemeProvider>
  )
}