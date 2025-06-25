"use client"
import { Element, Link as LinkScroll } from "react-scroll";
import Button from "@/components/shared/Button";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative pt-[15rem] pb-[10rem] lg:pt-[12rem] lg:pb-[9rem] md:pt-[9rem] md:pb-[8rem] sm:pt-[7rem] sm:pb-[6rem]">
      <Element name="hero">
        <div className="container">
          <div className="relative z-2 max-w-[24rem] lg:max-w-[32.25rem] md:max-w-full">
            <div className="caption mb-5">Strategic Automation</div>
            <h1 className="mb-6 text-[2.5rem] font-black leading-[3rem] tracking-[-0.03em] uppercase text-p4 lg:text-[4rem] lg:leading-[4rem] md:text-[3rem] md:leading-[3rem] sm:text-[2.5rem] sm:leading-[2.75rem]">
              Trade Smarter, Not Harder
            </h1>
            <p className="max-w-[27.5rem] mb-14 text-[1.375rem] leading-[2.25rem] md:mb-10 md:text-[1.125rem] md:leading-[1.75rem] sm:text-[1rem] sm:leading-[1.5rem]">
              Our tool simplifies portfolio management, automates trading strategies, and empowers you with tools to grow faster, securely and efficiently.
            </p>
            <LinkScroll to="features" offset={-100} spy smooth>
              <Button icon="/assets/images/zap.svg">Try it now</Button>
            </LinkScroll>
          </div>

          <div className="absolute -top-32 left-[calc(50%-340px)] w-[1230px] pointer-events-none hero-img_res max-md:hidden">
            <Image
              src="/assets/images/hero.png"
              className="size-200 max-lg:h-auto"
              width={20}
              height={50}
              alt="hero"
            />
          </div>
        </div>
      </Element>
    </section>
  );
};

export default Hero;