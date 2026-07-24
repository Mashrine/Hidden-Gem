import React, { useState } from 'react';
import { Booking, UserAccount, UserRole } from '../types';
import { 
  CheckCircle2, Clock, ShieldCheck, XCircle, Home, Calendar, User, 
  CreditCard, ArrowRight, Sparkles, Building2, Phone, Mail, FileText,
  MapPin, Star, Send, Lock, Compass, Check, LogIn, LogOut, LogOut as EarlyExit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (role: UserRole) => void;
  onCancelBooking?: (bookingId: string) => void;
  onEarlyCheckOut?: (bookingId: string, notes?: string) => void;
  onNavigateToAdmin: () => void;
  onAddSampleBooking?: () => void;
}

export default function MyBookingsModal({
  isOpen,
  onClose,
  bookings,
  currentUser,
  onOpenAuthModal,
  onCancelBooking,
  onEarlyCheckOut,
  onNavigateToAdmin,
  onAddSampleBooking
}: MyBookingsModalProps) {
  const [expandedItineraryId, setExpandedItineraryId] = useState<string | null>(null);
  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Homestay rất tuyệt vời, view đẹp và trải nghiệm đáng nhớ!');
  const [reviewSubmitted, setReviewSubmitted] = useState<Record<string, boolean>>({});
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Early Check-out Modal State
  const [earlyCheckOutModalBooking, setEarlyCheckOutModalBooking] = useState<Booking | null>(null);
  const [earlyCheckOutNotes, setEarlyCheckOutNotes] = useState<string>('Trả phòng sớm do thay đổi kế hoạch chuyến đi');
  const [showCheckedOutHistory, setShowCheckedOutHistory] = useState<boolean>(false);
  const [guestLookupQuery, setGuestLookupQuery] = useState<string>('');

  if (!isOpen) return null;

  // Filter bookings for current logged in user
  let rawUserBookings: Booking[] = [];
  if (currentUser) {
    if (currentUser.role === 'admin') {
      rawUserBookings = bookings;
    } else {
      const userEmail = currentUser.email?.toLowerCase().trim();
      const userPhone = currentUser.phone?.trim();
      const userName = currentUser.fullName?.toLowerCase().trim();
      const userCccd = currentUser.cccd?.trim();

      rawUserBookings = bookings.filter(b => {
        return (
          (userEmail && b.email?.toLowerCase().trim() === userEmail) ||
          (userPhone && b.phone?.trim() === userPhone) ||
          (userName && b.guestName?.toLowerCase().trim() === userName) ||
          (userCccd && b.cccd?.trim() === userCccd)
        );
      });
    }
  } else {
    if (guestLookupQuery.trim()) {
      const q = guestLookupQuery.toLowerCase().trim();
      rawUserBookings = bookings.filter(b => 
        b.phone?.trim().includes(q) || 
        b.email?.toLowerCase().trim().includes(q) || 
        b.id?.toLowerCase().includes(q) ||
        b.guestName?.toLowerCase().includes(q)
      );
    } else {
      rawUserBookings = [];
    }
  }

  // Exclude checked_out bookings from active list as requested
  const userBookings = rawUserBookings.filter(b => b.status !== 'checked_out');
  const checkedOutBookings = rawUserBookings.filter(b => b.status === 'checked_out');

  const handleSendReview = async (booking: Booking) => {
    setReviewError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: reviewRating,
          comment: reviewComment,
          bookingStatus: booking.status
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSubmitted(prev => ({ ...prev, [booking.id]: true }));
        setActiveReviewBookingId(null);
      } else {
        setReviewError(data.error || 'Không thể gửi đánh giá lúc này');
      }
    } catch (err) {
      setReviewSubmitted(prev => ({ ...prev, [booking.id]: true }));
      setActiveReviewBookingId(null);
    }
  };

  const handleConfirmEarlyCheckOut = () => {
    if (earlyCheckOutModalBooking && onEarlyCheckOut) {
      onEarlyCheckOut(earlyCheckOutModalBooking.id, earlyCheckOutNotes);
      setEarlyCheckOutModalBooking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
      {/* Early Check-out Confirmation Dialog Modal */}
      {earlyCheckOutModalBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-amber-200"
          >
            <div className="flex items-center gap-3 text-amber-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <EarlyExit className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Xác Nhận Check-out Sớm</h3>
                <p className="text-xs text-gray-500">Phòng: {earlyCheckOutModalBooking.roomName}</p>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100 text-xs text-amber-900 space-y-1.5">
              <p>📅 Ngày nhận phòng: <strong>{earlyCheckOutModalBooking.checkInDate}</strong></p>
              <p>📅 Hạn trả phòng gốc: <strong>{earlyCheckOutModalBooking.checkOutDate}</strong></p>
              <p>⚡ Ngày thực tế Check-out: <strong>{new Date().toISOString().split('T')[0]} (Hôm nay)</strong></p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Lý do trả phòng sớm (Tùy chọn):</label>
              <textarea
                value={earlyCheckOutNotes}
                onChange={(e) => setEarlyCheckOutNotes(e.target.value)}
                placeholder="Nhập lý do trả phòng sớm..."
                rows={2}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEarlyCheckOutModalBooking(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmEarlyCheckOut}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <EarlyExit className="w-3.5 h-3.5" />
                <span>Xác Nhận Check-out Sớm</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-[#003527] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#80bea6]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Phòng Đã Đặt Của Tôi</h2>
              <p className="text-xs text-[#80bea6] mt-0.5">
                {currentUser 
                  ? `Đang đăng nhập: ${currentUser.fullName} (${currentUser.role === 'admin' ? 'Lễ Tân Admin' : 'Khách Hàng'})` 
                  : 'Vui lòng đăng nhập để xem danh sách phòng'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#f9f9ff]">
          {!currentUser ? (
            /* Login Gate Prompt & Guest Quick Lookup */
            <div className="py-8 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  <LogIn className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-[#141b2b]">Đăng Nhập Hoặc Tra Cứu Đơn</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Bạn có thể đăng nhập tài khoản hoặc nhập SĐT / Email / Mã đơn để tra cứu phòng đã đặt.
                </p>
                <button 
                  onClick={() => {
                    onClose();
                    if (onOpenAuthModal) onOpenAuthModal('customer');
                  }}
                  className="px-6 py-2.5 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all shadow-md inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#80bea6]" />
                  <span>Đăng Nhập Tài Khoản Khách Hàng</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="shrink-0 mx-4 text-gray-400 text-xs font-bold">HOẶC TRA CỨU NHANH</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-gray-700 block">Nhập SĐT, Email hoặc Mã đơn:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guestLookupQuery}
                    onChange={(e) => setGuestLookupQuery(e.target.value)}
                    placeholder="VD: 0987654321 hoặc anhaihoai@gmail.com"
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#003527]"
                  />
                </div>
              </div>

              {guestLookupQuery.trim() && userBookings.length === 0 && (
                <p className="text-center text-xs text-amber-700 font-medium">
                  Không tìm thấy đơn đặt nào khớp với thông tin "{guestLookupQuery}"
                </p>
              )}
            </div>
          ) : userBookings.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Home className="w-8 h-8 text-[#003527]" />
              </div>
              <h3 className="text-base font-bold text-[#141b2b]">Bạn chưa có đơn đặt phòng nào</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Tài khoản <strong>{currentUser.fullName}</strong> chưa có lịch sử đặt phòng. Hãy chọn phòng trên trang Khám Phá để tiến hành đặt phòng.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const elem = document.getElementById('room-list-section');
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-6 py-2.5 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all shadow-md flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-[#80bea6]" />
                  <span>Khám Phá Phòng Ngay</span>
                </button>
                {onAddSampleBooking && (
                  <button 
                    onClick={onAddSampleBooking}
                    className="px-5 py-2.5 bg-[#e9edff] text-[#003527] border border-[#003527]/20 rounded-xl text-xs font-bold hover:bg-[#dce2f7] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#9b4500]" />
                    <span>Tạo Đơn Đặt Thử Cho Tôi</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sync notification bar */}
              <div className="bg-[#e9edff] p-4 rounded-2xl border border-[#003527]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-[#003527] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#9b4500] shrink-0" />
                  <span>Hiển thị {userBookings.length} đơn đặt phòng thuộc về tài khoản <strong>{currentUser.fullName}</strong>.</span>
                </div>
                <button 
                  onClick={() => { onClose(); onNavigateToAdmin(); }}
                  className="px-3.5 py-1.5 bg-[#fd8a42] text-white hover:bg-[#9b4500] transition-colors rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Lễ tân kiểm tra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {userBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Top Bar Status */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                        Mã: {booking.id}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        • {booking.guestsCount}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {booking.earlyCheckOut && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <EarlyExit className="w-3 h-3 text-amber-700" />
                          Check-out sớm
                        </span>
                      )}

                      {(booking.status === 'pending' || booking.status === 'pending_payment') && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Chờ Lễ tân (Soft Lock 10 Phút)
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lễ tân đã xác nhận
                        </span>
                      )}
                      {booking.status === 'checked_in' && (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Đang lưu trú (Checked-in)
                        </span>
                      )}
                      {booking.status === 'checked_out' && (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-extrabold px-3 py-1 rounded-full">
                          Đã hoàn tất Check-out
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Đã hủy đơn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-lg font-black text-[#003527]">{booking.roomName}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#404944]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#9b4500]" />
                          <span>Nhận: <strong>{booking.checkInDate}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#9b4500]" />
                          <span>Trả: <strong>{booking.checkOutDate}</strong> ({booking.nights} đêm)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>Khách: <strong>{booking.guestName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          <span>CCCD: <strong>{booking.cccd}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f1f3ff] p-3.5 rounded-xl border border-gray-200 shrink-0 text-right w-full md:w-auto">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Tổng tiền phòng</span>
                      <span className="text-lg font-black text-[#003527]">{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                        Thanh toán: {booking.paymentMethod === 'vnpay' ? 'VNPay QR' : 'Thẻ Stripe'}
                      </span>
                    </div>
                  </div>

                  {/* Stored AI Itinerary Button */}
                  {booking.aiItinerary && (
                    <div className="border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setExpandedItineraryId(expandedItineraryId === booking.id ? null : booking.id)}
                        className="w-full bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] border border-[#003527]/20 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-[#fd8a42]" />
                          <span>Lịch Trình AI Trip Planner (Đã Lưu Vĩnh Viễn)</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#80bea6] bg-[#003527] px-2 py-0.5 rounded-md text-white">
                          {expandedItineraryId === booking.id ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
                        </span>
                      </button>

                      {expandedItineraryId === booking.id && (
                        <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 text-xs animate-in fade-in">
                          <h5 className="font-bold text-[#003527] text-sm">{booking.aiItinerary.title}</h5>
                          <p className="text-[#404944]">Homestay gợi ý: <strong>{booking.aiItinerary.recommendedHomestay}</strong></p>

                          <div className="space-y-2">
                            {booking.aiItinerary.days?.map((day: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                                <span className="font-bold text-[#9b4500]">Ngày {day.dayNumber}: {day.theme}</span>
                                {day.activities?.map((act: any, aIdx: number) => (
                                  <div key={aIdx} className="text-[11px] text-gray-600 pl-2 border-l-2 border-[#80bea6]">
                                    <strong>{act.time}</strong> - {act.spot}: {act.description}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status explanation helper */}
                  <div className={`p-3 rounded-xl text-xs font-medium leading-relaxed ${
                    (booking.status === 'pending' || booking.status === 'pending_payment') ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                    booking.status === 'checked_in' ? 'bg-blue-50 text-blue-900 border border-blue-200' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {(booking.status === 'pending' || booking.status === 'pending_payment') && (
                      <p>
                        ⏳ <strong>Đang giữ chỗ (Soft Lock 10 phút):</strong> Phòng {booking.roomName} đã được tạo Soft Lock an toàn. Lễ tân sẽ bấm xác nhận trên bảng điều khiển Admin.
                      </p>
                    )}
                    {booking.status === 'confirmed' && (
                      <p>
                        ✅ <strong>Lễ Tân Đã Xác Nhận:</strong> Căn phòng {booking.roomName} của bạn đã được Lễ tân giữ chỗ thành công. Giờ nhận phòng dự kiến là {booking.eta || '14:00'}.
                      </p>
                    )}
                    {booking.status === 'checked_in' && (
                      <p>
                        🔑 <strong>Đang Lưu Trú:</strong> Lễ tân đã làm thủ tục nhận phòng. Nếu bạn có thay đổi lịch trình, có thể bấm nút <strong>Check-out Sớm</strong> bên dưới.
                      </p>
                    )}
                    {booking.status === 'checked_out' && (
                      <p>
                        🏁 <strong>Đã Check-out{booking.earlyCheckOut ? ' Sớm' : ''}:</strong> Bạn đã hoàn tất kỳ nghỉ tại Hidden Gem! Bây giờ bạn đã có quyền gửi Đánh Giá Review về homestay.
                      </p>
                    )}
                  </div>

                  {/* Review Enforcement Section */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                    {booking.status !== 'checked_out' ? (
                      <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Ràng buộc đánh giá: Chỉ được phép viết Review sau khi <strong>Check-out trả phòng</strong></span>
                        </div>
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Khóa Review</span>
                      </div>
                    ) : (
                      <div>
                        {reviewSubmitted[booking.id] ? (
                          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Cảm ơn bạn đã gửi đánh giá về {booking.roomName}! Nhận xét đã được lưu trữ vào hệ thống.</span>
                          </div>
                        ) : activeReviewBookingId === booking.id ? (
                          <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-3 animate-in fade-in">
                            <h5 className="font-bold text-[#003527] text-xs flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>Viết Đánh Giá Homestay ({booking.roomName})</span>
                            </h5>

                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-gray-600 mr-2">Đánh giá số sao:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 text-amber-500 hover:scale-110 transition-transform"
                                >
                                  <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-500' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>

                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Nhập cảm nhận của bạn về phòng..."
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#003527]"
                              rows={3}
                            />

                            {reviewError && (
                              <p className="text-xs text-red-600 font-bold">{reviewError}</p>
                            )}

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveReviewBookingId(null)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendReview(booking)}
                                className="px-4 py-1.5 bg-[#003527] text-white hover:bg-[#064e3b] rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Gửi Đánh Giá</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveReviewBookingId(booking.id)}
                            className="w-full bg-[#fd8a42] hover:bg-[#e07530] text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            <Star className="w-4 h-4 fill-white" />
                            <span>★ Viết Đánh Giá Homestay (Khách Đã Check-out)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Early Check-out Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    {booking.status === 'checked_in' && onEarlyCheckOut && (
                      <button
                        onClick={() => setEarlyCheckOutModalBooking(booking)}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <EarlyExit className="w-4 h-4 text-amber-700" />
                        <span>Check-out Sớm (Early Check-out)</span>
                      </button>
                    )}

                    {(booking.status === 'pending' || booking.status === 'pending_payment') && onCancelBooking && (
                      <button 
                        onClick={() => onCancelBooking(booking.id)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors ml-auto"
                      >
                        Hủy đơn đặt này
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checked-out History Collapsible Section */}
          {checkedOutBookings.length > 0 && (
            <div className="pt-4 border-t border-gray-200/60 space-y-3">
              <button
                onClick={() => setShowCheckedOutHistory(!showCheckedOutHistory)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200/80 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-between"
              >
                <span>📜 Xem lịch sử ({checkedOutBookings.length}) phòng đã Check-out</span>
                <span className="text-gray-400 font-normal">{showCheckedOutHistory ? 'Thu gọn ▲' : 'Mở rộng ▼'}</span>
              </button>

              {showCheckedOutHistory && (
                <div className="space-y-4 pt-2">
                  {checkedOutBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="bg-white/80 p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mã đơn: #{booking.id}</span>
                          <h3 className="font-extrabold text-sm text-gray-800">{booking.roomName}</h3>
                        </div>
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Đã Check-out {booking.earlyCheckOut ? '(Sớm)' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Nhận: <strong>{booking.checkInDate}</strong></div>
                        <div>Trả: <strong>{booking.actualCheckOutDate || booking.checkOutDate}</strong></div>
                        <div>Số tiền: <strong>{booking.totalPrice.toLocaleString('vi-VN')} VNĐ</strong></div>
                        <div>Khách: <strong>{booking.guestName}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 shrink-0">
          <span>Hidden Gem Multi-Portal System</span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-[#141b2b] rounded-xl font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
}
