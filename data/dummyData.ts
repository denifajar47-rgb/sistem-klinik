// Data Dummy untuk Sistem Informasi Klinik

// Tipe Data
export type Pasien = {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: string;
  usia: number;
};

export type Antrean = {
  id: string;
  pasienId: string;
  status: 'Menunggu' | 'Selesai';
  tanggal: string;
};

export type Obat = {
  kode: string;
  nama: string;
  stok: number;
};

export type Laporan = {
  id: string;
  pasienId: string;
  tanggal: string;
  keluhan: string;
  diagnosis: string;
  obatDiberikan: string;
};

// Data Awal
export const dummyPasien: Pasien[] = [
  { id: 'P001', nik: '3201234567890001', nama: 'Budi Santoso', jenisKelamin: 'Laki-laki', usia: 45 },
  { id: 'P002', nik: '3201234567890002', nama: 'Siti Aminah', jenisKelamin: 'Perempuan', usia: 32 },
];

export const dummyAntrean: Antrean[] = [
  { id: 'A001', pasienId: 'P001', status: 'Menunggu', tanggal: new Date().toISOString().split('T')[0] },
  { id: 'A002', pasienId: 'P002', status: 'Selesai', tanggal: new Date().toISOString().split('T')[0] },
];

export const dummyObat: Obat[] = [
  { kode: 'OB001', nama: 'Paracetamol', stok: 150 },
  { kode: 'OB002', nama: 'Amoxicillin', stok: 85 },
  { kode: 'OB003', nama: 'Vitamin C', stok: 200 },
];

export const dummyLaporan: Laporan[] = [
  { id: 'L001', pasienId: 'P002', tanggal: new Date().toISOString().split('T')[0], keluhan: 'Demam', diagnosis: 'Flu ringan', obatDiberikan: 'Paracetamol' },
];
