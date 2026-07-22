import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Shield, User, Lock, Mail, Phone, CreditCard, LogIn, UserPlus, CheckCircle, ArrowRight, X, KeyRound, AlertCircle, Building2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export default function AuthModal({
  isOpen,
  initialRole = 'customer',
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<'customer' | 'admin'>(
    initialRole === 'admin' ? 'admin' : 'customer'
  );
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Customer Form State
  const [customerEmail, setCustomerEmail] = useState<string>('khachhang@gmail.com');
  const [customerPassword, setCustomerPassword] = useState<string>('123456');
  const [customerName, setCustomerName] = useState<string>('Nguyễn Văn A');
  const [customerPhone, setCustomerPhone] = useState<string>('+84 987 654 321');
  const [customerCccd, setCustomerCccd] = useState<string>('012345678901');

  // Guest OTP Login State
  const [isOtpMode, setIsOtpMode] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [demoOtpCode, setDemoOtpCode] = useState<string>('');

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');

  // Errors & Loading
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setError('Vui lòng nhập Email của bạn');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setDemoOtpCode(data.otpDemo || '882419');
      } else {
        setError(data.error || 'Không thể gửi OTP');
      }
    } catch (err) {
      // Fallback for standalone preview
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpSent(true);
      setDemoOtpCode(code);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        // Fallback for standalone demo
        if (otpInput.trim() === demoOtpCode || otpInput.trim().length === 6) {
          const user: UserAccount = {
            id: `usr-guest-${Date.now()}`,
            fullName: customerEmail.split('@')[0].toUpperCase(),
            email: customerEmail,
            phone: '+84 987 654 321',
            cccd: '012345678901',
            role: 'customer',
          };
          onLoginSuccess(user);
        } else {
          setError(data.error || 'Mã OTP không chính xác');
        }
      }
    } catch (err) {
      const user: UserAccount = {
        id: `usr-guest-${Date.now()}`,
        fullName: customerEmail.split('@')[0].toUpperCase(),
        email: customerEmail,
        phone: '+84 987 654 321',
        cccd: '012345678901',
        role: 'customer',
      };
      onLoginSuccess(user);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Login/Register
  const handleCustomerAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (isRegisterMode) {
        // Register validation
        if (!customerName.trim()) {
          setError('Vui lòng nhập họ và tên');
          setLoading(false);
          return;
        }
        if (!customerEmail.trim()) {
          setError('Vui lòng nhập email');
          setLoading(false);
          return;
        }

        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          fullName: customerName,
          email: customerEmail,
          phone: customerPhone || '+84 987 654 321',
          cccd: customerCccd || '012345678901',
          role: 'customer',
        };

        onLoginSuccess(newUser);
      } else {
        // Customer Login validation
        if (!customerEmail.trim()) {
          setError('Vui lòng nhập Email');
          setLoading(false);
          return;
        }

        const user: UserAccount = {
          id: `usr-demo-1`,
          fullName: customerName || 'Nguyễn Văn A',
          email: customerEmail,
          phone: customerPhone || '+84 987 654 321',
          cccd: customerCccd || '012345678901',
          role: 'customer',
        };

        onLoginSuccess(user);
      }
      setLoading(false);
    }, 500);
  };

  // Handle Admin Login
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (
        (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === 'admin123') ||
        (adminUsername.trim().toLowerCase() === 'reception' && adminPassword === '123456') ||
        (adminUsername.trim() !== '' && adminPassword.length >= 3)
      ) {
        const adminUser: UserAccount = {
          id: `admin-1`,
          fullName: 'Lễ Tân HavenStay',
          email: 'admin@havenstay.vn',
          phone: '+84 243 999 888',
          cccd: '001099887766',
          role: 'admin',
        };

        onLoginSuccess(adminUser);
      } else {
        setError('Tài khoản hoặc mật khẩu Lễ tân không chính xác (Thử: admin / admin123)');
      }
      setLoading(false);
    }, 500);
  };

  // Quick Demo Login Handlers
  const handleQuickCustomerDemo = () => {
    const user: UserAccount = {
      id: `usr-demo-customer`,
      fullName: 'Nguyễn Văn A',
      email: 'khachhang@gmail.com',
      phone: '+84 987 654 321',
      cccd: '012345678901',
      role: 'customer',
    };
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(user);
      setLoading(false);
    }, 300);
  };

  const handleQuickAdminDemo = () => {
    const adminUser: UserAccount = {
      id: `admin-demo`,
      fullName: 'Quản Lý Lễ Tân Admin',
      email: 'admin@havenstay.vn',
      phone: '+84 243 999 888',
      cccd: '001099887766',
      role: 'admin',
    };
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(adminUser);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
      >
        {/* Header Bar with Role Switcher */}
        <div className="bg-[#003527] text-white p-6 relative overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#80bea6]/20 border border-[#80bea6]/30 flex items-center justify-center text-[#80bea6] shrink-0">
              {activeRoleTab === 'customer' ? <User className="w-6 h-6" /> : <Shield className="w-6 h-6 text-[#ffdbca]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Đăng Nhập Phân Quyền</h3>
                <span className="bg-[#fd8a42] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Multi-Role Auth
                </span>
              </div>
              <p className="text-xs text-[#80bea6] mt-0.5">
                Vui lòng lựa chọn vai trò sử dụng hệ thống HavenStay
              </p>
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 bg-black/20 p-1.5 rounded-2xl gap-1 border border-white/10">
            <button
              onClick={() => { setActiveRoleTab('customer'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeRoleTab === 'customer'
                  ? 'bg-white text-[#003527] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-[#003527]" />
              <span>Khách Hàng (User)</span>
            </button>
            <button
              onClick={() => { setActiveRoleTab('admin'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeRoleTab === 'admin'
                  ? 'bg-[#fd8a42] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4 text-white" />
              <span>Lễ Tân / Admin</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5 bg-white">
          {activeRoleTab === 'customer' ? (
            /* CUSTOMER AUTH FORM */
            <div>
              {/* Customer Mode Selection Tabs */}
              <div className="flex border-b border-gray-100 mb-4 pb-2 justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => { setIsOtpMode(false); setError(null); }}
                  className={`font-bold px-3 py-1.5 rounded-lg transition-all ${
                    !isOtpMode ? 'bg-[#003527] text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Mật Khẩu Mặc Định
                </button>
                <button
                  type="button"
                  onClick={() => { setIsOtpMode(true); setError(null); }}
                  className={`font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isOtpMode ? 'bg-[#fd8a42] text-white shadow' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đăng Nhập OTP (Guest Checkout)</span>
                </button>
              </div>

              {isOtpMode ? (
                /* OTP EMAIL GUEST LOGIN FORM */
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Đăng Nhập Khách Đã Đặt Phòng (Không Cần Mật Khẩu):</strong>
                      Nhập email đã dùng khi Đặt Phòng để nhận mã OTP 6 chữ số đăng nhập vào xem Lịch sử & viết Đánh giá.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                      Email Khách Hàng (Đã dùng khi Đặt phòng)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="khachhang@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                        <p className="font-bold">✨ Mã OTP 6 chữ số đã gửi thành công!</p>
                        <p className="text-[11px] font-mono text-emerald-800">
                          Mã demo thử nghiệm: <strong className="text-[#003527] text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{demoOtpCode}</strong>
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                          Nhập Mã OTP 6 Chữ Số
                        </label>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Nhập 6 chữ số (ví dụ: 882419)"
                          maxLength={6}
                          className="w-full px-4 py-2.5 bg-white border-2 border-[#003527] rounded-xl text-center font-mono font-black text-lg tracking-widest text-[#003527] outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2 space-y-2.5">
                    {!otpSent ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003527] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#064e3b] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4 text-[#80bea6]" />
                        <span>{loading ? 'Đang gửi OTP...' : 'Gửi Mã OTP Đăng Nhập'}</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#fd8a42] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#e07530] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>{loading ? 'Đang xác nhận...' : 'Xác Nhận Mã OTP & Đăng Nhập'}</span>
                      </button>
                    )}

                    {otpSent && (
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
                      >
                        Gửi lại mã OTP mới
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* DEFAULT PASSWORD FORM */
                <form onSubmit={handleCustomerAuth} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Tài khoản Khách Hàng:</strong>
                      Lưu thông tin cá nhân, tự động điền form đặt phòng và xem lịch sử đơn đặt phòng của bạn.
                    </div>
                  </div>

                  {isRegisterMode && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                          Họ và Tên
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                            Số CCCD / CMND
                          </label>
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={customerCccd}
                              onChange={(e) => setCustomerCccd(e.target.value)}
                              placeholder="012345678901"
                              maxLength={12}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                            Số Điện Thoại
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+84 987 654 321"
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                      Địa Chỉ Email Khách Hàng
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="khachhang@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                      Mật Khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none"
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

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#003527] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#064e3b] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isRegisterMode ? <UserPlus className="w-4 h-4 text-[#80bea6]" /> : <LogIn className="w-4 h-4 text-[#80bea6]" />}
                      <span>{loading ? 'Đang xử lý...' : isRegisterMode ? 'Đăng Ký Tài Khoản Khách Hàng' : 'Đăng Nhập Khách Hàng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickCustomerDemo}
                      className="w-full bg-emerald-100/60 text-emerald-900 border border-emerald-300 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Đăng Nhập Thử Khách Hàng "Nguyễn Văn A" (1-Click)</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        className="text-xs text-[#003527] hover:underline font-semibold"
                      >
                        {isRegisterMode ? 'Đã có tài khoản? Bấm vào đây để Đăng Nhập' : 'Chưa có tài khoản? Bấm vào đây để Đăng Ký Khách Hàng mới'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ADMIN / RECEPTIONIST AUTH FORM */
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Tài khoản Lễ Tân / Admin Quản Lý:</strong>
                  Quyền truy cập bảng điều khiển Lễ Tân, xác nhận đơn phòng, check-in, check-out và phụ thu dịch vụ.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                  Tên Tài Khoản Lễ Tân
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Mặc định: admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">
                  Mật Khẩu Quản Trị
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mặc định: admin123"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white outline-none font-medium"
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

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#fd8a42] hover:bg-[#e07530] text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Shield className="w-4 h-4 text-white" />
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Màn Hình Admin Lễ Tân'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickAdminDemo}
                  className="w-full bg-[#ffdbca]/50 text-[#9b4500] border border-[#ffdbca] py-2.5 rounded-xl font-bold text-xs hover:bg-[#ffdbca] transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-[#9b4500]" />
                  <span>Đăng Nhập Thử Demo Lễ Tân (admin / admin123)</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-[11px] text-gray-500 text-center flex justify-between items-center">
          <span>Hệ thống phân quyền HavenStay v2.0</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-bold underline"
          >
            Đóng & Tiếp Tục Xem Phòng
          </button>
        </div>
      </motion.div>
    </div>
  );
}
