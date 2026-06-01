import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Utensils, Calendar, BookOpen, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoMenu - Smart Household Meal Planning",
  description: "Digital cookbook and AI-driven meal planner for your household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl flex items-center gap-2 text-indigo-600">
              <Utensils className="w-6 h-6" />
              <span>CoMenu</span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/recipes" className="text-sm font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Cookbook</span>
              </Link>
              <Link href="/planner" className="text-sm font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Planner</span>
              </Link>
              <Link href="/profile" className="text-sm font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
          <p>© 2026 CoMenu - Happy Cooking!</p>
        </footer>
      </body>
    </html>
  );
}
