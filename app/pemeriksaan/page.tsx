"use client";
import { useState } from 'react';
import { dummyAntrean, dummyPasien, dummyObat, dummyLaporan, Laporan } from '../../data/dummyData';

export default function Pemeriksaan() {
  // Ambil pasien yang sedang menunggu
  const antreanMenunggu = dummyAntrean.filter(a => a.status === 'Menunggu');
  
  const [selectedAntreanId, setSelectedAntreanId] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [obatTerpilih, setObatTerpilih] = useState('');

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAntreanId) {
      alert('Pilih pasien terlebih dahulu!');
      return;
    }

    const antreanData = dummyAntrean.find(a => a.id === selectedAntreanId);
    if (antreanData) {
      // Simpan laporan
      const laporanBaru: Laporan = {
        id: 'L00' + (dummyLaporan.length + 1),
        pasienId: antreanData.pasienId,
        tanggal: new Date().toISOString().split('T')[0],
        keluhan,
        diagnosis,
        obatDiberikan: obatTerpilih
      };
      dummyLaporan.push(laporanBaru);

      // Ubah status antrean jadi selesai
      antreanData.status = 'Selesai';

      // Kurangi stok obat jika ada obat dipilih
      if (obatTerpilih) {
         const obat = dummyObat.find(o => o.nama === obatTerpilih);
         if (obat && obat.stok > 0) obat.stok -= 1;
      }

      alert('Data pemeriksaan berhasil disimpan!');
      
      // Reset form
      setSelectedAntreanId(''); setKeluhan(''); setDiagnosis(''); setObatTerpilih('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800">Pemeriksaan Dokter</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSimpan} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pasien dari Antrean</label>
            <select 
              value={selectedAntreanId} 
              onChange={(e) => setSelectedAntreanId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="" disabled>-- Pilih Pasien Menunggu --</option>
              {antreanMenunggu.map((a) => {
                const pasien = dummyPasien.find(p => p.id === a.pasienId);
                return (
                  <option key={a.id} value={a.id}>
                    {a.id} - {pasien?.nama}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan</label>
            <textarea 
              value={keluhan} 
              onChange={(e) => setKeluhan(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 h-24"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <textarea 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 h-24"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obat yang Diberikan</label>
            <select 
              value={obatTerpilih} 
              onChange={(e) => setObatTerpilih(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">-- Tanpa Obat --</option>
              {dummyObat.map(o => (
                <option key={o.kode} value={o.nama}>{o.nama} (Stok: {o.stok})</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
            Simpan Hasil Pemeriksaan
          </button>
        </form>
      </div>
    </div>
  );
}
