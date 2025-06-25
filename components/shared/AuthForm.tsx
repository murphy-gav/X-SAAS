/* eslint-disable react-hooks/rules-of-hooks */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  signUpSchema,
  signInSchema,
  type SignUpFormData,
  type SignInFormData,
  type AuthType,
} from "@/lib/utils";
// import type { User } from "@/types";
import { signUp, signIn, resendOtpLink } from "@/lib/actions/user.actions";
import CustomInput from "./CustomInput";
import { Button } from "@/components/ui/button";
import { Form as ShadcnForm } from "@/components/ui/form";

//
// ——— Helper: Default values for each variant ———
//
const getDefaultValues = (type: AuthType) => {
  switch (type) {
    case "sign-up":
      return {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      } as SignUpFormData;

    case "sign-in":
    default:
      return {
        email: "",
        password: "",
      } as SignInFormData;
  }
};

interface AuthFormProps {
  type: AuthType;
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResend, setShowResend] = useState(false)

  //
  // 1) Branch: “sign-up”
  // — useForm<SignUpFormData> with signUpSchema —
  //
  if (type === "sign-up") {
    const form = useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      defaultValues: getDefaultValues(type),
    });
    const {
      control,
      handleSubmit,
      formState: { isSubmitting: rhfSubmitting },
    } = form;

    const onSubmit = async (data: SignUpFormData) => {
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const result = await signUp(data);
        if ("error" in result) {
          setErrorMessage(result.error ?? "Error occcurred, Please try again later!");
        } else if ("needsEmailVerification" in result) {
          router.push(`/email-sent?email=${encodeURIComponent(result.email)}`);
          return;
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "An Error occurred");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <section className="flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-10 md:gap-8 mx-auto">
        <HeaderSection
          title="Sign Up"
          subtitle="Please enter your details"
        />

        <ShadcnForm<SignUpFormData> {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="flex gap-4 w-full">
              <CustomInput<SignUpFormData>
                control={control}
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
              />
              <CustomInput<SignUpFormData>
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
              />
            </div>

            <CustomInput<SignUpFormData>
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
            />

            <CustomInput<SignUpFormData>
              control={control}
              name="password"
              label="Password"
              placeholder="Enter password"
              type="password"
            />

            <CustomInput<SignUpFormData>
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
            />

            <div className="flex flex-col gap-4">
              <SubmitButton
                isLoading={rhfSubmitting || isSubmitting}
                text="Sign Up"
              />
              {errorMessage !== null && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </ShadcnForm>
        
        <FooterLinks
          prompt="Already have an account?"
          linkText="Sign in"
          href="/sign-in"
        />
      </section>
    );
  }

  //
  // 2) Branch: “sign-in”
  // — useForm<SignInFormData> with signInSchema —
  //
  if (type === "sign-in") {
    const form = useForm<SignInFormData>({
      resolver: zodResolver(signInSchema),
      defaultValues: getDefaultValues(type),
    });
    const {
      control,
      handleSubmit,
      getValues,
      formState: { isSubmitting: rhfSubmitting },
    } = form;

    const onSubmit = async (data: SignInFormData) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      setShowResend(false);

      try {
        const response = await signIn(data);
        if ('error' in response) {
          if (response.needsVerification) {
            setErrorMessage('Please verify your email before signing in');
            setShowResend(true);
          } else {
            setErrorMessage(response.error ?? null);
          }
        } else {
          router.push("/d");
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <section className="flex min-h-screen w-full max-w-[420px] mx-auto flex-col justify-center gap-5 py-10 md:gap-8">
        <HeaderSection
          title="Sign In"
          subtitle="Please enter your details"
        />

        <ShadcnForm<SignInFormData> {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <CustomInput<SignInFormData>
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
            />

            <CustomInput<SignInFormData>
              control={control}
              name="password"
              label="Password"
              placeholder="Enter password"
              type="password"
            />

            <div className="flex flex-col gap-4">
              <SubmitButton
                isLoading={rhfSubmitting || isSubmitting}
                text="Sign In"
              />
              {errorMessage !== null && (
                <p className="text-red-400 text-sm text-center capitalize">
                  {errorMessage}
                </p>
              )}

              {showResend && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <p className="text-sm text-gray-400">
                    Didn&apos;t receive the verification email?
                  </p>
                  <button
                    type="button"
                    className="text-blue-400 underline text-sm"
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const email = getValues("email");
                        if (email) {
                          await resendOtpLink(email);
                          setErrorMessage("✅ Verification email resent. Please check your inbox.");
                          setTimeout(() => setErrorMessage(null), 5000);
                        }
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      } catch (err) {
                        setErrorMessage("Failed to resend verification email");
                      } finally {
                        setIsSubmitting(false);
                        setShowResend(false);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Resend verification email"
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </ShadcnForm>

        {!showResend && <FooterLinks
          prompt="Don't have an account?"
          linkText="Sign up"
          href="/sign-up"
        />}
      </section>
    );
  }

  // Fallback (should never reach here):
  return null;
};

export default AuthForm;

//
// ——— Shared Sub‐components ———
//

// HeaderSection: shows logo + dynamic title/subtitle
const HeaderSection: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => (
  <header className="flex flex-col gap-5 md:gap-8">
    <Link href="/" className="cursor-pointer flex items-center gap-1">
      <Image
        src="/assets/images/StratSync.svg"
        width={240}
        height={124}
        alt="StratSync logo"
      />
    </Link>

    <div className="flex flex-col gap-1 md:gap-3">
      <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
        {title}
      </h1>
      <p className="text-16 font-normal text-gray-400">
        {subtitle}
      </p>
    </div>
  </header>
);

// SubmitButton: shows spinner if submitting
const SubmitButton: React.FC<{
  isLoading: boolean;
  text: string;
}> = ({ isLoading, text }) => (
  <Button type="submit" disabled={isLoading} className="text-16 rounded-lg border border-bankGradient bg-bank-gradient font-semibold text-white shadow-form w-full cursor-pointer">
    {isLoading ? (
      <>
        <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
      </>
    ) : (
      text
    )}
  </Button>
);

interface FooterLinksProps {
  prompt: string;
  linkText: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

// FooterLinks: dynamic footer link under each form
const FooterLinks: React.FC<FooterLinksProps> = ({ prompt, linkText, href, onClick }) => (
  <footer className="flex justify-center gap-1">
    <p className="text-14 font-normal text-gray-400">{prompt}</p>
    <Link href={href} onClick={onClick} className="form-link">
      {linkText}
    </Link>
  </footer>
);