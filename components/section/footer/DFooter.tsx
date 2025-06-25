import { signOut } from '@/lib/actions/user.actions'
import { FooterProps } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const DFooter = ({ user, type = 'desktop' }: FooterProps) => {
  const router = useRouter();

  const handleLogOut = async () => {
    const loggedOut = await signOut();

    if(loggedOut) router.push('/sign-in')
  }

  return (
    <footer className="footer">
      <div className={type === 'mobile' 
        ? 'flex size-10 items-center justify-center rounded-full bg-gray-400 shadow-sm' 
        : 'flex size-10 items-center justify-center rounded-full bg-gray-400 shadow-sm max-xl:hidden'
      }>
        <p className="text-xl font-bold text-white uppercase">
          {user?.firstName?.charAt(0)}
        </p>
      </div>

      <div className={type === 'mobile' ? 'flex flex-1 flex-col justify-center' : 'flex flex-1 flex-col justify-center max-xl:hidden'}>
          <h1 className="text-14 truncate text-gray-700 font-semibold">
            {user?.firstName}
          </h1>
          <p className="text-14 truncate font-normal text-gray-600">
            {user?.email}
          </p>
      </div>

      <div className="relative size-5 max-xl:w-full max-xl:flex max-xl:justify-center max-xl:items-center" onClick={handleLogOut}>
        <Image src="assets/icon/logout.svg" fill alt="StratSync" />
      </div>
    </footer>
  )
}

export default DFooter