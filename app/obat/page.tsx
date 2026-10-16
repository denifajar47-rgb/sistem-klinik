"use client";
import { useState } from 'react';
import { Pill, Search, Plus, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sanitizeInput } from '../../lib/security';
import { useAuth } from '../../context/AuthContext';
import { useKlinik } from '../../context/KlinikContext';

export default function StokObat() {
  const { currentUser } = useAuth();
  const { obatList, tambahAtauRestokObat } = useKlinik();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal tambah stok / obat baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newStok, setNewStok] = useState('');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cleanSearch = sanitizeInput(searchTerm).toLowerCase();
  const filteredObat = obatList.filter(
    (o) =>
      o.nama.toLowerCase().includes(cleanSearch) ||
      o.kode.toLowerCase().includes(cleanSearch)
  );

  const handleTambahObat = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    const cleanKode = sanitizeInput(newKode).toUpperCase();
    const cleanNama = sanitizeInput(newNama);
    const stokNum = parseInt(newStok, 10);

    if (!cleanKode || !cleanNama || isNaN(stokNum) || stokNum < 0) {
      setFormMsg({ type: 'error', text: 'Semua kolom wajib diisi dengan format valid.' });
      return;
    }

    tambahAtauRestokObat(
      { kode: cleanKode, nama: cleanNama, stok: stokNum },
      currentUser?.name || 'Apoteker'
    );

    setFormMsg({ type: 'success', text: `Stok obat ${cleanNama} berhasil diperbarui!` });
    setNewKode('');
    setNewNama('');
    setNewStok('');
    setTimeout(() => {
      setShowAddModal(false);
      setFormMsg(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Pill className="text-emerald-600" size={30} />
            Manajemen Obat & Farmasi Klinik Rakyat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan persediaan obat terdaftar. Stok berkurang otomatis setiap kali obat diresepkan pada pemeriksaan dokter.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah / Restok Obat</span>
        </button>
      </div>

      {/* Pencarian Obat */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama obat atau kode..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Tabel Stok Obat */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Kode Obat</th>
                <th className="p-3.5">Nama Obat</th>
                <th className="p-3.5">Sisa Stok</th>
                <th className="p-3.5">Status Persediaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredObat.map((o) => (
                <tr key={o.kode} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-800">{o.kode}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{o.nama}</td>
                  <td className="p-3.5 font-bold text-slate-800">{o.stok} Unit</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      o.stok > 30 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : o.stok > 10 
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {o.stok > 30 ? 'Stok Melimpah' : o.stok > 10 ? 'Cukup' : 'Kritis / Habis'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredObat.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Tidak ditemukan data obat yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Restok */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Tambah / Perbarui Stok Obat</h3>
            
            {formMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleTambahObat} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Obat (Contoh: OB004)</label>
                <input
                  type="text"
                  required
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  placeholder="Kode unik obat"
                  className="w-full p-2.5 border border-slate-300 rounded-lg uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Obat</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Nama sediaan obat"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Stok</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newStok}
                  onChange={(e) => setNewStok(e.target.value)}
                  placeholder="Jumlah unit"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
                >
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
