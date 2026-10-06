"use client";
import { dummyObat } from '../../data/dummyData';

export default function StokObat() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manajemen Stok Obat</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">Kode Obat</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Nama Obat</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Sisa Stok</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyObat.map((o) => (
                <tr key={o.kode} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-600">{o.kode}</td>
                  <td className="p-3">{o.nama}</td>
                  <td className="p-3">{o.stok}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      o.stok > 20 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {o.stok > 20 ? 'Aman' : 'Hampir Habis'}
                    </span>
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
