"use client";
import { Users, UserCheck, Pill } from 'lucide-react';
import { dummyPasien, dummyAntrean, dummyObat } from '../data/dummyData';

export default function Dashboard() {
  // Hitung statistik untuk dashboard
  const totalPasien = dummyPasien.length;
  const antreanMenunggu = dummyAntrean.filter(a => a.status === 'Menunggu').length;
  const totalJenisObat = dummyObat.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Total Pasien */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pasien (Hari ini)</p>
            <p className="text-2xl font-bold text-gray-800">{totalPasien}</p>
          </div>
        </div>

        {/* Kartu Total Antrean */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-100 rounded-full text-orange-600">
            <UserCheck size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Antrean Menunggu</p>
            <p className="text-2xl font-bold text-gray-800">{antreanMenunggu}</p>
          </div>
        </div>

        {/* Kartu Jumlah Obat */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full text-green-600">
            <Pill size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Jenis Obat</p>
            <p className="text-2xl font-bold text-gray-800">{totalJenisObat}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
