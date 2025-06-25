import { IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeProvider";
import "./globals.css";

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibmPlexSans",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "StratSync: Smarter Crypto Trading with Automated Strategies",
  description:
    "StratSync is a modern tool that empowers users to automate trading, follow expert strategies, and manage assets across top exchanges, securely and efficiently.",
  openGraph: {
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    title: "StratSync: Smarter Crypto Trading with Automated Strategies",
    description:
      "Join StratSync to automate your crypto trades, copy expert strategies, track performance in real-time, and manage multiple exchange accounts from one powerful dashboard.",
    images: [
      {
        url: "/assets/images/stratsync-og.png", // Replace with your OG image path
        width: 1200,
        height: 630,
        alt: "StratSync Crypto SaaS Platform Open Graph Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
