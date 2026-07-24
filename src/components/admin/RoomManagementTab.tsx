import React, { useState } from 'react';
import { 
  Search, Bed, MapPin, Wifi, Edit3, RotateCcw, CheckCircle2, User, 
  AlertTriangle, Plus, Calendar, Clock, Filter, TrendingUp, XCircle, 
  Check, CalendarDays, Users, DollarSign, ArrowRight, History, 
  CalendarCheck, Building, ShieldCheck, Sparkles
} from 'lucide-react';
import { Booking, CheckoutGuest, Room } from '../../types';
import { INITIAL_ROOMS } from '../../data';

interface RoomManagementTabProps {
  bookings?: Booking[];
  stayGuests?: any[];
  checkoutGuests?: CheckoutGuest[];
}

// Date parsing helper to convert various string formats into standard Date objects
function parseToDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  // Format: DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Check if range [s1, e1] overlaps with [s2, e2]
function isOverlapping(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
  return s1 < e2 && e1 > s2;
}

// Format date for display
function formatDateVN(dateStr: string): string {
  const d = parseToDate(dateStr);
  if (!d) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function RoomManagementTab({
  bookings = [],
  stayGuests = [],
  checkoutGuests = []
}: RoomManagementTabProps) {
  // Main view modes: 'all_rooms' | 'occupied_filter' | 'vacant_stats'
  const [activeSubMode, setActiveSubMode] = useState<'all_rooms' | 'occupied_filter' | 'vacant_stats'>('all_rooms');

  // Filter state for All Rooms mode
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Today reference date (defaulting to current date YYYY-MM-DD)
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  const todayFormatted = todayObj.toISOString().split('T')[0];

  // 1. Occupied Filter State: 'history' | 'today' | 'future' | 'custom'
  const [occupiedPeriod, setOccupiedPeriod] = useState<'history' | 'today' | 'future' | 'custom'>('today');
  const [occFromDate, setOccFromDate] = useState<string>(todayFormatted);
  const [occToDate, setOccToDate] = useState<string>(
    new Date(todayObj.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // 2. Vacant Stats State: 'specific_date' | 'date_range'
  const [vacantCriteria, setVacantCriteria] = useState<'specific_date' | 'date_range'>('specific_date');
  const [singleDate, setSingleDate] = useState<string>(todayFormatted);
  const [vacantFromDate, setVacantFromDate] = useState<string>(todayFormatted);
  const [vacantToDate, setVacantToDate] = useState<string>(
    new Date(todayObj.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Default room dataset (15 authentic homestays)
  const rooms: Room[] = INITIAL_ROOMS;

  // Filter occupied bookings logic
  const getFilteredOccupiedBookings = () => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const inDate = parseToDate(b.checkInDate);
      const outDate = parseToDate(b.checkOutDate);
      if (!inDate || !outDate) return true;

      if (occupiedPeriod === 'history') {
        // Check-out date is in the past (before today)
        return outDate < todayObj;
      } else if (occupiedPeriod === 'today') {
        // Today falls within checkIn and checkOut or booking status is checked_in
        return (inDate <= todayObj && outDate >= todayObj) || b.status === 'checked_in';
      } else if (occupiedPeriod === 'future') {
        // Check-in date is in the future
        return inDate > todayObj;
      } else if (occupiedPeriod === 'custom') {
        const customStart = parseToDate(occFromDate) || todayObj;
        const customEnd = parseToDate(occToDate) || new Date(customStart.getTime() + 86400000);
        return isOverlapping(inDate, outDate, customStart, customEnd);
      }
      return true;
    });
  };

  const filteredOccupiedBookings = getFilteredOccupiedBookings();

  // Vacant Rooms calculation for Specific Date
  const getVacantRoomsForDate = (targetDateStr: string) => {
    const targetDate = parseToDate(targetDateStr) || todayObj;
    
    // Find all room names that have active bookings covering targetDate
    const occupiedRoomNames = new Set<string>();

    bookings.forEach(b => {
      if (b.status === 'cancelled') return;
      const cin = parseToDate(b.checkInDate);
      const cout = parseToDate(b.checkOutDate);
      if (cin && cout && cin <= targetDate && cout > targetDate) {
        occupiedRoomNames.add(b.roomName.toLowerCase());
      }
    });

    // Also check stayGuests currently active
    stayGuests.forEach(sg => {
      if (sg.roomType) occupiedRoomNames.add(sg.roomType.toLowerCase());
      if (sg.roomNumber) occupiedRoomNames.add(sg.roomNumber.toLowerCase());
    });

    const vacantList = rooms.filter(r => !occupiedRoomNames.has(r.name.toLowerCase()));
    const occupiedList = rooms.filter(r => occupiedRoomNames.has(r.name.toLowerCase()));

    return { vacantList, occupiedList };
  };

  // Vacant Rooms calculation for Date Range
  const getVacantRoomsForDateRange = (startStr: string, endStr: string) => {
    const sDate = parseToDate(startStr) || todayObj;
    const eDate = parseToDate(endStr) || new Date(sDate.getTime() + 86400000 * 2);

    const occupiedRoomNames = new Set<string>();

    bookings.forEach(b => {
      if (b.status === 'cancelled') return;
      const cin = parseToDate(b.checkInDate);
      const cout = parseToDate(b.checkOutDate);
      if (cin && cout && isOverlapping(cin, cout, sDate, eDate)) {
        occupiedRoomNames.add(b.roomName.toLowerCase());
      }
    });

    const vacantList = rooms.filter(r => !occupiedRoomNames.has(r.name.toLowerCase()));
    const occupiedList = rooms.filter(r => occupiedRoomNames.has(r.name.toLowerCase()));

    const nights = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

    return { vacantList, occupiedList, nights };
  };

  const specificDateData = getVacantRoomsForDate(singleDate);
  const rangeDateData = getVacantRoomsForDateRange(vacantFromDate, vacantToDate);

  // All rooms filter calculation
  const filteredAllRooms = rooms.filter(r => {
    if (selectedType !== 'all' && r.roomType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchLoc = r.location.toLowerCase().includes(q);
      const matchTag = r.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchLoc && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Mode Switcher Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveSubMode('all_rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubMode === 'all_rooms' 
                ? 'bg-[#003527] text-white shadow-sm' 
                : 'text-gray-600 hover:text-[#003527]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Tất Cả Phòng ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveSubMode('occupied_filter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubMode === 'occupied_filter' 
                ? 'bg-[#9b4500] text-white shadow-sm' 
                : 'text-gray-600 hover:text-[#9b4500]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lọc Phòng Có Khách</span>
          </button>

          <button
            onClick={() => setActiveSubMode('vacant_stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubMode === 'vacant_stats' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            <BarChart3Icon className="w-4 h-4" />
            <span>Thống Kê Phòng Trống</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">
          <Sparkles className="w-4 h-4 text-[#fd8a42]" />
          <span>Thời gian thực & Cập nhật tự động</span>
        </div>
      </div>

      {/* MODE 1: LỌC PHÒNG CÓ KHÁCH (Lịch sử / Hôm nay / Tương lai / Khoảng ngày) */}
      {activeSubMode === 'occupied_filter' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Sub Controls for Occupied Filtering */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#003527] flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#9b4500]" />
                  <span>Bộ Lọc Phòng Đang & Đã Có Khách Theo Mốc Thời Gian</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Xem chi tiết thông tin khách thuê phòng trong Lịch sử, Hôm nay, Tương lai hoặc khoảng ngày tùy chọn.
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setOccupiedPeriod('history')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    occupiedPeriod === 'history'
                      ? 'bg-[#003527] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lịch Sử (Quá Khứ)</span>
                </button>

                <button
                  onClick={() => setOccupiedPeriod('today')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    occupiedPeriod === 'today'
                      ? 'bg-[#9b4500] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-orange-200" />
                  <span>Hôm Nay ({formatDateVN(todayFormatted)})</span>
                </button>

                <button
                  onClick={() => setOccupiedPeriod('future')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    occupiedPeriod === 'future'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-blue-200" />
                  <span>Tương Lai (Sắp Tới)</span>
                </button>

                <button
                  onClick={() => setOccupiedPeriod('custom')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    occupiedPeriod === 'custom'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-purple-200" />
                  <span>Khoảng Ngày Tuỳ Chọn</span>
                </button>
              </div>
            </div>

            {/* Custom Date Inputs if 'custom' is selected */}
            {occupiedPeriod === 'custom' && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-wrap items-center gap-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-extrabold text-purple-900">Từ Ngày:</label>
                  <input
                    type="date"
                    value={occFromDate}
                    onChange={(e) => setOccFromDate(e.target.value)}
                    className="bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-extrabold text-purple-900">Đến Ngày:</label>
                  <input
                    type="date"
                    value={occToDate}
                    onChange={(e) => setOccToDate(e.target.value)}
                    className="bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <span className="text-xs font-semibold text-purple-700">
                  Hiển thị tất cả phòng có khách lưu trú chạm vào khoảng ngày trên.
                </span>
              </div>
            )}

            {/* Summary metrics header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Tiêu Chí Đang Chọn</p>
                  <p className="text-sm font-black text-[#003527] mt-0.5">
                    {occupiedPeriod === 'history' && '📜 Lịch Sử Đã Ở'}
                    {occupiedPeriod === 'today' && '⚡ Khách Ở Hôm Nay'}
                    {occupiedPeriod === 'future' && '🚀 Đặt Trước Tương Lai'}
                    {occupiedPeriod === 'custom' && `🗓️ ${formatDateVN(occFromDate)} ➔ ${formatDateVN(occToDate)}`}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#003527]/10 flex items-center justify-center text-[#003527]">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-amber-800 uppercase">Tổng Số Lượt Khách</p>
                  <p className="text-xl font-black text-[#9b4500] mt-0.5">
                    {filteredOccupiedBookings.length} Đơn Đặt
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#9b4500]/10 flex items-center justify-center text-[#9b4500]">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-800 uppercase">Tổng Doanh Thu Đơn</p>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">
                    {filteredOccupiedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Occupied Bookings List */}
          {filteredOccupiedBookings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Bed className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-gray-700">Không tìm thấy phòng nào có khách trong mốc thời gian này</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Thử thay đổi mốc thời gian xem Lịch Sử, Hôm Nay, Tương Lai hoặc nới rộng khoảng ngày tuỳ chọn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOccupiedBookings.map((b) => {
                const roomInfo = rooms.find(r => r.name.toLowerCase() === b.roomName.toLowerCase()) || rooms[0];
                return (
                  <div 
                    key={b.id} 
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Room Header Banner */}
                      <div className="relative h-36 overflow-hidden">
                        <img 
                          src={roomInfo.image} 
                          alt={b.roomName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#003527] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                            {b.roomType || roomInfo.roomType}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          {b.status === 'checked_in' && (
                            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Đang ở (Checked-in)
                            </span>
                          )}
                          {b.status === 'confirmed' && (
                            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                              Đã xác nhận
                            </span>
                          )}
                          {b.status === 'checked_out' && (
                            <span className="bg-gray-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                              Đã trả phòng
                            </span>
                          )}
                          {b.status === 'pending' && (
                            <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                              Chờ xác nhận
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="font-extrabold text-base leading-snug drop-shadow-sm">{b.roomName}</h4>
                          <p className="text-[11px] text-gray-200 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#80bea6]" />
                            <span className="truncate">{roomInfo.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Guest Details */}
                      <div className="p-4 space-y-3 text-xs">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Tên Khách Thuê:</span>
                            <span className="font-extrabold text-[#141b2b]">{b.guestName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Số điện thoại:</span>
                            <span className="font-bold text-gray-700">{b.phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Số khách ở:</span>
                            <span className="font-semibold text-gray-700">{b.guestsCount}</span>
                          </div>
                        </div>

                        {/* Date Stay Range */}
                        <div className="bg-[#fd8a42]/10 p-3 rounded-xl border border-[#fd8a42]/20 space-y-1">
                          <p className="text-[10px] font-black text-[#9b4500] uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Thời Gian Lưu Trú ({b.nights} Đêm)
                          </p>
                          <div className="flex items-center justify-between font-extrabold text-[#682c00]">
                            <span>Nhận: {formatDateVN(b.checkInDate)}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#fd8a42]" />
                            <span>Trả: {formatDateVN(b.checkOutDate)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                          <span className="text-gray-500 font-medium">Tổng tiền thanh toán:</span>
                          <span className="text-sm font-black text-[#003527]">
                            {(b.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        TT: {b.paymentMethod ? b.paymentMethod.toUpperCase() : 'VNPay'}
                      </span>
                      <span className="text-xs font-extrabold text-[#003527] underline cursor-pointer hover:text-[#9b4500]">
                        Chi tiết đơn #{b.id}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: THỐNG KÊ PHÒNG TRỐNG (Theo ngày cụ thể / Theo khoảng ngày) */}
      {activeSubMode === 'vacant_stats' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#003527] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Thống Kê Phân Tích Phòng Trống (Vacant Rooms)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kiểm tra số lượng phòng chưa có khách đặt vào một Ngày Cụ Thể hoặc toàn bộ Khoảng Ngày liên tục.
                </p>
              </div>

              {/* Criteria Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVacantCriteria('specific_date')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    vacantCriteria === 'specific_date'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>1. Theo Ngày Cụ Thể</span>
                </button>

                <button
                  onClick={() => setVacantCriteria('date_range')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    vacantCriteria === 'date_range'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>2. Theo Khoảng Ngày</span>
                </button>
              </div>
            </div>

            {/* Sub Inputs for Specific Date vs Date Range */}
            {vacantCriteria === 'specific_date' ? (
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Chọn Ngày Cụ Thể Cần Thống Kê:</span>
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-xs font-extrabold text-emerald-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    onClick={() => setSingleDate(todayFormatted)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Hôm Nay
                  </button>
                </div>

                <div className="text-xs font-bold text-emerald-800">
                  📅 Đang xem ngày: <span className="underline font-black">{formatDateVN(singleDate)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-extrabold text-emerald-950">Từ Ngày (Check-in):</label>
                      <input
                        type="date"
                        value={vacantFromDate}
                        onChange={(e) => setVacantFromDate(e.target.value)}
                        className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-extrabold text-emerald-950">Đến Ngày (Check-out):</label>
                      <input
                        type="date"
                        value={vacantToDate}
                        onChange={(e) => setVacantToDate(e.target.value)}
                        className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <span className="bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                    {rangeDateData.nights} Đêm Trống Liên Tục
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-emerald-800">
                  💡 Hệ thống lọc loại bỏ tất cả phòng đã bị trùng lịch với bất kỳ đơn đặt nào trong suốt {rangeDateData.nights} đêm từ {formatDateVN(vacantFromDate)} đến {formatDateVN(vacantToDate)}.
                </p>
              </div>
            )}

            {/* Stat Summary Cards */}
            {vacantCriteria === 'specific_date' ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase">Tổng Số Phòng</p>
                    <h4 className="text-2xl font-black text-[#003527] mt-0.5">{rooms.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#003527]/10 flex items-center justify-center text-[#003527]">
                    <Bed className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-600 uppercase">Phòng Đang Có Khách</p>
                    <h4 className="text-2xl font-black text-[#9b4500] mt-0.5">{specificDateData.occupiedList.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#9b4500]/10 flex items-center justify-center text-[#9b4500]">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase">Phòng Trống Trực Tiếp</p>
                    <h4 className="text-2xl font-black text-emerald-600 mt-0.5">{specificDateData.vacantList.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase">Tỷ Lệ Lấp Đầy</p>
                    <h4 className="text-2xl font-black text-blue-600 mt-0.5">
                      {Math.round((specificDateData.occupiedList.length / rooms.length) * 100)}%
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase">Tổng Số Căn Homestay</p>
                    <h4 className="text-2xl font-black text-[#003527] mt-0.5">{rooms.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#003527]/10 flex items-center justify-center text-[#003527]">
                    <Bed className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-600 uppercase">Bị Trùng Lịch Đặt</p>
                    <h4 className="text-2xl font-black text-[#9b4500] mt-0.5">{rangeDateData.occupiedList.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#9b4500]/10 flex items-center justify-center text-[#9b4500]">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase">Trống Suốt Khoảng Ngày</p>
                    <h4 className="text-2xl font-black text-emerald-600 mt-0.5">{rangeDateData.vacantList.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase">Tổng Doanh Thu Tiềm Năng</p>
                    <h4 className="text-lg font-black text-emerald-700 mt-0.5">
                      {rangeDateData.vacantList
                        .reduce((sum, r) => sum + r.pricePerNight * rangeDateData.nights, 0)
                        .toLocaleString('vi-VN')}{' '}
                      đ
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List of Vacant Rooms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-base text-[#003527] flex items-center gap-2">
                <span>Danh Sách Phòng Trống ({vacantCriteria === 'specific_date' ? specificDateData.vacantList.length : rangeDateData.vacantList.length} phòng sẵn sàng)</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Chưa Có Khách Đặt
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(vacantCriteria === 'specific_date' ? specificDateData.vacantList : rangeDateData.vacantList).map((room) => {
                const totalPriceForNights = room.pricePerNight * (vacantCriteria === 'date_range' ? rangeDateData.nights : 1);
                return (
                  <div 
                    key={room.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-44 overflow-hidden">
                        <img 
                          src={room.image} 
                          alt={room.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Trống Sẵn Sàng
                        </span>
                        
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
                          {room.roomType} • Tối đa {room.capacity} khách
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-extrabold text-base text-[#141b2b]">{room.name}</h4>
                          <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#80bea6]" />
                            <span className="truncate">{room.location}</span>
                          </p>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Giá 1 Đêm</p>
                            <p className="font-extrabold text-sm text-[#003527]">
                              {room.pricePerNight.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                          
                          {vacantCriteria === 'date_range' && (
                            <div className="text-right">
                              <p className="text-[10px] text-emerald-700 font-bold uppercase">Tổng {rangeDateData.nights} Đêm</p>
                              <p className="font-black text-sm text-emerald-700">
                                {totalPriceForNights.toLocaleString('vi-VN')} VNĐ
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1.5 flex-wrap">
                          {room.tags.map((t, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                      <button 
                        onClick={() => alert(`Đặt phòng ${room.name} trực tiếp cho khách tại Lễ tân!`)}
                        className="flex-1 py-2 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#80bea6]" />
                        <span>Giữ Chỗ Cho Khách</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: TẤT CẢ PHÒNG (Standard Room Management view) */}
      {activeSubMode === 'all_rooms' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Search & Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm theo tên phòng, địa điểm hoặc tiện ích..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:outline-none"
              >
                <option value="all">Tất cả loại phòng</option>
                <option value="Căn hộ">Căn hộ</option>
                <option value="Suite">Suite</option>
                <option value="Gác Mái">Gác Mái</option>
                <option value="Villa / Cabin">Villa / Cabin</option>
                <option value="Studio">Studio</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Penthouse">Penthouse</option>
              </select>

              <button className="bg-[#003527] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-[#064e3b] transition-all flex items-center gap-1.5 shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phòng mới</span>
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Sẵn sàng
                    </span>
                    <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      {room.roomType}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-base text-[#141b2b]">{room.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{room.location}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl text-xs">
                      <span className="text-gray-500 font-medium">Giá 1 đêm:</span>
                      <span className="font-extrabold text-[#003527]">{room.pricePerNight.toLocaleString('vi-VN')} VNĐ</span>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {room.tags.map((t, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                  <button className="flex-1 py-2 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all flex items-center justify-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Quản lý phòng</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BarChart3Icon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  );
}
