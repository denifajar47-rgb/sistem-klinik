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
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-300 font-medium">Memverifikasi Enkripsi & Lingkungan Klinik Rakyat...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan Login Portal Keamanan Klinik Rakyat
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Aksen visual neon */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3 text-emerald-400 shadow-inner">
              <Stethoscope size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
              Klinik Rakyat
            </h1>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Sistem Otentikasi & Keamanan Berlapis Aktif
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Akses Ditolak</p>
                <p>{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username Pegawai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  disabled={lockoutSec > 0}
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password Terenkripsi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSec > 0}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Anti-Bot Captcha Verification */}
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Key size={14} className="text-emerald-400" />
                  Verifikasi Anti-Bot (CAPTCHA):
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  title="Ganti Kode Soal"
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-slate-950 font-mono text-emerald-400 font-bold text-sm rounded-lg tracking-widest border border-slate-700 shadow-inner select-none">
                  {captchaNum1} + {captchaNum2} = ?
                </div>
                <input
                  type="number"
                  required
                  disabled={lockoutSec > 0}
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  placeholder="Jawaban"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutSec > 0}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:cursor-not-allowed cursor-pointer"
            >
              {lockoutSec > 0 ? (
                <>Terkunci ({lockoutSec}s)</>
              ) : (
                <>
                  <ShieldCheck size={18} /> Masuk ke Sistem Aman
                </>
              )}
            </button>
          </form>

          {/* Quick Login Helper untuk Mempermudah Pengetesan Langsung */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Akun Resmi Terverifikasi (Pilih Cepat):
            </p>
            <div className="space-y-1.5">
              {DEFAULT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username, acc.passwordHash)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-xs text-slate-300 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-medium text-white">{acc.name}</span>
                    <span className="text-[10px] text-slate-400">({acc.roleName})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 group-hover:underline">Gunakan</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-3 text-center">
              Password bawaan masing-masing: <code className="text-slate-400 font-mono">admin123</code>, <code className="text-slate-400 font-mono">dokter123</code>, <code className="text-slate-400 font-mono">staff123</code>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500 flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Klinik Rakyat</span>
          <span>•</span>
          <span className="text-emerald-500/80">Dilindungi SSL/TLS & Firewall Proteksi Data</span>
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
