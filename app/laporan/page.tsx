"use client";
import { useState } from 'react';
import { FileText, Search, Printer, ShieldCheck } from 'lucide-react';
import { sanitizeInput } from '../../lib/security';
import { useKlinik } from '../../context/KlinikContext';

export default function LaporanKunjungan() {
  const { laporanList, pasienList } = useKlinik();
  const [searchTerm, setSearchTerm] = useState('');

  const cleanSearch = sanitizeInput(searchTerm).toLowerCase();

  const filteredLaporan = laporanList.filter((l) => {
    const pasien = pasienList.find((p) => p.id === l.pasienId);
    const namaPasien = pasien?.nama?.toLowerCase() || '';
    return (
      namaPasien.includes(cleanSearch) ||
      l.diagnosis.toLowerCase().includes(cleanSearch) ||
      l.keluhan.toLowerCase().includes(cleanSearch) ||
      l.tanggal.includes(cleanSearch) ||
      l.id.toLowerCase().includes(cleanSearch)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="text-emerald-600" size={30} />
            Laporan Kunjungan & Riwayat Medis Klinik Rakyat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekapitulasi berkas pemeriksaan pasien untuk arsip rekam medis dan pelaporan berkala.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Printer size={15} />
          <span>Cetak Dokumen</span>
        </button>
      </div>

      {/* Filter Pencarian */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama pasien, diagnosis, atau keluhan..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Tabel Laporan */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <th className="p-3.5">No. Rekam</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Keluhan Pasien</th>
                <th className="p-3.5">Hasil Diagnosis</th>
                <th className="p-3.5">Obat Diberikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLaporan.map((l) => {
                const pasien = pasienList.find((p) => p.id === l.pasienId);
                return (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{l.id}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{l.tanggal}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{pasien?.nama || 'Unknown'}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs">{l.keluhan}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {l.diagnosis}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{l.obatDiberikan || '-'}</td>
                  </tr>
                );
              })}
              {filteredLaporan.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Belum ada riwayat kunjungan tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
