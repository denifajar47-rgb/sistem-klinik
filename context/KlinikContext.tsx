"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  dummyPasien as initialPasien, 
  dummyAntrean as initialAntrean, 
  dummyObat as initialObat, 
  dummyLaporan as initialLaporan,
  Pasien, 
  Antrean, 
  Obat, 
  Laporan 
} from '../data/dummyData';
import { addAuditLog } from '../lib/security';

interface KlinikContextType {
  pasienList: Pasien[];
  antreanList: Antrean[];
  obatList: Obat[];
  laporanList: Laporan[];
  daftarPasienBaru: (data: { nik: string; nama: string; jenisKelamin: string; usia: number }, userName?: string) => { pasien: Pasien; antrean: Antrean };
  selesaikanPemeriksaan: (params: { antreanId: string; keluhan: string; diagnosis: string; obatNama?: string; dokterName?: string }) => boolean;
  ubahStatusAntrean: (antreanId: string, statusBaru: 'Menunggu' | 'Selesai') => void;
  tambahAtauRestokObat: (data: { kode: string; nama: string; stok: number }, userName?: string) => void;
}

const KlinikContext = createContext<KlinikContextType | undefined>(undefined);

const STORAGE_KEY_PASIEN = 'klinik_rakyat_data_pasien';
const STORAGE_KEY_ANTREAN = 'klinik_rakyat_data_antrean';
const STORAGE_KEY_OBAT = 'klinik_rakyat_data_obat';
const STORAGE_KEY_LAPORAN = 'klinik_rakyat_data_laporan';

