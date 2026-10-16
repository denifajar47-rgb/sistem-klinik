"use client";
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 shadow-2xs">
          <ShieldCheck size={15} className="text-emerald-600 animate-pulse" />
          <span>Sistem Terenkripsi & Aman</span>
        </div>
        <span className="text-xs text-gray-400 hidden md:inline">|</span>
        <span className="text-xs text-gray-500 hidden md:inline">
          Protokol Medis & Data Pasien Terproteksi
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Info Pengguna Sedang Login */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {currentUser.name}
            </p>
            <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded uppercase tracking-wide bg-blue-100 text-blue-700">
              {currentUser.roleName}
            </span>
          </div>

          <div className={`w-9 h-9 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow`}>
            {currentUser.name.charAt(0)}
          </div>

          {/* Tombol Logout */}
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin keluar dari sistem Klinik Rakyat? Sesi Anda akan ditutup dengan aman.')) {
                logout();
              }
            }}
            title="Keluar dari Akun"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
