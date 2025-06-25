"use client"

import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useRouter } from "next/navigation";

import { NavLinkProps } from "@/types";
import Link from "next/link";

const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 32);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAccountClick = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include' // Ensure cookies are sent
      });
      
      const { user } = await res.json();
      
      if (!user) {
        return router.push('/sign-in');
      }
      
      router.push(user.onboarded ? '/d' : '/onboarding');
      
    } catch (error) {
      console.error('Account navigation error:', error);
      router.push('/sign-in');
    }
  };

  const NavLink = ({ title, href, onClick }: NavLinkProps) => (
    <Link
      href={href}
      onClick={(e) => {
        setIsOpen(false);
        if (onClick) onClick(e);
      }}
      className={clsx(
        "base-bold dark:text-white text-white uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5",
        pathname === href && "nav-active"
      )}
    >
      {title}
    </Link>
  );

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 z-50 w-full py-10 transition-all duration-500 max-lg:py-4",
        hasScrolled && "py-2 bg-black-100 backdrop-blur-[8px]",
      )}
    >
      <div className="container flex h-14 items-center max-lg:px-5">
        <Link className="lg:hidden flex-1 cursor-pointer z-2" href="/">
          <Image src="/assets/images/StratSync.svg" width={115} height={55} alt="stratsync logo" />
        </Link>

        <div
          className={clsx(
            "w-full max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-full max-lg:bg-s2 max-lg:opacity-0",
            isOpen ? "max-lg:opacity-100" : "max-lg:pointer-events-none",
          )}
        >
          <div className="max-lg:relative max-lg:flex max-lg:flex-col max-lg:min-h-screen max-lg:p-6 max-lg:overflow-hidden sidebar-before max-md:px-4">
            <nav className="max-lg:relative max-lg:z-2 max-lg:my-auto">
              <ul className="flex max-lg:block max-lg:px-12">
                <li className="nav-li">
                  <NavLink title="Solution" href="/solution" />
                  <div className="dot" />
                  <NavLink title="Features" href="/features" />
                </li>

                <li className="nav-logo">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="base-bold dark:text-white text-black-100 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                  >
                    <Image
                      src="/assets/images/StratSync.svg"
                      width={160}
                      height={55}
                      alt="logo"
                    />
                  </Link>
                </li>

                <li className="nav-li">
                  <NavLink title="Plans" href="/plans" />
                  <div className="dot" />
                  <NavLink 
                    title="Account" 
                    href="#" 
                    onClick={handleAccountClick}
                  />
                </li>
              </ul>
            </nav>

            <div className="lg:hidden block absolute top-1/2 left-0 w-[960px] h-[380px] translate-x-[-290px] -translate-y-1/2 rotate-90">
              <Image
                src="/assets/images/bg-outlines.svg"
                width={960}
                height={380}
                alt="outline"
                className="relative z-2"
              />
              <Image
                src="/assets/images/bg-outlines-fill.png"
                width={960}
                height={380}
                alt="outline"
                className="absolute inset-0 mix-blend-soft-light opacity-5"
              />
            </div>
          </div>
        </div>

        <button
          className="lg:hidden z-2 size-10 border-2 border-s4/25 rounded-full flex justify-center items-center"
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          <Image
            src={`/assets/images/${isOpen ? "close" : "magic"}.svg`}
            alt="magic"
            width={100}
            height={100}
            className="size-1/2 object-contain"
          />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
