"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, Stethoscope, Pill, FileText } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // Daftar menu navigasi
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Pendaftaran & Antrean', path: '/pendaftaran', icon: <UserPlus size={20} /> },
    { name: 'Data Pasien', path: '/pasien', icon: <Users size={20} /> },
    { name: 'Pemeriksaan', path: '/pemeriksaan', icon: <Stethoscope size={20} /> },
    { name: 'Obat', path: '/obat', icon: <Pill size={20} /> },
    { name: 'Laporan', path: '/laporan', icon: <FileText size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Stethoscope className="text-blue-600" />
          Klinik Sehat
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              href={item.path} 
              key={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium shadow-md' 
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
