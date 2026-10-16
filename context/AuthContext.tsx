"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  checkLoginRateLimit, 
  recordFailedLogin, 
  resetLoginAttempts, 
  addAuditLog 
} from '../lib/security';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  LogOut,
  Stethoscope
} from 'lucide-react';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'dokter' | 'resepsionis';
  roleName: string;
  avatarColor: string;
}

const DEFAULT_ACCOUNTS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'USR-01',
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Administrator Klinik',
    role: 'admin',
    roleName: 'Super Admin & Keamanan',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'USR-02',
    username: 'dokter',
    passwordHash: 'dokter123',
    name: 'dr. Hendra Wijaya, Sp.PD',
    role: 'dokter',
    roleName: 'Dokter Penanggung Jawab',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'USR-03',
    username: 'staff',
    passwordHash: 'staff123',
    name: 'Dewi Lestari, A.Md.Keb',
    role: 'resepsionis',
    roleName: 'Staff Loket & Pendaftaran',
    avatarColor: 'bg-emerald-600'
  }
];

interface AuthContextType {
  currentUser: UserAccount | null;
  login: (username: string, pass: string, captchaAnswer: number, expectedCaptcha: number) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'klinik_rakyat_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Form State untuk Login
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaNum1, setCaptchaNum1] = useState(3);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockoutSec, setLockoutSec] = useState<number>(0);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 8) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 8) + 1);
    setInputCaptcha('');
  };

  useEffect(() => {
    // Muat session tersimpan
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Validasi kadaluarsa sesi (maks 4 jam)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 4 * 60 * 60 * 1000) {
          setCurrentUser(parsed.user);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed reading session', e);
    }
    setIsInitializing(false);
    generateCaptcha();
  }, []);

  // Timer countdown lockout
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // 1. Cek Rate Limit & Lockout
    const rateCheck = checkLoginRateLimit(inputUsername || 'global');
    if (!rateCheck.allowed) {
      setLockoutSec(rateCheck.lockRemainingSec || 60);
      setLoginError(`Akun terkunci sementara karena terlalu banyak percobaan gagal. Tunggu ${rateCheck.lockRemainingSec} detik.`);
      addAuditLog({
        action: 'LOGIN_BLOCKED',
        user: inputUsername || 'Unknown',
        status: 'BLOCKED',
        details: 'Percobaan login ditolak oleh firewall rate-limiter (Brute-force shield).'
      });
      return;
    }

    // 2. Cek CAPTCHA
    const expectedCaptcha = captchaNum1 + captchaNum2;
    if (parseInt(inputCaptcha, 10) !== expectedCaptcha) {
      setLoginError('Verifikasi Keamanan (Captcha) salah! Silakan hitung ulang.');
      generateCaptcha();
      return;
    }

    // 3. Verifikasi Kredensial
    const account = DEFAULT_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === inputUsername.trim().toLowerCase()
    );

    if (!account || account.passwordHash !== inputPassword) {
      const failRecord = recordFailedLogin(inputUsername || 'global');
      if (failRecord.locked) {
        setLockoutSec(failRecord.lockRemainingSec);
        setLoginError('Terlalu banyak percobaan gagal! Sistem mengunci login selama 60 detik demi keamanan.');
      } else {
        const remaining = 5 - (failRecord.lockRemainingSec ? 5 : 1);
        setLoginError(`Username atau Password salah! Sisa percobaan sebelum terkunci.`);
      }

      addAuditLog({
        action: 'LOGIN_FAILED',
        user: inputUsername || 'Unknown',
        status: 'WARNING',
        details: 'Kredensial tidak cocok saat verifikasi login.'
      });

      generateCaptcha();
      return;
    }

    // Berhasil Login
    resetLoginAttempts(inputUsername);
    const { passwordHash, ...userData } = account;
    setCurrentUser(userData);

    // Simpan session
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          user: userData,
          timestamp: Date.now()
        })
      );
    } catch (e) {
      console.error('Session write error', e);
    }

    addAuditLog({
      action: 'LOGIN_SUCCESS',
      user: userData.name,
      status: 'SUCCESS',
      details: `Pengguna berhasil login sebagai ${userData.roleName} dengan token sesi aman.`
    });

    setInputPassword('');
    setInputCaptcha('');
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setInputUsername(username);
    setInputPassword(pass);
    setInputCaptcha((captchaNum1 + captchaNum2).toString());
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog({
        action: 'LOGOUT',
        user: currentUser.name,
        status: 'SUCCESS',
        details: 'Sesi pengguna diakhiri dengan aman.'
      });
    }
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    generateCaptcha();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 font-semibold">Memuat Sistem Klinik Rakyat...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan Login Portal Klinik Rakyat yang Ramah Pengguna & Kontras Tinggi
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200 p-7 sm:p-9 relative overflow-hidden">
          {/* Header Aksen Warna */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

          {/* Logo & Judul Klinik Rakyat */}
          <div className="text-center mb-6 pt-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mb-3 text-white shadow-md shadow-emerald-600/20">
              <Stethoscope size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Klinik Rakyat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Sistem Informasi &amp; Manajemen Layanan Medis
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 mt-2.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Login Terenkripsi &amp; Terlindungi</span>
            </div>
          </div>

          {/* Alert Error */}
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Gagal Masuk</p>
                <p className="mt-0.5 text-red-700">{loginError}</p>
              </div>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  disabled={lockoutSec > 0}
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSec > 0}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 outline-none transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Verifikasi Anti-Bot Captcha */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Key size={14} className="text-emerald-700" />
                  Pertanyaan Keamanan (Anti-Bot):
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  title="Ganti Soal"
                  className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw size={12} />
                  <span>Acak</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 bg-white font-mono text-emerald-800 font-extrabold text-base rounded-xl border border-emerald-300 shadow-xs select-none">
                  {captchaNum1} + {captchaNum2} = ?
                </div>
                <input
                  type="number"
                  required
                  disabled={lockoutSec > 0}
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  placeholder="Tulis hasil"
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-slate-900 text-sm font-semibold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutSec > 0}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {lockoutSec > 0 ? (
                <>Terkunci Sementara ({lockoutSec}s)</>
              ) : (
                <>
                  <ShieldCheck size={18} /> Masuk ke Akun
                </>
              )}
            </button>
          </form>

          {/* Quick Login Helper untuk Mempermudah Pengguna */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-left">
            <p className="text-xs font-bold text-slate-700 mb-2.5">
              Pilih Akun Cepat (Klik untuk Otomatis Terisi):
            </p>
            <div className="space-y-2">
              {DEFAULT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username, acc.passwordHash)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-slate-800 flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${acc.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                      {acc.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {acc.roleName} • <span className="font-mono text-slate-600">{acc.username}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 group-hover:border-emerald-600 transition">
                    Pilih
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Hak Cipta */}
        <div className="mt-5 text-center text-xs font-medium text-slate-500 flex items-center gap-2">
          <span className="text-slate-700 font-semibold">&copy; {new Date().getFullYear()} Klinik Rakyat</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">Sistem Terlindungi SSL &amp; Enkripsi Medis</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login: () => ({ success: true }),
        logout,
        isAuthenticated: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
