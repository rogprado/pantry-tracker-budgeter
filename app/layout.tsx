import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Suspense } from "react";
import Header from "@/app/components/Header";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pantry",
  description: "Track your pantry, cook with what you have, and stay on budget.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* The header and pages read the login cookie at request time, so they stream in. */}
        <Suspense fallback={<div className="h-[57px] border-b border-lavender bg-white" />}>
          <Header />
        </Suspense>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <Suspense fallback={<div className="card text-gray-500">Loading…</div>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
