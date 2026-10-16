import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AuthProvider } from "../context/AuthContext";
import { KlinikProvider } from "../context/KlinikContext";

export const metadata: Metadata = {
  title: "Klinik Rakyat - Sistem Informasi & Manajemen Klinik",
  description: "Aplikasi Manajemen Klinik Rakyat Terpadu dengan Proteksi Keamanan Tingkat Tinggi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden">
        <AuthProvider>
          <KlinikProvider>
            <div className="flex h-screen w-screen overflow-hidden">
              {/* Navigasi Samping */}
              <Sidebar />
              
              {/* Area Utama */}
              <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/70">
                  {children}
                </main>
              </div>
            </div>
          </KlinikProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
