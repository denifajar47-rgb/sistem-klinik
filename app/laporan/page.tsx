"use client";
import { dummyLaporan, dummyPasien } from '../../data/dummyData';

export default function LaporanKunjungan() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Laporan Riwayat Kunjungan</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Nama Pasien</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Keluhan</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Diagnosis</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Obat Diberikan</th>
              </tr>
            </thead>
            <tbody>
              {dummyLaporan.map((l) => {
                const pasien = dummyPasien.find(p => p.id === l.pasienId);
                return (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{l.tanggal}</td>
                    <td className="p-3 font-medium">{pasien?.nama || 'Unknown'}</td>
                    <td className="p-3">{l.keluhan}</td>
                    <td className="p-3 text-blue-600">{l.diagnosis}</td>
                    <td className="p-3">{l.obatDiberikan || '-'}</td>
                  </tr>
                );
              })}
              {dummyLaporan.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Belum ada riwayat kunjungan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
