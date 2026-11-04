import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Suspense } from "react";
import Sidebar from "@/app/components/Sidebar";
import Toaster from "@/app/components/Toaster";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], axes: ["opsz"] });
// An editorial serif for page titles and big numbers.
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Pantry",
  description: "Track your pantry, cook with what you have, and stay on budget.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full lg:flex">
        {/* The sidebar and pages read the login cookie at request time, so they stream in. */}
        <Suspense fallback={<div className="lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-lavender-200" />}>
          <Sidebar />
        </Suspense>
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <Suspense fallback={<p className="text-muted">Loading…</p>}>{children}</Suspense>
          </div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
