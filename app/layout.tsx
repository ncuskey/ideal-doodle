import "./globals.css";
import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { ToastProvider } from "@/components/ui/Toast";
import ScrollProgress from "@/components/ScrollProgress";
import { Inter, Lora } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Lore UI",
  description: "Worldbuilder GM dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ScrollProgress />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded-md bg-card px-3 py-2 shadow-soft ring-1 ring-ring"
        >
          Skip to content
        </a>
        <ToastProvider>
          <div className="mx-auto max-w-7xl p-6 md:p-10 space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-xl font-semibold tracking-tight">Lore UI</div>
              <NavBar />
            </header>
            <main id="content">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
