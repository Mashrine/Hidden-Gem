import React, { useState, useRef, useEffect } from 'react';
import { Room, Booking, UserAccount } from '../types';
import { ShieldAlert, Info, ShieldCheck, Lock, Landmark, CreditCard, RefreshCw, Star, Compass, MapPin, Sparkles, ChevronLeft, Calendar, Users, CheckCircle2, Mail, Send, Printer, X, FileText, Check, UserCheck, QrCode, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PaymentModal from './PaymentModal';

interface BookingViewProps {
  selectedRoom: Room;
  currentUser?: UserAccount | null;
  onBookingSuccess: (newBooking: Booking) => void;
  onNavigateToDiscover: () => void;
  onNavigateToAdmin: () => void;
}

export default function BookingView({ selectedRoom, currentUser, onBookingSuccess, onNavigateToDiscover, onNavigateToAdmin }: BookingViewProps) {
  // Booking details state
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || 'Nguyễn Văn A');
  const [cccd, setCccd] = useState<string>(currentUser?.cccd || '012345678901');
  const [email, setEmail] = useState<string>(currentUser?.email || 'example@havenstay.vn');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '+84 987 654 321');
  const [backpackerLevel, setBackpackerLevel] = useState<string>('Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng');
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'stripe'>('vnpay');

  // Update form if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setFullName(currentUser.fullName);
      if (currentUser.cccd) setCccd(currentUser.cccd);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);


  // Input validation error states
  const [fullNameError, setFullNameError] = useState<string>('');
  const [cccdError, setCccdError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Simulated Email Notification states
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [showSimulatedEmailModal, setShowSimulatedEmailModal] = useState<boolean>(false);

  // Payment QR Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [pendingBookingId, setPendingBookingId] = useState<string>('');

  // Handle Full Name input change with strict letter-only sanitization
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Strip digits and special characters, allowing only Vietnamese & Latin letters + spaces
    const sanitizedVal = rawVal.replace(/[^a-zA-ZàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s]/g, '');
    
    if (rawVal !== sanitizedVal) {
      setFullNameError('⚠️ Họ và tên chỉ được nhập chữ cái, không được chứa số hoặc ký tự đặc biệt (!@#$%...)');
    } else {
      setFullNameError('');
    }
    setFullName(sanitizedVal);
  };

  // Handle CCCD input change with strict digit-only sanitization
  const handleCccdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Strip non-digits and cap at 12 digits
    const sanitizedVal = rawVal.replace(/\D/g, '').slice(0, 12);
    
    if (rawVal !== sanitizedVal && rawVal.replace(/\D/g, '') !== rawVal) {
      setCccdError('⚠️ Số CCCD/CMND chỉ được nhập chữ số (0-9), không chứa chữ cái hoặc ký tự đặc biệt');
    } else if (sanitizedVal.length > 0 && sanitizedVal.length !== 9 && sanitizedVal.length !== 12) {
      setCccdError('⚠️ Số CCCD phải bao gồm đúng 9 hoặc 12 chữ số');
    } else {
      setCccdError('');
    }
    setCccd(sanitizedVal);
  };

  // Handle Phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const sanitizedVal = rawVal.replace(/[^0-9+ ]/g, '');
    if (rawVal !== sanitizedVal) {
      setPhoneError('⚠️ Số điện thoại chỉ chứa các chữ số và dấu +');
    } else {
      setPhoneError('');
    }
    setPhone(sanitizedVal);
  };
  
  // Pricing parameters
  const [nights, setNights] = useState<number>(3);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookedSuccess, setBookedSuccess] = useState<boolean>(false);

  // Simulated 360 VR dragging physics
  const [panX, setPanX] = useState<number>(45); // percent offset
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<number>(0);
  const startPanXRef = useRef<number>(0);

  const basePrice = selectedRoom.pricePerNight * nights;
  const serviceFee = 250000;
  const totalPrice = basePrice + serviceFee;

  // Handle drag for VR
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
    startPanXRef.current = panX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current;
    // convert deltaX pixel to percentage offset
    const percentageShift = (deltaX / window.innerWidth) * 100;
    let nextPan = startPanXRef.current - percentageShift;
    // Loop around or clamp
    if (nextPan < 0) nextPan += 100;
    if (nextPan > 100) nextPan -= 100;
    setPanX(nextPan);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.touches[0].clientX;
    startPanXRef.current = panX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current;
    const percentageShift = (deltaX / window.innerWidth) * 100;
    let nextPan = startPanXRef.current - percentageShift;
    if (nextPan < 0) nextPan += 100;
    if (nextPan > 100) nextPan -= 100;
    setPanX(nextPan);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Lock state from backend
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number | null>(null);
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  // Check availability and lock room on mount or date select
  useEffect(() => {
    let timer: any;
    async function lockRoomOnServer() {
      try {
        const res = await fetch('/api/bookings/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: selectedRoom.id,
            checkIn: '2024-12-15',
            checkOut: '2024-12-18',
            sessionId: `session-${Date.now()}`
          })
        });
        const data = await res.json();
        if (data.success) {
          setLockMessage(data.message);
          setLockTimeRemaining(600); // 10 minutes in seconds
        }
      } catch (err) {
        console.error("Lock room error:", err);
      }
    }

    lockRoomOnServer();

    timer = setInterval(() => {
      setLockTimeRemaining((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedRoom.id]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;

    // Validate Full Name: Vietnamese/Latin letters & spaces only
    const nameRegex = /^[a-zA-ZàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s]+$/;
    if (!fullName.trim()) {
      setFullNameError('⚠️ Vui lòng điền Họ và Tên.');
      valid = false;
    } else if (!nameRegex.test(fullName.trim())) {
      setFullNameError('⚠️ Họ và tên chỉ được sử dụng chữ cái và khoảng trắng (không chứa số hay ký tự đặc biệt).');
      valid = false;
    } else {
      setFullNameError('');
    }

    // Validate CCCD: Digits only (9 or 12 numbers)
    if (!cccd.trim()) {
      setCccdError('⚠️ Vui lòng nhập số CCCD.');
      valid = false;
    } else if (!/^\d{9}$|^\d{12}$/.test(cccd.trim())) {
      setCccdError('⚠️ Số CCCD không hợp lệ! Vui lòng chỉ nhập đúng 9 hoặc 12 chữ số (không chứa chữ cái hay ký tự đặc biệt).');
      valid = false;
    } else {
      setCccdError('');
    }

    // Validate Phone
    if (!phone.trim()) {
      setPhoneError('⚠️ Vui lòng điền số điện thoại.');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Verify availability
      const availRes = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: '2024-12-15',
          checkOut: '2024-12-18'
        })
      });
      const availData = await availRes.json();
      if (!availData.available && availData.reason) {
        alert(availData.reason);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn("Server check fallback to local mode.");
    }

    // Generate booking ID and open Payment Modal
    const generatedId = `booking-${Date.now()}`;
    setPendingBookingId(generatedId);
    setIsProcessing(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirmed = () => {
    setIsPaymentModalOpen(false);
    setIsProcessing(true);

    setTimeout(() => {
      const bookingId = pendingBookingId || `booking-${Date.now()}`;
      const lockedUntilIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const sampleAiItinerary = {
        title: `Lịch Trình Du Lịch Khám Phá Đà Lạt - Cấp Độ ${backpackerLevel}`,
        recommendedHomestay: selectedRoom.name,
        days: [
          {
            dayNumber: 1,
            theme: "Săn Mây Cầu Đất & Cà Phê Chill Thung Lũng",
            activities: [
              { time: "05:00 - 07:30", spot: "Đồi chè Cầu Đất", description: "Đón bình minh & săn biển mây bồng bềnh.", tip: "Nên mang áo ấm giữ nhiệt." },
              { time: "08:30 - 11:00", spot: "Quán Cà Phê Túi Mơ To", description: "Thưởng thức cà phê trứng & ngắm vườn cúc họa mi.", tip: "Góc chụp ảnh đẹp ở nhà lồng kính." }
            ]
          },
          {
            dayNumber: 2,
            theme: "Chinh Phục Đỉnh LangBiang & Đêm Lửa Trại",
            activities: [
              { time: "08:00 - 12:00", spot: "Đỉnh LangBiang", description: "Trekking hoặc di chuyển bằng xe Jeep ngắm toàn cảnh suối Vàng suối Bạc.", tip: "Mang giày thể thao chống trượt." }
            ]
          }
        ],
        safetyTips: ["Đèo Đà Lạt sương mù ban đêm, nên về homestay trước 21:00.", "Luôn chuẩn bị áo mưa nhẹ trong balo phượt."]
      };

      const newBooking: Booking = {
        id: bookingId,
        guestName: fullName,
        cccd: cccd,
        email: email,
        phone: phone,
        backpackerLevel: backpackerLevel,
        roomName: selectedRoom.name,
        roomType: selectedRoom.id === 'room-panorama' ? 'Deluxe' : 'Standard',
        checkInDate: '15/12/2024',
        checkOutDate: '18/12/2024',
        nights: nights,
        guestsCount: `${guestsCount.toString().padStart(2, '0')} Người lớn`,
        basePrice: basePrice,
        serviceFee: serviceFee,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        status: 'pending_payment',
        lockedUntil: lockedUntilIso,
        aiItinerary: sampleAiItinerary,
        eta: '14:00'
      };

      onBookingSuccess(newBooking);
      setLastCreatedBooking(newBooking);
      setIsProcessing(false);
      setBookedSuccess(true);
      setShowSimulatedEmailModal(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] pb-24 md:pb-12">
      {/* Top Header */}
      <header className="w-full top-0 sticky z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToDiscover}>
            <button className="p-2 rounded-full hover:bg-gray-100 text-[#003527] transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#003527] tracking-tight">
              Haven<span className="text-[#9b4500]">Stay</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigateToDiscover}
              className="text-[#003527] font-semibold text-sm hover:underline"
            >
              Khám Phá
            </button>
            <button 
              onClick={onNavigateToAdmin} 
              className="text-xs font-semibold uppercase tracking-wider text-[#9b4500] hover:text-[#682c00] border border-[#ffdbca] bg-[#ffdbca]/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Quản trị Lễ tân
            </button>
          </div>
        </div>
      </header>

      {/* Hero 360 VR View */}
      <section className="relative w-full h-[55vh] md:h-[65vh] bg-neutral-950 overflow-hidden">
        {/* Drag Instructions overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
          <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 text-white">
              <Compass className="w-4 h-4 text-[#80bea6] animate-spin-slow" />
              <span className="text-xs font-bold tracking-wide">Chế độ VR 360° (Kéo chuột để xoay)</span>
            </div>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 text-white transition-all">
              <Lock className="w-4 h-4" />
            </button>
          </div>
          <div className="max-w-xl text-white pointer-events-auto bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <h2 className="text-xl md:text-3xl font-extrabold mb-1">{selectedRoom.name}</h2>
            <p className="text-xs md:text-sm text-gray-200">{selectedRoom.description}</p>
          </div>
        </div>

        {/* VR Simulated Room Image Viewer */}
        <div 
          className="absolute inset-0 w-[400%] h-full cursor-grab active:cursor-grabbing select-none"
          style={{ 
            backgroundImage: `url('${selectedRoom.image}')`,
            backgroundPosition: `${panX}% center`,
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat-x',
            transition: isDragging ? 'none' : 'background-position 0.3s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </section>

      {/* Booking Form and Receipt Panel */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Pessimistic Locking Server Banner */}
        {lockTimeRemaining !== null && lockTimeRemaining > 0 && (
          <div className="max-w-7xl mx-auto px-6 mb-6">
            <div className="bg-[#003527] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#80bea6]/30 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#80bea6] shrink-0 animate-pulse" />
                <span className="text-xs md:text-sm font-medium">
                  <strong>Pessimistic Lock:</strong> {selectedRoom.name} đang được khóa giữ chỗ tạm thời trên hệ thống server để tránh trùng phòng!
                </span>
              </div>
              <div className="bg-[#9b4500] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1.5 shadow">
                <span>Thời gian giữ phòng:</span>
                <span className="font-mono text-sm">
                  {Math.floor(lockTimeRemaining / 60).toString().padStart(2, '0')}:
                  {(lockTimeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {bookedSuccess ? (
          // Success Checkout Card
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center space-y-6"
          >
            {/* Top Payment Success Badge */}
            <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Thông Báo Hệ Thống</p>
                <h3 className="text-lg font-black leading-tight">🎉 THANH TOÁN THÀNH CÔNG!</h3>
              </div>
            </div>

            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-[#003527] mb-2">Đã Nhận Thanh Toán & Đặt Phòng</h3>
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl mb-3 font-semibold">
                ✨ Giao dịch qua <strong>{paymentMethod === 'vnpay' ? 'Cổng VNPay QR' : 'Thẻ Stripe'}</strong> thành công. Dữ liệu phòng <strong>{selectedRoom.name}</strong> đã chuyển trực tiếp tới Lễ Tân xác nhận!
              </p>
              
              {/* Smart Lock Code Dispatched Highlight Box */}
              <div className="bg-[#003527] text-white p-5 rounded-2xl border border-[#80bea6]/30 shadow-md text-left space-y-2.5 my-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#80bea6]" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-[#80bea6]">Mã Smart Lock Cửa Phòng</span>
                  </div>
                  <span className="bg-[#fd8a42] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Kích Hoạt Tự Động
                  </span>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="text-[10px] text-gray-300">Mã PIN mở khóa điện tử phòng <strong>{selectedRoom.name}</strong>:</p>
                    <p className="text-2xl font-mono font-black text-amber-300 tracking-widest mt-0.5">
                      🔑 {lastCreatedBooking?.id ? lastCreatedBooking.id.slice(-4).toUpperCase() : '8824'}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-[#80bea6]">
                    <span>Khóa tự động mở qua Bluetooth / PIN</span>
                    <p className="text-gray-300">Có hiệu lực từ 14:00 ngày 15/12</p>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1.5">
                  <span>✓ Mã Smart Lock đã được gửi tự động qua SMS tới <strong>{phone}</strong> & Email <strong>{email}</strong>.</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-left text-xs text-amber-900 space-y-1 my-2">
                <p className="font-bold flex items-center gap-1 text-[#9b4500]">
                  <span>🔔 Đồng bộ dữ liệu Lễ Tân Admin (Real-time):</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Lễ tân đã nhận được đơn đặt phòng của khách <strong>{fullName}</strong> (SĐT: {phone}).
                  Trạng thái hiện tại: <span className="font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">🟡 Chờ Lễ tân xác nhận</span>
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mt-2">
                Cảm ơn <strong>{fullName}</strong>. Đơn đặt phòng và hóa đơn điện tử đã được ghi nhận vào hệ thống.
              </p>
            </div>

            {/* Simulated Email Sent Notification Banner */}
            <div className="bg-[#e9edff] border border-[#003527]/20 rounded-2xl p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003527] flex items-center justify-center text-white shrink-0">
                  <Mail className="w-5 h-5 text-[#80bea6]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#003527] flex items-center gap-1.5">
                    <span>Email xác nhận đã được gửi tự động!</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">✓ Sent</span>
                  </h4>
                  <p className="text-[11px] text-[#404944] mt-0.5">
                    Hệ thống đã gửi email hóa đơn & mã đơn hàng tới: <strong className="text-[#003527]">{email}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSimulatedEmailModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#003527] text-white hover:bg-[#064e3b] transition-colors rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5 text-[#80bea6]" />
                <span>Xem Email Giả Lập</span>
              </button>
            </div>

            {/* Invoice Breakdown */}
            <div className="bg-[#f1f3ff] border border-gray-200 rounded-2xl p-5 text-left space-y-3 text-xs text-[#404944]">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                <span className="font-extrabold text-[#003527] text-sm">Hóa Đơn Thanh Toán</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  ✓ Đã Thanh Toán
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <span className="font-mono font-bold text-[#9b4500]">{lastCreatedBooking?.id || `booking-${Date.now()}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-bold text-[#141b2b]">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Số CCCD:</span>
                <span className="font-bold text-[#141b2b]">{cccd}</span>
              </div>
              <div className="flex justify-between">
                <span>Số phòng / Loại:</span>
                <span className="font-bold text-[#141b2b]">{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span className="font-bold text-[#003527]">{paymentMethod === 'vnpay' ? 'VNPay QR Code' : 'Thẻ Quốc Tế Stripe'}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái đơn:</span>
                <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Chờ Lễ tân xác nhận</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian lưu trú:</span>
                <span className="font-bold text-[#141b2b]">{nights} đêm (15/12 - 18/12/2024)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200/60 text-sm">
                <span className="font-black text-[#141b2b]">Tổng tiền đã trả:</span>
                <span className="font-black text-[#003527] text-base">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => setShowSimulatedEmailModal(true)}
                className="w-full py-3 bg-[#e9edff] text-[#003527] font-extrabold rounded-xl hover:bg-[#d8e0ff] transition-all text-xs flex items-center justify-center gap-2 border border-[#003527]/20"
              >
                <Mail className="w-4 h-4 text-[#9b4500]" />
                Xem Chi Tiết Email Xác Nhận Đặt Phòng
              </button>
              <button 
                onClick={() => { setBookedSuccess(false); onNavigateToDiscover(); }}
                className="w-full py-3.5 bg-[#003527] text-white font-bold rounded-xl shadow-lg hover:bg-[#064e3b] transition-all active:scale-95 text-sm"
              >
                ➔ Xem phòng đã đặt của tôi (Trang Khách)
              </button>
              <button 
                onClick={onNavigateToAdmin}
                className="w-full py-3.5 border border-[#ffdbca] bg-[#ffdbca]/30 text-[#9b4500] font-bold rounded-xl hover:bg-[#ffdbca]/50 transition-all text-sm"
              >
                Chuyển sang màn hình Lễ tân Admin để xác nhận đơn ➔
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Guest Registration Form */}
            <form onSubmit={handleSubmitBooking} className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#003527] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#003527] rounded-full inline-block" />
                  Thông tin người đặt
                </h3>

                {currentUser && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Đã tự động điền từ tài khoản Khách Hàng: <strong>{currentUser.fullName}</strong></span>
                    </span>
                    <span className="bg-emerald-200/60 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0">
                      {currentUser.role === 'customer' ? 'Khách Hàng' : 'Lễ Tân'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#404944] ml-1">
                        Họ và Tên <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Chỉ chữ cái & khoảng trắng</span>
                    </div>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={handleFullNameChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm text-[#141b2b] ${
                        fullNameError 
                          ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] bg-[#f1f3ff]'
                      }`}
                    />
                    {fullNameError && (
                      <p className="text-[11px] text-red-600 font-bold ml-1 animate-fadeIn flex items-center gap-1">
                        {fullNameError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#404944] ml-1">
                        Số CCCD / CMND <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Chỉ 9 hoặc 12 chữ số</span>
                    </div>
                    <input 
                      type="text" 
                      required
                      value={cccd}
                      onChange={handleCccdChange}
                      maxLength={12}
                      placeholder="012345678901 (12 chữ số)"
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm text-[#141b2b] ${
                        cccdError 
                          ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] bg-[#f1f3ff]'
                      }`}
                    />
                    {cccdError && (
                      <p className="text-[11px] text-red-600 font-bold ml-1 animate-fadeIn flex items-center gap-1">
                        {cccdError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#404944] ml-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@havenstay.vn"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all bg-[#f1f3ff] text-sm text-[#141b2b]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#404944] ml-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+84 987 654 321"
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm text-[#141b2b] ${
                        phoneError 
                          ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] bg-[#f1f3ff]'
                      }`}
                    />
                    {phoneError && (
                      <p className="text-[11px] text-red-600 font-bold ml-1 animate-fadeIn">
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-xs font-bold text-[#404944] ml-1">Trình độ phượt của bạn?</label>
                  <select 
                    value={backpackerLevel}
                    onChange={(e) => setBackpackerLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all bg-[#f1f3ff] text-sm text-[#141b2b] appearance-none"
                  >
                    <option value="Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng">Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng</option>
                    <option value="Tay phượt lão luyện (Pro) - Sẵn sàng cho mọi địa hình">Tay phượt lão luyện (Pro) - Sẵn sàng cho mọi địa hình</option>
                  </select>
                </div>

                {/* Regulation alert box */}
                <div className="mt-6 p-4 bg-[#fd8a42]/10 border border-[#fd8a42]/20 rounded-xl flex gap-3 items-start">
                  <Info className="w-5 h-5 text-[#9b4500] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#682c00] leading-relaxed">
                    Chúng tôi cần thông tin CCCD để đăng ký lưu trú tạm thời theo quy định và để kích hoạt hệ thống <strong>Smart Lock</strong> khi bạn nhận phòng.
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[#003527] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#003527] rounded-full inline-block" />
                  Phương thức thanh toán
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label 
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-[#003527] bg-[#b0f0d6]/15 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'vnpay'} 
                      onChange={() => setPaymentMethod('vnpay')}
                      className="w-4.5 h-4.5 text-[#003527] focus:ring-[#003527]" 
                    />
                    <div className="ml-4 flex flex-col justify-center">
                      <span className="font-bold text-xs text-[#003527]">VNPay / Ngân hàng nội địa</span>
                      <span className="text-[10px] text-gray-400">Miễn phí giao dịch</span>
                    </div>
                    {/* VNPay minimal logo */}
                    <img 
                      alt="VNPay Logo" 
                      className="w-10 h-5 ml-auto object-contain shrink-0" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA03mL3POBG91QctWvqSJXecjfhlFzTaRfHgroBqbptEp02fnjwLFsR7AMbChZY6M8xXfr-E0MzyTWylKZXggXYu1LxQ3A_Z1z_xQOPmiESvTJje9OpllaMo7seYEZy-8k2B56NvM-HWHa7yyGL9Jf1uVbl5WiVytUgGmeQ6F3YnUlosbHHEy6kKqB-fMVEOPHKEYLvLuISnlt1F2sPlefsgXGWeJBmauFv_xxZNK8dLKMrqGGJG4SBsZ-tpPTaCwcJm-mNBRJ3eg" 
                    />
                  </label>

                  <label 
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#003527] bg-[#b0f0d6]/15 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'stripe'} 
                      onChange={() => setPaymentMethod('stripe')}
                      className="w-4.5 h-4.5 text-[#003527] focus:ring-[#003527]" 
                    />
                    <div className="ml-4 flex flex-col justify-center">
                      <span className="font-bold text-xs text-[#141b2b]">Thẻ quốc tế (Stripe)</span>
                      <span className="text-[10px] text-gray-400">Visa, Mastercard, JCB</span>
                    </div>
                    {/* Stripe minimal logo */}
                    <img 
                      alt="Stripe Logo" 
                      className="w-10 h-5 ml-auto object-contain shrink-0" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCHisgVGikUJulcVXusS1AJqulqCEYODhSQp20FSSzGW33HTLGpFf74Ouzh5irQGycMBeIZ64jjsrwJGXSWHi7dmG4ZkeA5JJi47-GSIKDCHYACDfdJuAVrkEwTG6fNOsqVZtrCnkVqVUbVsezzFAxOVTHkeXIEcx8jb3ydl3FU3X6ORQYl_0AVGHLD2Pid_18O_n-ggvl6ojthm0A2jeTC9vf2kaPdD7NJM2-P6yQ3BGQfph16PuIS-3MrmLI7BLHi-AZlfwwdg" 
                    />
                  </label>
                </div>
              </div>
            </form>

            {/* Right Column: Checkout Room Recalculator Receipt */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
                <div className="h-44 relative overflow-hidden">
                  <img 
                    src={selectedRoom.image} 
                    alt={selectedRoom.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-[#9b4500] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md">
                    Tiết kiệm 15%
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#141b2b]">{selectedRoom.name}</h3>
                    <div className="flex items-center gap-1 text-[#404944] mt-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#003527]" />
                      <span>{selectedRoom.location}</span>
                    </div>
                  </div>

                  {/* Room parameter custom adjuster buttons */}
                  <div className="border-t border-b border-gray-100 py-4 space-y-4 text-xs text-[#404944]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex items-center gap-1"><Calendar className="w-4 h-4 text-[#003527]" /> Số đêm đặt phòng</span>
                      <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded-lg">
                        <button 
                          type="button" 
                          onClick={() => setNights(prev => Math.max(1, prev - 1))}
                          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center font-bold text-sm text-[#003527]"
                        >
                          -
                        </button>
                        <span className="font-bold text-[#141b2b] px-1">{nights} đêm</span>
                        <button 
                          type="button" 
                          onClick={() => setNights(prev => prev + 1)}
                          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center font-bold text-sm text-[#003527]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex items-center gap-1"><Users className="w-4 h-4 text-[#003527]" /> Số lượng khách</span>
                      <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded-lg">
                        <button 
                          type="button" 
                          onClick={() => setGuestsCount(prev => Math.max(1, prev - 1))}
                          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center font-bold text-sm text-[#003527]"
                        >
                          -
                        </button>
                        <span className="font-bold text-[#141b2b] px-1">{guestsCount.toString().padStart(2, '0')} Khách</span>
                        <button 
                          type="button" 
                          onClick={() => setGuestsCount(prev => prev + 1)}
                          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center font-bold text-sm text-[#003527]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-3 text-xs md:text-sm text-[#404944]">
                    <div className="flex justify-between">
                      <span>Giá phòng ({nights} đêm)</span>
                      <span className="font-semibold text-[#141b2b]">{basePrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí dịch vụ Smart Lock</span>
                      <span className="font-semibold text-[#141b2b]">{serviceFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100 items-end">
                      <span className="font-extrabold text-[#141b2b] text-base">Tổng cộng</span>
                      <span className="font-extrabold text-[#003527] text-lg md:text-xl">{totalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitBooking}
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#003527] text-white rounded-xl font-bold text-sm hover:bg-[#064e3b] transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Đang xử lý thanh toán...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#80bea6]" />
                        Thanh toán & Nhận mã Smart Lock
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-400">
                    Bằng cách nhấp vào nút này, bạn đồng ý với <a className="underline text-[#9b4500]" href="#">Điều khoản dịch vụ</a> của HavenStay.
                  </p>
                </div>
              </div>

              {/* Badges footer */}
              <div className="mt-6 flex items-center justify-around opacity-60 text-center text-[#404944]">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#003527] mb-1" />
                  <span className="text-[8px] uppercase tracking-wider font-bold">SSL Secured</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#003527] mb-1" />
                  <span className="text-[8px] uppercase tracking-wider font-bold">Smart Verified</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#003527] mb-1" />
                  <span className="text-[8px] uppercase tracking-wider font-bold">Contactless</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Email Confirmation Modal */}
      <AnimatePresence>
        {showSimulatedEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-8"
            >
              {/* Email App Header Bar */}
              <div className="bg-[#1e293b] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#003527] border border-[#80bea6]/40 flex items-center justify-center text-[#80bea6]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide uppercase text-slate-300">
                      Hộp Thư Email Giả Lập (Simulated Inbox)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Email xác nhận đặt phòng vừa được hệ thống tự động gửi tới khách hàng
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSimulatedEmailModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Email Envelope Meta Details */}
              <div className="bg-slate-50 border-b border-gray-200 p-4 px-6 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Người gửi:</span>
                  <span className="font-bold text-slate-800">HavenStay System &lt;bookings@havenstay.vn&gt;</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Người nhận:</span>
                  <span className="font-bold text-[#003527]">{fullName} &lt;{email}&gt;</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Tiêu đề:</span>
                  <span className="font-black text-[#9b4500]">
                    [HavenStay] Xác Nhận Đặt Phòng Thành Công - Mã đơn #{lastCreatedBooking?.id || `booking-${Date.now()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                  <span>Thời gian gửi: Vừa xong (Hệ thống tự động)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">✓ Trạng thái: Delivered</span>
                </div>
              </div>

              {/* Email Body Content (Rendered like HTML Email Template) */}
              <div className="p-6 md:p-8 space-y-6 text-slate-800 text-xs md:text-sm max-h-[60vh] overflow-y-auto">
                {/* Brand Header */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <div className="inline-block px-4 py-2 rounded-2xl bg-[#003527] text-white mb-2">
                    <h2 className="text-2xl font-black tracking-tight">Haven<span className="text-[#ffdbca]">Stay</span></h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Khu Nghỉ Dưỡng & Homestay Trải Nghiệm HavenStay</p>
                </div>

                {/* Greeting */}
                <div>
                  <h4 className="text-base font-bold text-[#003527] mb-2">
                    Kính gửi quý khách {fullName},
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Cảm ơn quý khách đã tin tưởng dịch vụ nghỉ dưỡng của <strong>HavenStay</strong>. Chúng tôi xin xác nhận yêu cầu đặt phòng và giao dịch thanh toán của quý khách đã thành công!
                  </p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-200/60">
                    <span className="font-black text-[#003527] text-sm">THÔNG TIN ĐƠN ĐẶT PHÒNG</span>
                    <span className="font-mono text-xs font-black text-[#9b4500] bg-white px-2.5 py-1 rounded-md border border-amber-200">
                      MÃ: #{lastCreatedBooking?.id || `booking-${Date.now()}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tên phòng:</span>
                      <strong className="text-slate-900 text-sm">{selectedRoom.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Khách đặt:</span>
                      <strong className="text-slate-900">{fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Số CCCD / CMND:</span>
                      <strong className="text-slate-900 font-mono">{cccd}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Số điện thoại:</span>
                      <strong className="text-slate-900">{phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Thời gian lưu trú:</span>
                      <strong className="text-slate-900">{nights} đêm (15/12/2024 - 18/12/2024)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Số lượng khách:</span>
                      <strong className="text-slate-900">{guestsCount} người lớn</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phương thức thanh toán:</span>
                      <strong className="text-[#003527]">{paymentMethod === 'vnpay' ? 'VNPay QR Code' : 'Thẻ Quốc Tế Stripe'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tổng thanh toán:</span>
                      <strong className="text-emerald-700 text-sm font-extrabold">{totalPrice.toLocaleString('vi-VN')}đ</strong>
                    </div>
                  </div>
                </div>

                {/* Important Check-in Guidance */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Hướng dẫn nhận phòng Smart Lock:</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    Đơn đặt phòng đang được chuyển tới bộ phận <strong>Lễ Tân Admin</strong> để kiểm tra và xác nhận lần cuối. Ngay sau khi Lễ Tân bấm Xác Nhận, mã PIN mở cửa Smart Lock 4 chữ số sẽ tự động xuất hiện trên ứng dụng của bạn.
                  </p>
                </div>

                <p className="text-xs text-slate-500 italic text-center pt-2">
                  Trân trọng cảm ơn quý khách và chúc quý khách có một kỳ nghỉ thật tuyệt vời tại HavenStay!
                </p>
              </div>

              {/* Email Footer / Actions */}
              <div className="bg-slate-50 border-t border-gray-200 p-4 px-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <p className="text-[11px] text-slate-400">
                  Đây là thông báo mô phỏng gửi email thực tế cho quy trình trải nghiệm.
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>In / Lưu Email</span>
                  </button>
                  <button 
                    onClick={() => setShowSimulatedEmailModal(false)}
                    className="flex-1 sm:flex-none px-5 py-2 bg-[#003527] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs"
                  >
                    Đóng Xem Email
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment QR / Credit Card Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        totalPrice={totalPrice}
        selectedRoom={selectedRoom}
        fullName={fullName}
        phone={phone}
        paymentMethod={paymentMethod}
        bookingId={pendingBookingId}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </div>
  );
}
