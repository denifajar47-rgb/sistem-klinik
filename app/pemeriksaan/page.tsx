"use client";
import { useState } from 'react';
import { 
  sanitizeInput, 
  detectMaliciousPattern, 
  addAuditLog 
} from '../../lib/security';
import { useAuth } from '../../context/AuthContext';
import { useKlinik } from '../../context/KlinikContext';
import { Stethoscope, ShieldCheck, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export default function Pemeriksaan() {
  const { currentUser } = useAuth();
  const { antreanList, pasienList, obatList, selesaikanPemeriksaan } = useKlinik();
  
  // Ambil pasien yang status antreannya masih 'Menunggu'
  const antreanMenunggu = antreanList.filter(a => a.status === 'Menunggu');
  
  const [selectedAntreanId, setSelectedAntreanId] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [obatTerpilih, setObatTerpilih] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedAntreanId) {
      setErrorMessage('Pilih pasien dari daftar antrean terlebih dahulu.');
      return;
    }

    // 1. Cek Serangan Injeksi / Scripting pada keluhan & diagnosis
    const checkKeluhan = detectMaliciousPattern(keluhan);
    const checkDiag = detectMaliciousPattern(diagnosis);

    if (checkKeluhan.isMalicious || checkDiag.isMalicious) {
      const reason = checkKeluhan.reason || checkDiag.reason;
      setErrorMessage(`[Perlindungan Sistem] ${reason}`);
      addAuditLog({
        action: 'INJECTION_ATTEMPT_BLOCKED',
        user: currentUser?.name || 'Dokter',
        status: 'BLOCKED',
        details: 'Upaya injeksi skrip berbahaya pada formulir rekam medis dokter diblokir.'
      });
      return;
    }

    const cleanKeluhan = sanitizeInput(keluhan);
    const cleanDiagnosis = sanitizeInput(diagnosis);

    if (!cleanKeluhan || !cleanDiagnosis) {
      setErrorMessage('Keluhan dan Diagnosis wajib diisi dengan teks valid.');
      return;
    }

    const targetAntrean = antreanList.find(a => a.id === selectedAntreanId);
    const pasien = targetAntrean ? pasienList.find(p => p.id === targetAntrean.pasienId) : null;

    // Selesaikan pemeriksaan dan otomatis ubah status antrean menjadi 'Selesai'
    const success = selesaikanPemeriksaan({
      antreanId: selectedAntreanId,
      keluhan: cleanKeluhan,
      diagnosis: cleanDiagnosis,
      obatNama: obatTerpilih || '-',
      dokterName: currentUser?.name || 'dr. Penanggung Jawab'
    });

    if (success) {
      setSuccessMessage(`Pemeriksaan pasien ${pasien?.nama || selectedAntreanId} berhasil disimpan! Status antrean ${selectedAntreanId} otomatis berubah menjadi "Selesai".`);
      
      // Reset form
      setSelectedAntreanId('');
      setKeluhan('');
      setDiagnosis('');
      setObatTerpilih('');
    } else {
      setErrorMessage('Gagal memproses pemeriksaan. Silakan coba kembali.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          <Stethoscope className="text-emerald-600" size={30} />
          Pemeriksaan Dokter - Rekam Medis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Setelah hasil pemeriksaan disimpan, status antrean pasien akan otomatis diperbarui menjadi <strong>Selesai</strong>.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Form Hasil Pemeriksaan Klinis
          </h2>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck size={14} /> Sinkronisasi Status Otomatis
          </span>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSimpan} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Pasien dari Antrean Aktif <span className="text-red-500">*</span>
            </label>
            <select 
              value={selectedAntreanId} 
              onChange={(e) => setSelectedAntreanId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            >
              <option value="" disabled>-- Pilih Pasien Menunggu ({antreanMenunggu.length} Pasien) --</option>
              {antreanMenunggu.map((a) => {
                const pasien = pasienList.find(p => p.id === a.pasienId);
                return (
                  <option key={a.id} value={a.id}>
                    {a.id} - {pasien?.nama || 'Pasien'} ({pasien?.jenisKelamin || '-'}, {pasien?.usia || 0} thn)
                  </option>
                );
              })}
            </select>
            {antreanMenunggu.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                <UserCheck size={14} /> Saat ini tidak ada pasien yang sedang menunggu antrean pemeriksaan.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keluhan Pasien (Anamnesis) <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={keluhan} 
              onChange={(e) => setKeluhan(e.target.value)}
              placeholder="Jelaskan keluhan utama pasien..."
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Diagnosis Medis <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Hasil diagnosa dokter..."
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resep / Obat yang Diberikan
            </label>
            <select 
              value={obatTerpilih} 
              onChange={(e) => setObatTerpilih(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">-- Tanpa Obat / Konseling Saja --</option>
              {obatList.map(o => (
                <option key={o.kode} value={o.nama}>
                  {o.nama} (Stok Tersedia: {o.stok})
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={antreanMenunggu.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Stethoscope size={18} />
            Simpan Hasil Pemeriksaan & Ubah Antrean Jadi Selesai
          </button>
        </form>
      </div>
    </div>
  );
}
