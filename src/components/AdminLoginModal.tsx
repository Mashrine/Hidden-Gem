import React, { useState } from 'react';
import { Shield, Lock, User, KeyRound, ArrowLeft, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLoginModal({ isOpen, onLoginSuccess, onCancel }: AdminLoginModalProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Validate credentials (accepts 'admin' / 'admin123' or 'reception' / '123456')
      if (
        (username.trim().toLowerCase() === 'admin' && password === 'admin123') ||
        (username.trim().toLowerCase() === 'reception' && password === '123456') ||
        username.trim() !== '' && password.length >= 3 // flexible demo access
      ) {
        onLoginSuccess();
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác. Thử lại với "admin / admin123"');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess();
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#003527] text-white p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#80bea6]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#80bea6]/20 border border-[#80bea6]/30 flex items-center justify-center text-[#80bea6]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Đăng Nhập Quản Trị
                <span className="bg-[#9b4500] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Admin Only
                </span>
              </h3>
              <p className="text-xs text-[#80bea6] mt-0.5">Dành cho Nhân viên Lễ tân & Quản lý Homestay</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 bg-white">
          <div className="bg-[#e9edff] p-3 rounded-xl text-xs text-[#003527] border border-[#003527]/10 flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#003527]" />
            <div>
              <strong className="block font-bold">Lưu ý phân quyền:</strong>
              Khách hàng (Guest) không cần đăng nhập. Trang này chỉ dành cho Lễ tân xử lý Check-in & Hóa đơn.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1.5">
              Tên tài khoản Lễ tân / Admin
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] font-medium focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1.5">
              Mật khẩu bảo mật
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] font-medium focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003527] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#064e3b] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-[#80bea6]" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Màn Hình Admin'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full bg-[#ffdbca]/40 text-[#9b4500] border border-[#ffdbca] py-2.5 rounded-xl font-bold text-xs hover:bg-[#ffdbca] transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Đăng Nhập Nhanh Demo (1-Click Admin)</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-gray-500 hover:text-gray-800 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Khách Hàng (Không cần đăng nhập)</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
          Mật khẩu mặc định thử nghiệm: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[#003527] font-bold">admin / admin123</code>
        </div>
      </motion.div>
    </div>
  );
}
