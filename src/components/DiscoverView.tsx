import React, { useState } from 'react';
import { Room, Booking, UserAccount, UserRole } from '../types';
import { INITIAL_ROOMS } from '../data';
import { 
  MapPin, Search, Star, Compass, Heart, Calendar, User, Eye, Sparkles, 
  SlidersHorizontal, DollarSign, Users, Home, X, RotateCcw, Check, Filter, Building2, Clock, Shield, LogOut, UserCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AITripPlannerModal from './AITripPlannerModal';
import MyBookingsModal from './MyBookingsModal';

interface DiscoverViewProps {
  bookings?: Booking[];
  currentUser?: UserAccount | null;
  initialOpenMyBookings?: boolean;
  onOpenAuthModal?: (role: UserRole) => void;
  onLogout?: () => void;
  onCancelBooking?: (bookingId: string) => void;
  onEarlyCheckOut?: (bookingId: string, notes?: string) => void;
  onSelectRoom: (room: Room, checkIn?: string, checkOut?: string, nights?: number) => void;
  onNavigateToBooking: () => void;
  onNavigateToAdmin: () => void;
  onAddSampleBooking?: () => void;
}

export default function DiscoverView({ 
  bookings = [], 
  currentUser,
  initialOpenMyBookings = false,
  onOpenAuthModal,
  onLogout,
  onCancelBooking,
  onEarlyCheckOut,
  onSelectRoom, 
  onNavigateToBooking, 
  onNavigateToAdmin,
  onAddSampleBooking
}: DiscoverViewProps) {
  const [selectedPin, setSelectedPin] = useState<string | null>('hiddengem');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState<boolean>(false);
  const [searchSuccess, setSearchSuccess] = useState<boolean>(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState<boolean>(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState<boolean>(initialOpenMyBookings);

  React.useEffect(() => {
    if (initialOpenMyBookings) {
      setIsMyBookingsOpen(true);
    }
  }, [initialOpenMyBookings]);

  // Helper to check room occupancy during selected dates
  const isRoomOccupiedDuringDates = (roomName: string, cin: string, cout: string): boolean => {
    if (!cin || !cout) return false;
    const searchIn = new Date(cin);
    const searchOut = new Date(cout);
    if (isNaN(searchIn.getTime()) || isNaN(searchOut.getTime())) return false;

    return bookings.some(b => {
      if (!b.roomName || !b.roomName.toLowerCase().includes(roomName.toLowerCase())) return false;
      if (b.status === 'cancelled' || b.status === 'checked_out') return false;
      
      const bIn = new Date(b.checkInDate);
      const bOut = b.checkOutDate ? new Date(b.checkOutDate) : new Date(bIn.getTime() + (b.nights || 1) * 86400000);
      
      return searchIn < bOut && searchOut > bIn;
    });
  };

  const calcNights = (cin: string, cout: string) => {
    const d1 = new Date(cin);
    const d2 = new Date(cout);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };

  const searchNights = calcNights(checkInDate, checkOutDate);

  // Filter Bar States
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute Filtered Rooms
  const filteredRooms = INITIAL_ROOMS.filter((room) => {
    // 0. Only available filter
    if (onlyAvailableFilter && isRoomOccupiedDuringDates(room.name, checkInDate, checkOutDate)) {
      return false;
    }

    // 1. Price filter
    if (selectedPriceRange === 'under1m' && room.pricePerNight >= 1000000) return false;
    if (selectedPriceRange === '1m-1.5m' && (room.pricePerNight < 1000000 || room.pricePerNight > 1500000)) return false;
    if (selectedPriceRange === 'over1.5m' && room.pricePerNight <= 1500000) return false;

    // 2. Capacity filter
    const cap = room.capacity || 2;
    if (selectedCapacity === '1-2' && cap > 2) return false;
    if (selectedCapacity === '3-4' && (cap < 3 || cap > 4)) return false;
    if (selectedCapacity === '5+' && cap < 5) return false;

    // 3. Room Type filter
    if (selectedRoomType !== 'all' && room.roomType !== selectedRoomType) return false;

    // 4. Keyword Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = room.name.toLowerCase().includes(q);
      const matchLoc = room.location.toLowerCase().includes(q);
      const matchType = room.roomType?.toLowerCase().includes(q) || false;
      const matchTags = room.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchLoc && !matchType && !matchTags) return false;
    }

    return true;
  });

  const isFilterActive = selectedPriceRange !== 'all' || selectedCapacity !== 'all' || selectedRoomType !== 'all' || searchQuery.trim() !== '' || onlyAvailableFilter;

  const handleResetFilters = () => {
    setSelectedPriceRange('all');
    setSelectedCapacity('all');
    setSelectedRoomType('all');
    setSearchQuery('');
    setOnlyAvailableFilter(false);
  };

  // Filter or search simulation
  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Vui lòng nhập ngày nhận phòng và ngày trả phòng.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.');
      return;
    }
    setSearchSuccess(true);
    setTimeout(() => {
      setSearchSuccess(false);
    }, 3500);

    const roomElem = document.getElementById('room-list-section');
    if (roomElem) {
      roomElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRoomClick = (room: Room) => {
    onSelectRoom(room, checkInDate, checkOutDate, searchNights);
    onNavigateToBooking();
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] pb-24 md:pb-0">
      {/* Modals */}
      <AITripPlannerModal 
        isOpen={isAiPlannerOpen} 
        onClose={() => setIsAiPlannerOpen(false)} 
        onSelectRoom={onNavigateToBooking}
      />

      <MyBookingsModal 
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={bookings}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
        onCancelBooking={onCancelBooking}
        onEarlyCheckOut={onEarlyCheckOut}
        onNavigateToAdmin={onNavigateToAdmin}
        onAddSampleBooking={onAddSampleBooking}
      />

      {/* Search Result Success Banner */}
      <AnimatePresence>
        {searchSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#ffffff] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-[#80bea6]/30"
          >
            <Sparkles className="w-5 h-5 text-[#80bea6] animate-pulse" />
            <span className="font-medium text-sm">Tìm thấy phòng trống phù hợp cho bạn từ {checkInDate} đến {checkOutDate}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky z-40 shadow-sm bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[#003527] flex items-center justify-center text-white">
              <MapPin className="w-5 h-5 text-[#80bea6]" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#003527] tracking-tight transition-transform group-hover:scale-102">
              Hidden <span className="text-[#9b4500]">Gem</span>
            </h1>
          </div>

          {/* Quick Features Links */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setIsAiPlannerOpen(true)}
              className="flex items-center gap-2 bg-[#e9edff] text-[#003527] hover:bg-[#dce2f7] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-[#003527]/20"
            >
              <Sparkles className="w-4 h-4 text-[#9b4500] animate-bounce" />
              <span>AI Trip Planner</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuthModal) onOpenAuthModal('customer');
                } else {
                  setIsMyBookingsOpen(true);
                }
              }}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-[#003527] text-white hover:bg-[#064e3b] rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-[#80bea6]" />
              <span className="hidden sm:inline">Phòng Đã Đặt Của Tôi</span>
              {(() => {
                let activeCount = 0;
                if (currentUser) {
                  if (currentUser.role === 'admin') {
                    activeCount = bookings.filter(b => b.status !== 'checked_out').length;
                  } else {
                    const userEmail = currentUser.email?.toLowerCase().trim();
                    const userPhone = currentUser.phone?.trim();
                    const userName = currentUser.fullName?.toLowerCase().trim();
                    const userCccd = currentUser.cccd?.trim();
                    const matched = bookings.filter(b => {
                      if (b.status === 'checked_out') return false;
                      return (
                        (userEmail && b.email?.toLowerCase().trim() === userEmail) ||
                        (userPhone && b.phone?.trim() === userPhone) ||
                        (userName && b.guestName?.toLowerCase().trim() === userName) ||
                        (userCccd && b.cccd?.trim() === userCccd)
                      );
                    });
                    activeCount = matched.length > 0 
                      ? matched.length 
                      : bookings.filter(b => b.status !== 'checked_out').length;
                  }
                } else {
                  activeCount = bookings.filter(b => b.status !== 'checked_out').length;
                }

                return activeCount > 0 ? (
                  <span className="bg-[#fd8a42] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {activeCount}
                  </span>
                ) : null;
              })()}
            </button>

            {/* Multi-Role Account Badge / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    currentUser.role === 'admin' ? 'bg-[#fd8a42]' : 'bg-[#003527]'
                  }`}>
                    {currentUser.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-[#003527] leading-none text-[11px]">{currentUser.fullName}</p>
                    <span className="text-[9px] font-semibold text-emerald-800 uppercase">
                      {currentUser.role === 'admin' ? 'Lễ Tân Admin' : 'Khách Hàng'}
                    </span>
                  </div>
                </div>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="p-1 hover:bg-emerald-200/60 rounded-lg text-emerald-800 transition-colors ml-1"
                    title="Đăng xuất tài khoản"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.('customer')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e9edff] text-[#003527] hover:bg-[#dce2f7] rounded-xl text-xs font-bold transition-all border border-[#003527]/20"
              >
                <User className="w-3.5 h-3.5 text-[#003527]" />
                <span>Đăng Nhập</span>
              </button>
            )}

            <button
              onClick={() => setIsAiPlannerOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#e9edff] text-[#003527]"
              title="AI Planner"
            >
              <Sparkles className="w-4 h-4 text-[#9b4500]" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Interactive Map Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] bg-[#e9edff] overflow-hidden">
          {/* Map Image Layer */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuABJCwXmpUhM3Hez1JF1IWbngv1IbDfKXTZ-Orb2_J60C4wslMcOCZlLReDYk_GUCR3zizK8PK_5oxTQFA3jHpB8QDFM7mDOltYNhZJDkoKEeZb68XF1GRb6ZT8XDEoDxI7UO6wojYfPvZlbOCiIQqLi0l0DdXWB3QZFCbqyLdhAZ2nog8sDYCiX88xtAMU5_YhiPnZMlX33N775LHFK8dba2m7D5GHC88uhSJJtBsrZd_kokMWWX1OrEhiIzAWg5xtm8xyLxZzHg')`,
              filter: 'brightness(0.97) contrast(1.02)'
            }}
          />

          {/* Gradient Cover to fade the bottom of map */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f9f9ff] to-transparent pointer-events-none" />

          {/* Map Interactive Pins Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Main Pin (Hidden Gem) */}
            <div 
              style={{ top: '48%', left: '49%' }}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center"
              onClick={() => setSelectedPin('hiddengem')}
            >
              <div className="relative group flex flex-col items-center">
                <img 
                  alt="Hidden Gem Main Pin" 
                  className={`w-16 h-16 md:w-22 md:h-22 drop-shadow-2xl transition-transform duration-300 ${selectedPin === 'hiddengem' ? 'scale-110 animate-bounce' : 'hover:scale-105'}`}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5TkQg2R1P6GA782Sa-hqrk50MZrVwOXHjrXPGCGFrSSIhr1zu2lggfRqO8D9bh_u8e1BN5Gq3-q5i7sruBbj4aG7mSAPyVY-aNBCCGupEQ172dre8Lw9EbAgzbbq1MZ9psRQWmHVjM25knGyix6i86RntQ29dKmI8z9FuKgycs0K-MhgCwnwKE71YJdt91eCkJfSGaEs49Ntc_aa3nbvTNr2UNraKkt9CUfuDL3sfzKzxXopnPDEuJvQkf_5UoiS-fMc2giHUaA" 
                />
                <div className={`mt-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-gray-200 text-xs font-bold text-[#003527] transition-all duration-300 ${selectedPin === 'hiddengem' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}>
                  Căn hộ Panorama View
                </div>
              </div>
            </div>

            {/* Attraction Pin 1: Thác Datanla */}
            <div 
              style={{ top: '22%', left: '21%' }}
              className="absolute pointer-events-auto cursor-pointer"
              onClick={() => setSelectedPin('datanla')}
            >
              <div className="relative group flex flex-col items-center">
                <img 
                  alt="Attraction Pin" 
                  className={`w-10 h-10 md:w-14 md:h-14 drop-shadow-lg transition-transform ${selectedPin === 'datanla' ? 'scale-115' : 'hover:scale-110'}`}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_j7roKpuD3eiKQhFE0N23kh1jnwU4keTDeAniJSd6lXo_MzsoC5jtgTsSrg4JkVyhswdKcEdbsMtTWDrPrkIojwJIZ6D6sPjhuINDN8TIPYQRyjviTVY3sNX6K8TQtZgJgAzf8U4eC9znUvCPGrEj12YyidSToPxzTLBwW-oEnIxx1yRSPDzKNuTRKKOxGJx2YE9Am7twmKGM22msk4AP6Y4WM_UvyDVbkdhZl3DcuQV9U9gb9F2w_GZLH0LO6WlRQWInx-pAog" 
                />
                <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md border border-gray-100 whitespace-nowrap text-[#9b4500] transition-opacity ${selectedPin === 'datanla' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  Thác Datanla
                </div>
              </div>
            </div>

            {/* Attraction Pin 2: Hồ Tuyền Lâm */}
            <div 
              style={{ top: '65%', left: '72%' }}
              className="absolute pointer-events-auto cursor-pointer"
              onClick={() => setSelectedPin('tuyenlam')}
            >
              <div className="relative group flex flex-col items-center">
                <img 
                  alt="Attraction Pin" 
                  className={`w-10 h-10 md:w-14 md:h-14 drop-shadow-lg transition-transform ${selectedPin === 'tuyenlam' ? 'scale-115' : 'hover:scale-110'}`}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_j7roKpuD3eiKQhFE0N23kh1jnwU4keTDeAniJSd6lXo_MzsoC5jtgTsSrg4JkVyhswdKcEdbsMtTWDrPrkIojwJIZ6D6sPjhuINDN8TIPYQRyjviTVY3sNX6K8TQtZgJgAzf8U4eC9znUvCPGrEj12YyidSToPxzTLBwW-oEnIxx1yRSPDzKNuTRKKOxGJx2YE9Am7twmKGM22msk4AP6Y4WM_UvyDVbkdhZl3DcuQV9U9gb9F2w_GZLH0LO6WlRQWInx-pAog" 
                />
                <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md border border-gray-100 whitespace-nowrap text-[#9b4500] transition-opacity ${selectedPin === 'tuyenlam' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  Hồ Tuyền Lâm
                </div>
              </div>
            </div>

            {/* Attraction Pin 3: Vườn Hoa Đà Lạt */}
            <div 
              style={{ top: '38%', left: '83%' }}
              className="absolute pointer-events-auto cursor-pointer"
              onClick={() => setSelectedPin('vuonhoa')}
            >
              <div className="relative group flex flex-col items-center">
                <img 
                  alt="Attraction Pin" 
                  className={`w-10 h-10 md:w-14 md:h-14 drop-shadow-lg transition-transform ${selectedPin === 'vuonhoa' ? 'scale-115' : 'hover:scale-110'}`}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_j7roKpuD3eiKQhFE0N23kh1jnwU4keTDeAniJSd6lXo_MzsoC5jtgTsSrg4JkVyhswdKcEdbsMtTWDrPrkIojwJIZ6D6sPjhuINDN8TIPYQRyjviTVY3sNX6K8TQtZgJgAzf8U4eC9znUvCPGrEj12YyidSToPxzTLBwW-oEnIxx1yRSPDzKNuTRKKOxGJx2YE9Am7twmKGM22msk4AP6Y4WM_UvyDVbkdhZl3DcuQV9U9gb9F2w_GZLH0LO6WlRQWInx-pAog" 
                />
                <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md border border-gray-100 whitespace-nowrap text-[#9b4500] transition-opacity ${selectedPin === 'vuonhoa' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  Vườn Hoa Đà Lạt
                </div>
              </div>
            </div>
          </div>

          {/* Floating Map Pin Details Display Card */}
          {selectedPin && (
            <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-xs hidden md:block">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 pointer-events-auto animate-in fade-in duration-300">
                <h4 className="text-[#003527] font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#9b4500]" />
                  {selectedPin === 'hiddengem' && 'Hidden Gem Resort - Da Lat'}
                  {selectedPin === 'datanla' && 'Thác Datanla'}
                  {selectedPin === 'tuyenlam' && 'Khu du lịch Hồ Tuyền Lâm'}
                  {selectedPin === 'vuonhoa' && 'Vườn Hoa Thành Phố'}
                </h4>
                <p className="text-xs text-[#404944] leading-relaxed">
                  {selectedPin === 'hiddengem' && 'Nằm thoai thoải trên ngọn đồi thông thơ mộng với tầm nhìn panorama ngắm toàn cảnh thung lũng sương mây tuyệt đẹp.'}
                  {selectedPin === 'datanla' && 'Khu du lịch thác nước tuyệt đẹp với trò chơi máng trượt xuyên rừng thông hấp dẫn và trải nghiệm mạo hiểm.'}
                  {selectedPin === 'tuyenlam' && 'Hồ nước ngọt nhân tạo lớn nhất Đà Lạt, được bao bọc bởi rừng thông ba lá xanh mướt, tĩnh lặng và thanh bình.'}
                  {selectedPin === 'vuonhoa' && 'Nơi quy tụ hàng trăm loài hoa khoe sắc rực rỡ quanh năm, là điểm check-in không thể bỏ qua tại trung tâm Đà Lạt.'}
                </p>
              </div>
            </div>
          )}

          {/* Map Filters Overlay Bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-20">
            <div className="bg-white/85 backdrop-blur-lg p-3 md:p-2 rounded-2xl md:rounded-full shadow-2xl border border-white/40 flex flex-col md:flex-row items-center gap-4 md:gap-2">
              <div className="flex-1 w-full grid grid-cols-2 gap-4 md:gap-2 divide-x divide-gray-200/60 px-2 md:pl-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#404944] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#9b4500]" /> NGÀY ĐẾN
                  </span>
                  <input 
                    type="date" 
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      setCheckInDate(newIn);
                      if (checkOutDate && newIn >= checkOutDate) {
                        const d = new Date(newIn);
                        d.setDate(d.getDate() + 1);
                        setCheckOutDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    className="bg-transparent border-none text-xs md:text-sm font-extrabold text-[#003527] focus:outline-none focus:ring-0 p-0 h-6 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col pl-4">
                  <span className="text-[9px] font-bold text-[#404944] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#9b4500]" /> NGÀY ĐI ({searchNights} đêm)
                  </span>
                  <input 
                    type="date" 
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="bg-transparent border-none text-xs md:text-sm font-extrabold text-[#003527] focus:outline-none focus:ring-0 p-0 h-6 cursor-pointer"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <button 
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-[#003527] text-white px-8 py-3.5 rounded-xl md:rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#064e3b] transition-all hover:shadow-lg active:scale-95"
                >
                  <Search className="w-4 h-4 text-[#80bea6]" />
                  Tìm Phòng Trống
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Room Suggestion Section & Filter Bar */}
        <section id="room-list-section" className="max-w-7xl mx-auto px-6 py-12 relative z-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#003527] tracking-tight">Danh Sách Phòng Khám Phá</h2>
              <p className="text-sm md:text-base text-[#404944]">
                Thời gian tìm kiếm: <strong className="text-[#003527]">{checkInDate}</strong> đến <strong className="text-[#003527]">{checkOutDate}</strong> ({searchNights} đêm)
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOnlyAvailableFilter(prev => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  onlyAvailableFilter 
                    ? 'bg-[#003527] text-white border-[#003527]' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-4 h-4 text-[#80bea6]" />
                <span>Chỉ hiện phòng còn trống ({checkInDate} - {checkOutDate})</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-[#003527] bg-[#e9edff] px-3.5 py-2 rounded-xl border border-[#003527]/10 shrink-0">
                <span>Hiển thị <strong>{filteredRooms.length}</strong> / {INITIAL_ROOMS.length} phòng</span>
              </div>
            </div>
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200/80 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#003527]/10 flex items-center justify-center text-[#003527]">
                  <SlidersHorizontal className="w-4 h-4 text-[#003527]" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[#003527]">Bộ Lọc Tìm Kiếm Chi Tiết</h3>
                  <p className="text-[11px] text-gray-500">Tìm phòng chuẩn nhu cầu theo Giá, Sức chứa và Loại hình</p>
                </div>
              </div>

              {/* Search input + Clear button */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm tên phòng, địa điểm, tag..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {/* 1. Price Range Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#003527] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#9b4500]" /> Mức Giá
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="under1m">Dưới 1.000.000đ / đêm</option>
                  <option value="1m-1.5m">1.000.000đ - 1.500.000đ / đêm</option>
                  <option value="over1.5m">Trên 1.500.000đ / đêm</option>
                </select>
              </div>

              {/* 2. Capacity Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#003527] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#9b4500]" /> Sức Chứa (Sức Ở)
                </label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                >
                  <option value="all">Tất cả sức chứa</option>
                  <option value="1-2">1 - 2 Khách (Cặp đôi / Đơn)</option>
                  <option value="3-4">3 - 4 Khách (Gia đình / Nhóm nhỏ)</option>
                  <option value="5+">5+ Khách (Đoàn đông / Biệt thự)</option>
                </select>
              </div>

              {/* 3. Room Type Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#003527] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-[#9b4500]" /> Loại Phòng
                </label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
                >
                  <option value="all">Tất cả loại phòng</option>
                  <option value="Căn hộ">Căn hộ (Apartment)</option>
                  <option value="Suite">Phòng Suite cao cấp</option>
                  <option value="Villa / Cabin">Villa / Cabin gỗ</option>
                  <option value="Gác Mái">Gác Mái (Loft)</option>
                  <option value="Studio">Studio</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
            </div>

            {/* Quick Chips Selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Lọc nhanh loại phòng:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Suite', label: 'Suite' },
                { id: 'Căn hộ', label: 'Căn hộ' },
                { id: 'Villa / Cabin', label: 'Villa & Cabin' },
                { id: 'Gác Mái', label: 'Gác Mái' },
                { id: 'Studio', label: 'Studio' },
                { id: 'Bungalow', label: 'Bungalow' },
                { id: 'Penthouse', label: 'Penthouse' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedRoomType(chip.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRoomType === chip.id
                      ? 'bg-[#003527] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRooms.map((room) => {
                const isOccupied = isRoomOccupiedDuringDates(room.name, checkInDate, checkOutDate);

                return (
                  <div 
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer flex flex-col justify-between ${
                      isOccupied 
                        ? 'border-red-200/80 bg-red-50/10 opacity-90' 
                        : 'border-gray-100 shadow-sm hover:shadow-xl'
                    }`}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Room Availability Badge */}
                      <div className="absolute top-4 left-4">
                        {isOccupied ? (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
                            ❌ Đã hết phòng ({checkInDate})
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
                            ✅ Còn phòng trống ({searchNights} đêm)
                          </span>
                        )}
                      </div>

                      {/* Price Tag Overlay */}
                      <div className="absolute top-4 right-4 bg-[#9b4500] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-md">
                        {room.pricePerNight.toLocaleString('vi-VN')}đ / đêm
                      </div>

                      {/* VR 360 Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <button className="bg-white text-[#003527] px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                          <Eye className="w-4 h-4 text-[#9b4500]" />
                          Xem VR 360° & Đặt Phòng
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-1.5">
                          <h3 className="font-bold text-base text-[#141b2b] leading-tight group-hover:text-[#003527] transition-colors">{room.name}</h3>
                          <div className="flex items-center gap-0.5 text-[#9b4500] shrink-0 font-bold text-sm">
                            <Star className="w-3.5 h-3.5 fill-[#9b4500]" />
                            {room.rating.toFixed(1)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 block mb-2">{room.location}</p>

                        {/* Room Attributes Bar (Capacity & Type) */}
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#003527] mb-2">
                          <span className="bg-[#e9edff] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#9b4500]" /> {room.capacity || 2} khách
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1 text-gray-700">
                            <Home className="w-3 h-3 text-gray-500" /> {room.roomType || 'Homestay'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 flex-wrap">
                        {room.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="bg-[#f1f3ff] text-[#404944] border border-[#dce2f7] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 mt-2 ${
                        isOccupied 
                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                          : 'bg-[#003527] text-white hover:bg-[#064e3b] shadow-sm'
                      }`}>
                        {isOccupied ? 'Trùng ngày đặt (Xem phòng)' : 'Đặt Ngay Ngày Này ➔'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-[#9b4500] rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#003527]">Không Tìm Thấy Phòng Phù Hợp</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Không có phòng nào thỏa mãn đồng thời các điều kiện lọc hiện tại. Vui lòng thử thay đổi mức giá, sức chứa hoặc bỏ lọc để xem toàn bộ danh sách phòng.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#003527] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#064e3b] transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#80bea6]" />
                <span>Đặt Lại Bộ Lọc Về Mặc Định</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="w-full py-10 bg-[#edf0ff] border-t border-gray-200 mt-12 text-[#141b2b]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-xl font-black text-[#003527] tracking-tighter">Hidden Gem</span>
            <p className="text-xs text-[#404944]">© 2024 Hidden Gem. Bảo lưu mọi quyền.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#404944]">
            <a className="hover:text-[#9b4500] transition-colors" href="#">Chính sách Bảo mật</a>
            <a className="hover:text-[#9b4500] transition-colors" href="#">Điều khoản Dịch vụ</a>
            <a className="hover:text-[#9b4500] transition-colors" href="#">Hỗ trợ</a>
            <a className="hover:text-[#9b4500] transition-colors" href="#">Liên hệ</a>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around py-3 px-4 z-40 shadow-xl">
        <button className="flex flex-col items-center text-[#003527] scale-105 font-bold">
          <Compass className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Khám phá</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-[#003527]" onClick={onNavigateToBooking}>
          <Eye className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Đặt Phòng & VR</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-[#003527]" onClick={onNavigateToAdmin}>
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Lễ tân</span>
        </button>
      </nav>
    </div>
  );
}
