import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import TwitchIcon from "@/components/icons/twitch";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pick'Ems",
  description: "Roflgator Pick'Em Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en" className="dark">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <SignedIn>
              <Navigation />

              {children}
            </SignedIn>

            <SignedOut>
              <div className="flex items-center justify-center min-h-screen">
                <SignInButton>
                  <Button variant="twitch">
                    <TwitchIcon />
                    Sign In With Twitch
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>

            <Analytics />
            <SpeedInsights />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}

