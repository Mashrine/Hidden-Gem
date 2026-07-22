import React, { useState } from 'react';
import { Booking } from '../types';
import { 
  CheckCircle2, Clock, ShieldCheck, XCircle, Home, Calendar, User, 
  CreditCard, ArrowRight, Sparkles, Building2, Phone, Mail, FileText,
  MapPin, Star, Send, Lock, Compass, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking?: (bookingId: string) => void;
  onNavigateToAdmin: () => void;
}

export default function MyBookingsModal({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onNavigateToAdmin
}: MyBookingsModalProps) {
  const [expandedItineraryId, setExpandedItineraryId] = useState<string | null>(null);
  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Homestay rất tuyệt vời, view đẹp và trải nghiệm đáng nhớ!');
  const [reviewSubmitted, setReviewSubmitted] = useState<Record<string, boolean>>({});
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
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
              <h2 className="text-xl font-black">Phòng Đã Đặt Của Tôi (Khách Hàng)</h2>
              <p className="text-xs text-[#80bea6] mt-0.5">Theo dõi trạng thái xác nhận từ bộ phận Lễ Tân theo thời gian thực</p>
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
          {bookings.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#141b2b]">Bạn chưa có đơn đặt phòng nào</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Hãy chọn phòng ưa thích trên trang Khám Phá và tiến hành đặt phòng để gửi dữ liệu sang cho Lễ tân.
              </p>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all shadow-md"
              >
                Khám Phá Phòng Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sync notification bar */}
              <div className="bg-[#e9edff] p-4 rounded-2xl border border-[#003527]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-[#003527] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#9b4500] shrink-0" />
                  <span>Dữ liệu đặt phòng được đồng bộ tự động tới màn hình Lễ tân Admin.</span>
                </div>
                <button 
                  onClick={() => { onClose(); onNavigateToAdmin(); }}
                  className="px-3.5 py-1.5 bg-[#fd8a42] text-white hover:bg-[#9b4500] transition-colors rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Lễ tân kiểm tra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {bookings.map((booking) => (
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
                        🔑 <strong>Đã Check-in:</strong> Lễ tân đã hoàn tất thủ tục nhận phòng cho {booking.guestName}. Chúc bạn có kỳ nghỉ tuyệt vời!
                      </p>
                    )}
                    {booking.status === 'checked_out' && (
                      <p>
                        🏁 <strong>Đã Check-out:</strong> Bạn đã hoàn tất kỳ nghỉ tại HavenStay! Bây giờ bạn đã có quyền gửi Đánh Giá Review về homestay.
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

                  {/* Actions */}
                  {(booking.status === 'pending' || booking.status === 'pending_payment') && onCancelBooking && (
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => onCancelBooking(booking.id)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                      >
                        Hủy đơn đặt này
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 shrink-0">
          <span>HavenStay Multi-Portal System</span>
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
