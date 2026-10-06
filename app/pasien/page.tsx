"use client";
import { dummyPasien } from '../../data/dummyData';

export default function DataPasien() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Data Pasien</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">ID Pasien</th>
                <th className="p-3 text-sm font-semibold text-gray-600">NIK</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Nama Lengkap</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Usia</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dummyPasien.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.nik}</td>
                  <td className="p-3 font-medium">{p.nama}</td>
                  <td className="p-3">{p.usia} Tahun</td>
                  <td className="p-3">
                    <button 
                      onClick={() => alert(`Menampilkan riwayat kunjungan ${p.nama}`)}
                      className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition"
                    >
                      Lihat Riwayat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
