import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema UNASP",
  description: "Controle de Manutenção",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background">
          {/* Menu Lateral */}
          <Sidebar />
          
          {/* Conteúdo Principal (Empurrado para a direita) */}
          <main className="flex-1 ml-72 p-8 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}