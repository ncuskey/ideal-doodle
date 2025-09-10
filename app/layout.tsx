import './globals.css';
import { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import { ToastProvider } from '@/components/ui/Toast';
import ScrollProgress from '@/components/ScrollProgress';

export const metadata: Metadata = { title: 'Lore UI', description: 'Worldbuilder GM dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
        <ScrollProgress />
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded bg-white px-3 py-2 shadow">Skip to content</a>
        <ToastProvider>
          <div className="mx-auto max-w-7xl p-6 md:p-10 space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h1 className="text-xl font-bold tracking-tight">Lore UI</h1>
              <NavBar/>
            </header>
            <main id="content">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
