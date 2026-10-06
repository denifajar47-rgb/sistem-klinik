"use client";
import { useState } from 'react';
import { dummyAntrean, dummyPasien, Antrean } from '../../data/dummyData';

export default function Pendaftaran() {
  const [antrean, setAntrean] = useState<Antrean[]>(dummyAntrean);

  // State untuk form
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [jk, setJk] = useState('Laki-laki');
  const [usia, setUsia] = useState('');

  // Fungsi untuk menangani pendaftaran pasien baru
  const handleDaftar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buat pasien baru (dalam skenario nyata, disimpan ke DB)
    const newPasienId = 'P00' + (dummyPasien.length + 1);
    dummyPasien.push({
      id: newPasienId,
      nik: nik,
      nama: nama,
      jenisKelamin: jk,
      usia: parseInt(usia) || 0
    });

    // Tambah ke antrean
    const newAntrean: Antrean = {
      id: 'A00' + (antrean.length + 1),
      pasienId: newPasienId,
      status: 'Menunggu',
      tanggal: new Date().toISOString().split('T')[0]
    };
    
    setAntrean([...antrean, newAntrean]);

    // Reset form
    setNik(''); setNama(''); setUsia('');
    alert('Pendaftaran Berhasil & Masuk Antrean!');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Pendaftaran & Antrean</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Pendaftaran */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Form Pasien Baru</h2>
          <form onSubmit={handleDaftar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
              <input 
                type="text" 
                value={nik} 
                onChange={(e) => setNik(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={nama} 
                onChange={(e) => setNama(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select 
                value={jk} 
                onChange={(e) => setJk(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usia</label>
              <input 
                type="number" 
                value={usia} 
                onChange={(e) => setUsia(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
              Daftar & Masukkan Antrean
            </button>
          </form>
        </div>

        {/* Tabel Antrean */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Daftar Antrean Hari Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-sm font-semibold text-gray-600">No. Antrean</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Nama Pasien</th>
                </tr>
              </thead>
              <tbody>
                {antrean.map((a, index) => {
                  const pasien = dummyPasien.find(p => p.id === a.pasienId);
                  return (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{a.id}</td>
                      <td className="p-3">{pasien?.nama || 'Unknown'}</td>
                    </tr>
                  );
                })}
                {antrean.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-gray-500">Tidak ada antrean hari ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