export function KlinikProvider({ children }: { children: React.ReactNode }) {
  const [pasienList, setPasienList] = useState<Pasien[]>(initialPasien);
  const [antreanList, setAntreanList] = useState<Antrean[]>(initialAntrean);
  const [obatList, setObatList] = useState<Obat[]>(initialObat);
  const [laporanList, setLaporanList] = useState<Laporan[]>(initialLaporan);
  const [isLoaded, setIsLoaded] = useState(false);

  // Inisialisasi data dari localStorage
  useEffect(() => {
    try {
      const savedPasien = localStorage.getItem(STORAGE_KEY_PASIEN);
      const savedAntrean = localStorage.getItem(STORAGE_KEY_ANTREAN);
      const savedObat = localStorage.getItem(STORAGE_KEY_OBAT);
      const savedLaporan = localStorage.getItem(STORAGE_KEY_LAPORAN);

      if (savedPasien) setPasienList(JSON.parse(savedPasien));
      if (savedAntrean) setAntreanList(JSON.parse(savedAntrean));
      if (savedObat) setObatList(JSON.parse(savedObat));
      if (savedLaporan) setLaporanList(JSON.parse(savedLaporan));
    } catch (err) {
      console.error('Error loading clinic data from storage', err);
    }
    setIsLoaded(true);
  }, []);

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PASIEN, JSON.stringify(pasienList));
      localStorage.setItem(STORAGE_KEY_ANTREAN, JSON.stringify(antreanList));
      localStorage.setItem(STORAGE_KEY_OBAT, JSON.stringify(obatList));
      localStorage.setItem(STORAGE_KEY_LAPORAN, JSON.stringify(laporanList));
    } catch (err) {
      console.error('Error saving clinic data to storage', err);
    }
  }, [pasienList, antreanList, obatList, laporanList, isLoaded]);

  // 1. Pendaftaran Pasien Baru & Masuk Antrean
  const daftarPasienBaru = (
    data: { nik: string; nama: string; jenisKelamin: string; usia: number },
    userName: string = 'Staff'
  ) => {
    let targetPasien = pasienList.find(p => p.nik === data.nik);

    if (!targetPasien) {
      const newPasienId = 'P' + String(pasienList.length + 1).padStart(3, '0');
      targetPasien = {
        id: newPasienId,
        nik: data.nik,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        usia: data.usia
      };
      setPasienList(prev => [...prev, targetPasien!]);
    }

    const newAntreanId = 'A' + String(antreanList.length + 1).padStart(3, '0');
    const newAntrean: Antrean = {
      id: newAntreanId,
      pasienId: targetPasien.id,
      status: 'Menunggu',
      tanggal: new Date().toISOString().split('T')[0]
    };

    setAntreanList(prev => [...prev, newAntrean]);

    addAuditLog({
      action: 'PATIENT_REGISTERED',
      user: userName,
      status: 'SUCCESS',
      details: `Pendaftaran pasien ${targetPasien.nama} (NIK: ${targetPasien.nik.slice(0, 6)}******) dengan No. Antrean ${newAntrean.id}.`
    });

    return { pasien: targetPasien, antrean: newAntrean };
  };

  // 2. Selesaikan Pemeriksaan Dokter (Otomatis Ubah Status Antrean Menjadi 'Selesai')
  const selesaikanPemeriksaan = ({
    antreanId,
    keluhan,
    diagnosis,
    obatNama,
    dokterName = 'Dokter'
  }: {
    antreanId: string;
    keluhan: string;
    diagnosis: string;
    obatNama?: string;
    dokterName?: string;
  }): boolean => {
    const targetAntrean = antreanList.find(a => a.id === antreanId);
    if (!targetAntrean) return false;

    const pasien = pasienList.find(p => p.id === targetAntrean.pasienId);

    // Update status antrean menjadi 'Selesai' secara otomatis
    setAntreanList(prev => 
      prev.map(item => 
        item.id === antreanId ? { ...item, status: 'Selesai' } : item
      )
    );

    // Simpan ke riwayat laporan medis
    const newLaporanId = 'L' + String(laporanList.length + 1).padStart(3, '0');
    const newLaporan: Laporan = {
      id: newLaporanId,
      pasienId: targetAntrean.pasienId,
      tanggal: new Date().toISOString().split('T')[0],
      keluhan,
      diagnosis,
      obatDiberikan: obatNama || '-'
    };
    setLaporanList(prev => [newLaporan, ...prev]);

    // Kurangi stok obat jika diberikan
    if (obatNama && obatNama !== '-') {
      setObatList(prev => 
        prev.map(o => {
          if (o.nama === obatNama && o.stok > 0) {
            return { ...o, stok: o.stok - 1 };
          }
          return o;
        })
      );
    }

    addAuditLog({
      action: 'EXAMINATION_COMPLETED',
      user: dokterName,
      status: 'SUCCESS',
      details: `Pemeriksaan selesai untuk No Antrean ${antreanId} (${pasien?.nama || 'Pasien'}). Status antrean diubah otomatis menjadi SELESAI.`
    });

    return true;
  };

  // 3. Ubah Status Antrean Manual (Jika sudah 'Selesai', status terkunci permanen dan tidak dapat dikembalikan ke 'Menunggu')
  const ubahStatusAntrean = (antreanId: string, statusBaru: 'Menunggu' | 'Selesai') => {
    setAntreanList(prev => 
      prev.map(item => {
        if (item.id === antreanId) {
          // Status Selesai terkunci permanen, tidak dapat diubah kembali ke Menunggu
          if (item.status === 'Selesai' && statusBaru === 'Menunggu') {
            return item;
          }
          return { ...item, status: statusBaru };
        }
        return item;
      })
    );
  };

  // 4. Tambah / Restok Obat
  const tambahAtauRestokObat = (data: { kode: string; nama: string; stok: number }, userName: string = 'Staff') => {
    setObatList(prev => {
      const existing = prev.find(o => o.kode === data.kode);
      if (existing) {
        return prev.map(o => o.kode === data.kode ? { ...o, stok: o.stok + data.stok } : o);
      }
      return [...prev, data];
    });

    addAuditLog({
      action: 'MEDICINE_UPDATED',
      user: userName,
      status: 'SUCCESS',
      details: `Pembaruan obat ${data.nama} (${data.kode}), stok: ${data.stok} unit.`
    });
  };

  return (
    <KlinikContext.Provider
      value={{
        pasienList,
        antreanList,
        obatList,
        laporanList,
        daftarPasienBaru,
        selesaikanPemeriksaan,
        ubahStatusAntrean,
        tambahAtauRestokObat
      }}
    >
      {children}
    </KlinikContext.Provider>
  );
}

export function useKlinik() {
  const context = useContext(KlinikContext);
  if (!context) {
    throw new Error('useKlinik must be used within a KlinikProvider');
  }
  return context;
}
