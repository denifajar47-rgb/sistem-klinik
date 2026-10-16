"use client";
import { useState } from 'react';
import { Users, Search, Shield, Eye, EyeOff, FileText, X } from 'lucide-react';
import { sanitizeInput } from '../../lib/security';
import { useKlinik } from '../../context/KlinikContext';

export default function DataPasien() {
  const { pasienList, laporanList } = useKlinik();
  const [searchTerm, setSearchTerm] = useState('');
  const [maskNIK, setMaskNIK] = useState(true);
  const [selectedPasienHistory, setSelectedPasienHistory] = useState<string | null>(null);

  const cleanSearch = sanitizeInput(searchTerm).toLowerCase();

  const filteredPasien = pasienList.filter(
    (p) =>
      p.nama.toLowerCase().includes(cleanSearch) ||
      p.nik.includes(cleanSearch) ||
      p.id.toLowerCase().includes(cleanSearch)
  );

  const selectedPasien = pasienList.find(p => p.id === selectedPasienHistory);
  const pasienReports = laporanList.filter(l => l.pasienId === selectedPasienHistory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-600" size={30} />
            Data Pasien Klinik Rakyat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Basis data rekam pasien terverifikasi dengan enkripsi data pribadi & opsi masking NIK.
          </p>
        </div>

        {/* Tombol Masking NIK untuk Privasi */}
        <button
          onClick={() => setMaskNIK(!maskNIK)}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-xs transition"
        >
          {maskNIK ? <Eye size={15} /> : <EyeOff size={15} />}
          <span>{maskNIK ? 'Tampilkan NIK Lengkap' : 'Sensor / Masking NIK'}</span>
        </button>
      </div>

      {/* Pencarian Pasien */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari pasien berdasarkan Nama, NIK, atau ID Pasien..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabel Data Pasien */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <th className="p-3.5">ID Pasien</th>
                <th className="p-3.5">NIK (Kependudukan)</th>
                <th className="p-3.5">Nama Lengkap</th>
                <th className="p-3.5">Jenis Kelamin</th>
                <th className="p-3.5">Usia</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPasien.map((p) => {
                const displayNIK = maskNIK 
                  ? p.nik.slice(0, 6) + '******' + p.nik.slice(12) 
                  : p.nik;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="p-3.5 font-mono text-slate-600">{displayNIK}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{p.nama}</td>
                    <td className="p-3.5 text-slate-600">{p.jenisKelamin}</td>
                    <td className="p-3.5 text-slate-700">{p.usia} Tahun</td>
                    <td className="p-3.5 text-center">
                      <button 
                        onClick={() => setSelectedPasienHistory(p.id)}
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Riwayat Medis
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPasien.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Tidak ditemukan data pasien yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Riwayat Medis Pasien */}
      {selectedPasienHistory && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-600" size={20} />
                <h3 className="font-bold text-slate-800 text-base">
                  Rekam Riwayat: {selectedPasien?.nama} ({selectedPasien?.id})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPasienHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {pasienReports.length > 0 ? (
                pasienReports.map((rep) => (
                  <div key={rep.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Tanggal: {rep.tanggal}</span>
                      <span className="text-emerald-600">{rep.id}</span>
                    </div>
                    <p><strong className="text-slate-600">Keluhan:</strong> {rep.keluhan}</p>
                    <p><strong className="text-slate-600">Diagnosis:</strong> <span className="text-blue-600 font-semibold">{rep.diagnosis}</span></p>
                    <p><strong className="text-slate-600">Obat:</strong> {rep.obatDiberikan || '-'}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-400 py-6">
                  Belum ada catatan riwayat pemeriksaan medis untuk pasien ini.
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedPasienHistory(null)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
