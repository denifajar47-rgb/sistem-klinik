"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Stethoscope, 
  Pill, 
  FileText, 
  Lock
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // Daftar menu navigasi
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Pendaftaran & Antrean', path: '/pendaftaran', icon: <UserPlus size={20} /> },
    { name: 'Data Pasien', path: '/pasien', icon: <Users size={20} /> },
    { name: 'Pemeriksaan', path: '/pemeriksaan', icon: <Stethoscope size={20} /> },
    { name: 'Obat & Farmasi', path: '/obat', icon: <Pill size={20} /> },
    { name: 'Laporan Kunjungan', path: '/laporan', icon: <FileText size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-full border-r border-gray-100">
      {/* Brand Header: Klinik Rakyat */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 flex-shrink-0">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
              Klinik Rakyat
            </h1>
            <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Medis Terpadu
            </p>
          </div>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link 
              href={item.path} 
              key={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security Status Box */}
      <div className="p-4 border-t border-gray-100 bg-slate-50/80 m-3 rounded-xl border border-slate-200/60">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0 mt-0.5">
            <Lock size={14} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Sistem Terlindungi</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enkripsi Sesi, Anti-XSS & Proteksi Akses Aktif.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
