import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "Sistem Informasi Klinik",
  description: "Manajemen klinik menjadi lebih mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex h-screen bg-gray-50">
        {/* Navigasi Samping */}
        <Sidebar />
        
        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
