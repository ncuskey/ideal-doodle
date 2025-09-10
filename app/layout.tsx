import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lore UI",
  description: "Worldbuilder GM dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <div className="mx-auto max-w-7xl p-6 md:p-10 space-y-8">
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Lore UI</h1>
            <nav className="flex gap-3 text-sm">
              <a className="hover:underline" href="/">Dashboard</a>
              <a className="hover:underline" href="/states">States</a>
              <a className="hover:underline" href="/provinces">Provinces</a>
              <a className="hover:underline" href="/burgs">Burgs</a>
              <a className="hover:underline" href="/markers">Markers</a>
              <a className="hover:underline" href="/hooks">Hooks</a>
              <a className="hover:underline" href="/events">Events</a>
              <a className="hover:underline" href="/qa">QA</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
