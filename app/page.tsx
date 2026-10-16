"use client";
import { Users, UserCheck, Pill, ShieldCheck, ArrowRight, Activity, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useKlinik } from '../context/KlinikContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { pasienList, antreanList, obatList } = useKlinik();

  // Hitung statistik untuk dashboard secara real-time dari KlinikContext
  const totalPasien = pasienList.length;
  const antreanMenunggu = antreanList.filter(a => a.status === 'Menunggu').length;
  const antreanSelesai = antreanList.filter(a => a.status === 'Selesai').length;
  const totalJenisObat = obatList.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner Klinik Rakyat */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-emerald-200 mb-3">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>Sistem Terenkripsi & Sinkronisasi Otomatis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Klinik Rakyat, {currentUser?.name || 'Dokter/Staff'}!
          </h1>
          <p className="mt-2 text-emerald-100/90 text-sm max-w-2xl">
            Sistem informasi manajemen operasional klinik rakyat terpadu dengan antrean otomatis, rekam medis terenkripsi, dan proteksi integritas data.
          </p>
        </div>
      </div>
      
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Kartu Total Pasien */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pasien Terdaftar</p>
            <p className="text-2xl font-bold text-slate-800">{totalPasien}</p>
          </div>
        </div>

        {/* Kartu Antrean Menunggu */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Antrean Menunggu</p>
            <p className="text-2xl font-bold text-amber-600">{antreanMenunggu}</p>
          </div>
        </div>

        {/* Kartu Antrean Selesai */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pemeriksaan Selesai</p>
            <p className="text-2xl font-bold text-emerald-600">{antreanSelesai}</p>
          </div>
        </div>

        {/* Kartu Jumlah Obat */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <Pill size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Jenis Obat</p>
            <p className="text-2xl font-bold text-slate-800">{totalJenisObat}</p>
          </div>
        </div>
      </div>

      {/* Akses Cepat Modul Navigasi */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Akses Cepat Modul Klinik Rakyat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/pendaftaran"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition">
                Pendaftaran & Antrean
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Daftarkan pasien baru dan pantau nomor antrean dengan status terupdate otomatis.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>Buka Loket Pendaftaran</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/pemeriksaan"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition">
                Pemeriksaan Dokter
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Input hasil periksa & diagnosa. Status antrean langsung berubah menjadi Selesai.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Mulai Pemeriksaan Medis</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/laporan"
            className="group bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition">
                Laporan Kunjungan Medis
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Rekapitulasi riwayat pemeriksaan, diagnosa klinis, dan pencetakan dokumen kunjungan pasien.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
              <span>Buka Laporan Kunjungan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
