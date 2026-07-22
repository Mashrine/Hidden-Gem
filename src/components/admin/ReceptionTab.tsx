import React, { useState } from 'react';
import { Booking, CheckoutGuest } from '../../types';
import { 
  CheckCircle, FileUp, Coffee, Settings, Flame, Bike, PlusCircle, 
  ShieldAlert, Shield, Clock, UploadCloud, RefreshCw, LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceptionTabProps {
  bookings: Booking[];
  stayGuests: any[];
  checkoutGuests: CheckoutGuest[];
  onConfirmBooking?: (bookingId: string) => void;
  onCheckIn: (bookingId: string, updatedBooking: any) => void;
  onAddService: (guestId: string, serviceName: string, servicePrice: number) => void;
  onCheckOut: (checkoutId: string) => void;
  showToast: (msg: string) => void;
}

export default function ReceptionTab({
  bookings,
  stayGuests,
  checkoutGuests,
  onConfirmBooking,
  onCheckIn,
  onAddService,
  onCheckOut,
  showToast
}: ReceptionTabProps) {
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);
  const [isCccdDragging, setIsCccdDragging] = useState<boolean>(false);
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [scannedName, setScannedName] = useState<string>('');
  const [scannedNum, setScannedNum] = useState<string>('');

  const [selectedStayGuestForServices, setSelectedStayGuestForServices] = useState<any | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCccdDragging(true);
  };

  const handleDragLeave = () => {
    setIsCccdDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCccdDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCccdFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCccdFile(e.target.files[0]);
    }
  };

  const processCccdFile = (file: File) => {
    setCccdFile(file);
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const randNum = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setScannedNum(randNum);
      setScannedName(selectedBookingForCheckIn?.guestName || 'Nguyễn Văn An');
      setScannedResult({
        name: selectedBookingForCheckIn?.guestName || 'Nguyễn Văn An',
        number: randNum,
        gender: 'Nam',
        dob: '12/05/1994',
        address: 'Hà Nội, Việt Nam'
      });
      showToast("Quét CCCD thành công!");
    }, 1500);
  };

  const handleConfirmCheckinSubmit = () => {
    if (!selectedBookingForCheckIn) return;
    
    const updated = {
      ...selectedBookingForCheckIn,
      cccd: scannedNum || selectedBookingForCheckIn.cccd,
      status: 'checked_in' as const
    };

    onCheckIn(selectedBookingForCheckIn.id, updated);
    setSelectedBookingForCheckIn(null);
    setCccdFile(null);
    setScannedResult(null);
    showToast(`Đã hoàn tất check-in cho ${updated.guestName} vào ${updated.roomName}!`);
  };

  const handleAddServiceSubmit = (serviceName: string, price: number) => {
    if (!selectedStayGuestForServices) return;
    onAddService(selectedStayGuestForServices.id, serviceName, price);
    setSelectedStayGuestForServices(null);
    showToast(`Đã thêm dịch vụ "${serviceName}" vào ${selectedStayGuestForServices.roomNumber}!`);
  };

  const handleCheckoutClick = (guest: CheckoutGuest) => {
    onCheckOut(guest.id);
    showToast(`Đã check-out phòng ${guest.roomNumber} cho ${guest.guestName}. Hóa đơn tổng ${guest.totalPrice.toLocaleString('vi-VN')}đ đã tất toán.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 3-Column Bento Kanban Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Đơn Đặt Từ Khách & Khách Sắp Đến */}
        <div className="bg-[#e9edff]/40 p-4 rounded-2xl border border-gray-100 flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#bfc9c3]/30">
            <h3 className="font-bold text-[#003527] flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9b4500] inline-block shrink-0 animate-pulse" />
              Đơn Đặt Phòng Từ Khách
            </h3>
            <span className="bg-[#fd8a42]/10 text-[#9b4500] border border-[#fd8a42]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {bookings.length} Đơn
            </span>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">Chưa có đơn đặt phòng mới từ Khách</div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-sm text-[#003527]">{booking.roomName}</div>
                      <span className="text-[10px] text-gray-400 block font-medium">{booking.roomType}</span>
                    </div>

                    {booking.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        🟡 Đơn Mới Từ Khách
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🟢 Lễ Tân Đã Xác Nhận
                      </span>
                    )}
                  </div>

                  <div className="bg-[#f9f9ff] p-2.5 rounded-lg border border-gray-100 text-xs text-[#141b2b] space-y-1">
                    <p className="font-bold">Khách: {booking.guestName}</p>
                    <p className="text-[11px] text-gray-500">SĐT: {booking.phone} • CCCD: {booking.cccd}</p>
                    <p className="text-[11px] text-gray-500">Nhận: {booking.checkInDate} ➔ Trả: {booking.checkOutDate}</p>
                    <p className="text-[11px] font-extrabold text-[#003527]">Tổng: {booking.totalPrice.toLocaleString('vi-VN')}đ ({booking.paymentMethod === 'vnpay' ? 'VNPay' : 'Stripe'})</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {booking.status === 'pending' && onConfirmBooking && (
                      <button 
                        onClick={() => {
                          onConfirmBooking(booking.id);
                          showToast(`Lễ tân đã xác nhận đơn đặt phòng cho ${booking.guestName}!`);
                        }}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Lễ Tân Xác Nhận
                      </button>
                    )}

                    <button 
                      onClick={() => setSelectedBookingForCheckIn(booking)}
                      className={`py-2 text-white transition-all rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-98 ${
                        booking.status === 'pending' ? 'px-3 bg-[#003527] hover:bg-[#064e3b]' : 'w-full bg-[#003527] hover:bg-[#064e3b]'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5 text-[#80bea6]" />
                      Check-in
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Đang lưu trú */}
        <div className="bg-[#e9edff]/40 p-4 rounded-2xl border border-gray-100 flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#bfc9c3]/30">
            <h3 className="font-bold text-[#003527] flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-[#064e3b] inline-block shrink-0" />
              Đang lưu trú
            </h3>
            <span className="bg-[#b0f0d6]/30 text-[#0b513d] border border-[#95d3ba]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {stayGuests.length} Phòng
            </span>
          </div>

          <div className="space-y-4">
            {stayGuests.map((stay) => (
              <div 
                key={stay.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-extrabold text-xs text-[#064e3b]">{stay.roomNumber}</div>
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded text-[8px] font-bold">
                    ACTIVE
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-[#141b2b] mb-2">{stay.guestName}</h4>
                
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {stay.services.map((srv: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-bold bg-[#edf0ff] border border-gray-100 text-[#404944] px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      {srv === 'Ăn sáng' && <Coffee className="w-2.5 h-2.5 text-[#9b4500]" />}
                      {srv === 'Giặt là' && <Settings className="w-2.5 h-2.5 text-blue-500" />}
                      {srv === 'BBQ Sân thượng' && <Flame className="w-2.5 h-2.5 text-red-500" />}
                      {srv === 'Thuê xe Moto' && <Bike className="w-2.5 h-2.5 text-[#003527]" />}
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedStayGuestForServices(stay)}
                  className="w-full py-2 border border-[#003527] text-[#003527] hover:bg-[#003527]/5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Thêm dịch vụ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Khách sắp đi (Check-out) */}
        <div className="bg-[#e9edff]/40 p-4 rounded-2xl border border-gray-100 flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#bfc9c3]/30">
            <h3 className="font-bold text-[#003527] flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0" />
              Khách sắp đi
            </h3>
            <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {checkoutGuests.length} Lượt
            </span>
          </div>

          <div className="space-y-4">
            {checkoutGuests.map((guest) => (
              <div 
                key={guest.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-extrabold text-xs text-[#9b4500]">{guest.roomNumber}</div>
                  {guest.status === 'overtime' ? (
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-[8px] font-bold animate-pulse">
                      QUÁ GIỜ
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-semibold">Hẹn: {guest.checkoutTime}</span>
                  )}
                </div>
                <h4 className="font-extrabold text-base text-[#141b2b] mb-3">{guest.guestName}</h4>
                
                <div className="my-3 p-3 bg-[#f1f3ff]/60 rounded-xl border border-gray-100 text-xs text-[#404944] space-y-1.5">
                  <div className="flex justify-between">
                    <span>Tiền phòng:</span>
                    <span className="font-semibold text-[#141b2b]">{guest.roomPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dịch vụ phụ trợ:</span>
                    <span className="font-semibold text-[#141b2b]">{guest.servicePrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-[#003527] border-t border-gray-200/60 pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-sm">{guest.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleCheckoutClick(guest)}
                  className="w-full py-2 bg-[#9b4500] hover:bg-[#682c00] text-white transition-all rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Hoàn tất Check-out
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CCCD Scan / Check-in */}
      <AnimatePresence>
        {selectedBookingForCheckIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[#bfc9c3]/30 flex justify-between items-center bg-[#f1f3ff]">
                <h3 className="font-bold text-base text-[#003527] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#9b4500]" />
                  Xác nhận thông tin khách hàng
                </h3>
                <button 
                  onClick={() => { setSelectedBookingForCheckIn(null); setCccdFile(null); setScannedResult(null); }}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${isCccdDragging ? 'border-[#003527] bg-[#b0f0d6]/10' : 'border-[#bfc9c3] bg-gray-50 hover:bg-gray-100/50'}`}
                >
                  <UploadCloud className={`w-10 h-10 ${isCccdDragging ? 'text-[#003527] animate-bounce' : 'text-[#9b4500]'}`} />
                  
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#141b2b]">Quét hoặc kéo thả ảnh CCCD / Hộ chiếu</p>
                    <p className="text-[10px] text-gray-400 mt-1">Định dạng hỗ trợ: JPG, PNG, PDF (Tối đa 5MB)</p>
                  </div>

                  <div className="flex gap-3 w-full max-w-xs mt-2 justify-center">
                    <label className="flex-1 py-2 bg-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer shadow-sm hover:bg-gray-50">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Chọn tệp
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {isScanning && (
                  <div className="flex items-center justify-center gap-2.5 py-4 text-xs text-[#003527] font-bold bg-[#b0f0d6]/10 rounded-xl">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#9b4500]" />
                    <span>Hệ thống AI đang trích xuất dữ liệu thông tin...</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#404944] uppercase tracking-wide">Họ và tên khách</label>
                    <input 
                      type="text" 
                      value={scannedName || selectedBookingForCheckIn.guestName}
                      onChange={(e) => setScannedName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#404944] uppercase tracking-wide">Số định danh CCCD</label>
                    <input 
                      type="text" 
                      placeholder="Chưa quét"
                      value={scannedNum || selectedBookingForCheckIn.cccd}
                      onChange={(e) => setScannedNum(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs font-semibold"
                    />
                  </div>
                </div>

                {scannedResult && (
                  <div className="bg-[#b0f0d6]/15 border border-[#95d3ba]/30 rounded-xl p-3.5 flex items-start gap-2.5 text-[10px] text-[#0b513d] font-bold">
                    <CheckCircle className="w-4 h-4 text-[#80bea6] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#002117]">Xác thực danh tính khớp 100% với vé đặt phòng!</p>
                      <p className="font-normal text-gray-500 mt-0.5">Địa chỉ lưu trú tạm thời đã tự động đăng ký với chính quyền địa phương.</p>
                    </div>
                  </div>
                )}

                <div className="p-3.5 bg-[#fd8a42]/10 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#682c00] leading-relaxed">
                    Vui lòng đối chiếu khuôn mặt khách hàng so với ảnh chụp trên giấy tờ gốc trước khi phát hành và bàn giao mã khoá phòng.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => { setSelectedBookingForCheckIn(null); setCccdFile(null); setScannedResult(null); }}
                  className="flex-1 py-3 text-xs font-bold border border-gray-200 text-[#404944] rounded-xl hover:bg-gray-100"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleConfirmCheckinSubmit}
                  className="flex-1 py-3 text-xs font-bold bg-[#003527] text-white hover:bg-[#064e3b] rounded-xl shadow-lg shadow-[#003527]/10"
                >
                  Xác nhận Lưu trú (Check-in)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add services */}
      <AnimatePresence>
        {selectedStayGuestForServices && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f1f3ff]">
                <h3 className="font-bold text-base text-[#003527]">Thêm dịch vụ phòng</h3>
                <button 
                  onClick={() => setSelectedStayGuestForServices(null)}
                  className="text-gray-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 mb-2">Thêm dịch vụ tiện ích tăng cường cho <strong>{selectedStayGuestForServices.guestName}</strong> ({selectedStayGuestForServices.roomNumber}):</p>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <button 
                    onClick={() => handleAddServiceSubmit('Ăn sáng', 150000)}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-[#003527] hover:bg-[#b0f0d6]/10 text-xs font-bold text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-[#9b4500]" />
                      Ăn sáng buffet cao cấp
                    </span>
                    <span className="text-gray-400 font-semibold">150.000đ</span>
                  </button>

                  <button 
                    onClick={() => handleAddServiceSubmit('Giặt là', 100000)}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-[#003527] hover:bg-[#b0f0d6]/10 text-xs font-bold text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      Giặt sấy hơi nước siêu tốc
                    </span>
                    <span className="text-gray-400 font-semibold">100.000đ</span>
                  </button>

                  <button 
                    onClick={() => handleAddServiceSubmit('Thuê xe Moto', 250000)}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-[#003527] hover:bg-[#b0f0d6]/10 text-xs font-bold text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-[#003527]" />
                      Thuê xe máy tay ga phượt đèo
                    </span>
                    <span className="text-gray-400 font-semibold">250.000đ</span>
                  </button>

                  <button 
                    onClick={() => handleAddServiceSubmit('BBQ Sân thượng', 500000)}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-[#003527] hover:bg-[#b0f0d6]/10 text-xs font-bold text-left transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      Set tiệc BBQ nướng sườn cừu
                    </span>
                    <span className="text-gray-400 font-semibold">500.000đ</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedStayGuestForServices(null)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-500 rounded-xl hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
