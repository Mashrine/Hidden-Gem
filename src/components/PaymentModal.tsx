import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, CheckCircle2, Copy, Shield, X, RefreshCw, CreditCard, Lock, Smartphone, ArrowRight, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { Room } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  selectedRoom: Room;
  fullName: string;
  phone: string;
  paymentMethod: 'vnpay' | 'stripe';
  bookingId: string;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

export default function PaymentModal({
  isOpen,
  totalPrice,
  selectedRoom,
  fullName,
  phone,
  paymentMethod,
  bookingId,
  onClose,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes countdown

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentConfirmed();
    }, 1200);
  };

  const transferContent = `HIDDENGEM ${bookingId.slice(-6).toUpperCase()} ${fullName.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase()}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden my-6 relative flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#003527] text-white p-5 md:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#80bea6]/20 border border-[#80bea6]/30 flex items-center justify-center text-[#80bea6] shrink-0">
                {paymentMethod === 'vnpay' ? <QrCode className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#fd8a42] bg-[#fd8a42]/10 px-2 py-0.5 rounded-md border border-[#fd8a42]/30">
                    Cổng Thanh Toán SSL 256-Bit
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    Cổng VNPAY Official
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {paymentMethod === 'vnpay' ? 'Thanh Toán Qua Mã VNPAY-QR' : 'Thanh Toán Thẻ Quốc Tế Stripe'}
                </h3>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="mt-4 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl flex items-center justify-between text-xs text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Mã VNPAY-QR hết hạn sau:
              </span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 bg-[#f9f9ff]">
            {/* Amount Banner */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#005baa] text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                VNPAY Secure
              </div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Số tiền cần thanh toán</span>
              <div className="text-2xl md:text-3xl font-black text-[#003527] mt-1">
                {totalPrice.toLocaleString('vi-VN')} <span className="text-sm font-bold text-gray-500">VNĐ</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                <span>Phòng: <strong>{selectedRoom.name}</strong></span>
                <span>•</span>
                <span>Mã đơn: <strong className="font-mono text-[#003527]">#{bookingId.slice(-6).toUpperCase()}</strong></span>
              </div>
            </div>

            {paymentMethod === 'vnpay' ? (
              /* VNPay / VietQR Display Card */
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                {/* Official VNPAY Brand Banner */}
                <div className="w-full bg-gradient-to-r from-[#ed1c24] via-[#005baa] to-[#ed1c24] text-white p-2.5 rounded-xl mb-4 flex items-center justify-between px-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-[#ed1c24] font-black text-xs px-2 py-0.5 rounded tracking-tighter uppercase font-mono">
                      VN<span className="text-[#005baa]">PAY</span>
                    </span>
                    <span className="font-bold text-xs">VNPAY-QR</span>
                  </div>
                  <span className="text-[10px] font-medium text-white/90">Thanh toán vạn niềm vui</span>
                </div>

                {/* Clean QR Code Container */}
                <div className="relative bg-white p-4 rounded-2xl border-2 border-dashed border-[#005baa]/40 shadow-md mb-4 group text-center">
                  <div className="w-52 h-52 bg-white flex flex-col items-center justify-center relative overflow-hidden rounded-xl mx-auto">
                    {/* SVG Professional VNPAY VietQR Graphic */}
                    <svg viewBox="0 0 200 200" className="w-full h-full text-[#005baa]">
                      {/* Quiet Zone */}
                      <rect x="0" y="0" width="200" height="200" fill="white" />
                      
                      {/* Corner Position Detection Patterns */}
                      {/* Top-Left */}
                      <rect x="15" y="15" width="45" height="45" fill="#ed1c24" rx="6" />
                      <rect x="23" y="23" width="29" height="29" fill="white" rx="3" />
                      <rect x="31" y="31" width="13" height="13" fill="#ed1c24" rx="2" />

                      {/* Top-Right */}
                      <rect x="140" y="15" width="45" height="45" fill="#005baa" rx="6" />
                      <rect x="148" y="23" width="29" height="29" fill="white" rx="3" />
                      <rect x="156" y="31" width="13" height="13" fill="#005baa" rx="2" />

                      {/* Bottom-Left */}
                      <rect x="15" y="140" width="45" height="45" fill="#005baa" rx="6" />
                      <rect x="23" y="148" width="29" height="29" fill="white" rx="3" />
                      <rect x="31" y="156" width="13" height="13" fill="#005baa" rx="2" />

                      {/* Random Data Pattern Grid for realistic QR look */}
                      <path d="M 70 15 H 125 V 25 H 70 Z M 70 35 H 90 V 45 H 70 Z M 100 35 H 125 V 45 H 100 Z" fill="#005baa" />
                      <path d="M 15 70 H 45 V 80 H 15 Z M 55 70 H 90 V 80 H 55 Z M 100 70 H 135 V 80 H 100 Z M 145 70 H 185 V 80 H 145 Z" fill="#1e293b" />
                      <path d="M 15 90 H 35 V 100 H 15 Z M 45 90 H 80 V 100 H 45 Z M 120 90 H 155 V 100 H 120 Z M 165 90 H 185 V 100 H 165 Z" fill="#005baa" />
                      <path d="M 25 110 H 60 V 120 H 25 Z M 70 110 H 105 V 120 H 70 Z M 115 110 H 145 V 120 H 115 Z M 155 110 H 185 V 120 H 155 Z" fill="#ed1c24" />
                      <path d="M 70 135 H 95 V 145 H 70 Z M 105 135 H 135 V 145 H 105 Z M 145 135 H 185 V 145 H 145 Z" fill="#005baa" />
                      <path d="M 70 155 H 115 V 165 H 70 Z M 125 155 H 155 V 165 H 125 Z M 165 155 H 185 V 165 H 165 Z" fill="#1e293b" />
                      <path d="M 70 175 H 95 V 185 H 70 Z M 105 175 H 145 V 185 H 105 Z M 155 175 H 185 V 185 H 155 Z" fill="#005baa" />

                      {/* Center VNPAY Brand Logo Badge */}
                      <rect x="70" y="70" width="60" height="60" fill="white" rx="12" filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.2))" />
                      <rect x="74" y="74" width="52" height="52" fill="#f8fafc" rx="10" stroke="#005baa" strokeWidth="1" />
                      <text x="100" y="96" fill="#ed1c24" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">VN<tspan fill="#005baa">PAY</tspan></text>
                      <text x="100" y="112" fill="#003527" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">HIDDENGEM</text>
                    </svg>
                  </div>
                  
                  {/* VietQR & VNPAY Alliance Label */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black text-white bg-[#ed1c24] px-2 py-0.5 rounded shadow-xs">
                      VNPAY-QR
                    </span>
                    <span className="text-[10px] font-black text-white bg-[#005baa] px-2 py-0.5 rounded shadow-xs">
                      VietQR
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tự động xác nhận
                    </span>
                  </div>
                </div>

                {/* Bank / App Alliance Logos */}
                <div className="w-full mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-500 font-semibold mb-1.5">Hỗ trợ tất cả ứng dụng Ngân hàng & Ví điện tử:</p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-extrabold">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md border border-red-200">Vietcombank</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">MB Bank</span>
                    <span className="bg-[#ed1c24]/10 text-[#ed1c24] px-2 py-0.5 rounded-md border border-red-200">Techcombank</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">BIDV</span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md border border-pink-200">MoMo / VNPAY</span>
                  </div>
                </div>

                {/* Transfer Meta Details */}
                <div className="w-full space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-[#f1f3ff] rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-semibold">Tên tài khoản:</span>
                    <strong className="text-[#003527] font-bold">CTCP KHU NGHỈ DƯỠNG HIDDEN GEM</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-[#f1f3ff] rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-semibold">Ngân hàng thụ hưởng:</span>
                    <strong className="text-[#005baa] font-bold">MB Bank (NH Quân Đội)</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-[#f1f3ff] rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-semibold">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#003527] font-mono font-bold text-sm">8888 9999 888</strong>
                      <button
                        onClick={() => handleCopy('88889999888', 'stk')}
                        className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200 text-[#003527] hover:bg-[#003527] hover:text-white font-bold transition-all"
                      >
                        {copied === 'stk' ? 'Đã chép!' : 'Chép STK'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-[#f1f3ff] rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-semibold">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#9b4500] font-mono font-bold text-[11px] truncate max-w-[150px]">
                        {transferContent}
                      </strong>
                      <button
                        onClick={() => handleCopy(transferContent, 'nd')}
                        className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200 text-[#9b4500] hover:bg-[#9b4500] hover:text-white font-bold transition-all shrink-0"
                      >
                        {copied === 'nd' ? 'Đã chép!' : 'Chép nội dung'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Stripe Simulated Card Input Form */
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Số thẻ quốc tế (Visa / Mastercard)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      value="4242 •••• •••• 4242"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">Hạn hết hạn</label>
                    <input
                      type="text"
                      readOnly
                      value="12 / 28"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">Mã CVC / CWW</label>
                    <input
                      type="password"
                      readOnly
                      value="•••"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 font-bold text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cổng thanh toán Stripe mã hóa 3D Secure an toàn tuyệt đối.</span>
                </div>
              </div>
            )}

            {/* Simulated Instruction Alert */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Hướng dẫn thử nghiệm prototype:</strong> Dùng ứng dụng Mobile Banking quét mã QR trên màn hình hoặc bấm nút bên dưới để mô phỏng hoàn tất giao dịch tự động.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full bg-[#003527] hover:bg-[#064e3b] text-white py-3.5 rounded-xl font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#80bea6]" />
                    <span>Đang xác nhận giao dịch VNPAY từ Ngân hàng...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#80bea6]" />
                    <span>{paymentMethod === 'vnpay' ? 'Xác Nhận Đã Quét Mã VNPAY-QR (Hoàn Tất)' : 'Thanh Toán Ngay qua Stripe'}</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                Đổi phương thức / Quay lại chỉnh sửa
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-100 text-[10px] text-gray-400 text-center flex items-center justify-between">
            <span>Powered by Hidden Gem Secure Gateway</span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <Lock className="w-3 h-3" /> SSL Verified
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
