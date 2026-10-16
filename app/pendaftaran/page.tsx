"use client";
import { useState } from 'react';
import { 
  sanitizeInput, 
  validateNIK, 
  detectMaliciousPattern, 
  addAuditLog 
} from '../../lib/security';
import { useAuth } from '../../context/AuthContext';
import { useKlinik } from '../../context/KlinikContext';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Clock, CheckCircle, Lock } from 'lucide-react';

export default function Pendaftaran() {
  const { currentUser } = useAuth();
  const { antreanList, pasienList, daftarPasienBaru, ubahStatusAntrean } = useKlinik();

  // Form states
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [jk, setJk] = useState('Laki-laki');
  const [usia, setUsia] = useState('');

  // Filter antrean: 'Semua' | 'Menunggu' | 'Selesai'
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Menunggu' | 'Selesai'>('Semua');

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDaftar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Deteksi Serangan Injeksi / XSS pada field input
    const checkNik = detectMaliciousPattern(nik);
    const checkNama = detectMaliciousPattern(nama);

    if (checkNik.isMalicious || checkNama.isMalicious) {
      const reason = checkNik.reason || checkNama.reason;
      setErrorMessage(`[Keamanan Ditegakkan] ${reason}`);
      addAuditLog({
        action: 'INJECTION_ATTEMPT_BLOCKED',
        user: currentUser?.name || 'User',
        status: 'BLOCKED',
        details: `Serangan injeksi terdeteksi pada form pendaftaran pasien! Payload diblokir.`
      });
      return;
    }

    // 2. Validasi NIK (Wajib 16 Digit)
    const nikValidation = validateNIK(nik);
    if (!nikValidation.valid) {
      setErrorMessage(nikValidation.message);
      return;
    }

    // 3. Sanitasi Input (Escape karakter berbahaya)
    const sanitizedNama = sanitizeInput(nama);
    const cleanNIK = nik.trim();
    const cleanUsia = parseInt(usia, 10);

    if (!sanitizedNama || sanitizedNama.length < 2) {
      setErrorMessage('Nama pasien harus diisi minimal 2 karakter.');
      return;
    }

    if (isNaN(cleanUsia) || cleanUsia < 0 || cleanUsia > 130) {
      setErrorMessage('Usia pasien harus berupa angka valid antara 0 hingga 130 tahun.');
      return;
    }

    // Daftarkan pasien & terbitkan antrean secara terpusat
    const { pasien, antrean } = daftarPasienBaru(
      {
        nik: cleanNIK,
        nama: sanitizedNama,
        jenisKelamin: jk,
        usia: cleanUsia
      },
      currentUser?.name || 'Staff Loket'
    );

    setSuccessMessage(`Pasien ${pasien.nama} berhasil didaftarkan! Nomor Antrean: ${antrean.id} (Status: Menunggu)`);
    
    // Reset Form
    setNik('');
    setNama('');
    setUsia('');
  };

  // Filter list antrean
  const displayedAntrean = antreanList.filter(a => {
    if (filterStatus === 'Semua') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          <UserPlus className="text-emerald-600" size={30} />
          Pendaftaran Pasien & Antrean Klinik Rakyat
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftarkan pasien baru. Status antrean akan <strong>otomatis berubah menjadi Selesai</strong> segera setelah dokter menyimpan hasil pemeriksaan di ruang tindakan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Pendaftaran Pasien Baru */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">
              Formulir Pendaftaran
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={14} /> Sanitasi Aktif
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleDaftar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*16 digit</span>
              </label>
              <input 
                type="text" 
                maxLength={16}
                value={nik} 
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 3201234567890003"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Hanya angka numerik (16 digit).</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Pasien <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                maxLength={100}
                value={nama} 
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select 
                  value={jk} 
                  onChange={(e) => setJk(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usia (Tahun) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min={0}
                  max={130}
                  value={usia} 
                  onChange={(e) => setUsia(e.target.value)}
                  placeholder="Contoh: 28"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={18} />
              Daftar & Terbitkan Nomor Antrean
            </button>
          </form>
        </div>

        {/* Tabel Antrean */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              Daftar Antrean Pasien
            </h2>

            {/* Filter Status Antrean */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['Semua', 'Menunggu', 'Selesai'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterStatus(tab)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterStatus === tab
                      ? 'bg-white text-slate-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <th className="p-3">No. Antrean</th>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">Status Antrean</th>
                  <th className="p-3 text-center">Aksi Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedAntrean.map((a) => {
                  const pasien = pasienList.find(p => p.id === a.pasienId);
                  const isSelesai = a.status === 'Selesai';

                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{a.id}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {pasien?.nama || 'Unknown'}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {pasien?.jenisKelamin || '-'}, {pasien?.usia || 0} thn
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          isSelesai 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                        }`}>
                          {isSelesai ? (
                            <>
                              <CheckCircle size={12} className="text-emerald-600" />
                              Selesai Diperiksa
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-amber-600" />
                              Menunggu
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isSelesai ? (
                          <span 
                            title="Status sudah selesai diperiksa dan terkunci permanen"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-lg border border-slate-200 select-none cursor-not-allowed"
                          >
                            <Lock size={11} className="text-slate-400" />
                            Terkunci
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => ubahStatusAntrean(a.id, 'Selesai')}
                            title="Tandai antrean ini sebagai Selesai secara manual"
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                          >
                            Tandai Selesai
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {displayedAntrean.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      Tidak ada antrean dengan status &quot;{filterStatus}&quot;.
                    </td>
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
