import React, { useState, useEffect } from 'react';
import { Booking, CheckoutGuest } from '../types';
import { 
  Home, Bed, Users, Settings, LogOut, Clock, Plus, Zap, ShoppingBag, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import OverviewTab from './admin/OverviewTab';
import RoomManagementTab from './admin/RoomManagementTab';
import ReceptionTab from './admin/ReceptionTab';
import CustomersTab from './admin/CustomersTab';
import ServicesTab from './admin/ServicesTab';

interface AdminViewProps {
  bookings: Booking[];
  stayGuests: any[];
  checkoutGuests: CheckoutGuest[];
  onConfirmBooking?: (bookingId: string) => void;
  onCheckIn: (bookingId: string, updatedBooking: any) => void;
  onAddService: (guestId: string, serviceName: string, servicePrice: number) => void;
  onCheckOut: (checkoutId: string) => void;
  onNavigateToDiscover: () => void;
  onLogout?: () => void;
}

export default function AdminView({ 
  bookings, 
  stayGuests, 
  checkoutGuests, 
  onConfirmBooking,
  onCheckIn, 
  onAddService, 
  onCheckOut,
  onNavigateToDiscover,
  onLogout
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<string>('reception');
  
  // Real-time clock
  const [timeStr, setTimeStr] = useState<string>('09:45 AM');
  const [dateStr, setDateStr] = useState<string>('Thứ 3, 24 Tháng 10');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeStr(`${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`);
      
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      setDateStr(`${days[now.getDay()]}, ${now.getDate()} Tháng ${months[now.getMonth()]}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9ff]">
      {/* SideNavBar Component */}
      <aside className="fixed left-0 h-full w-[280px] bg-[#f1f3ff] border-r border-[#bfc9c3] flex flex-col py-6 px-4 z-30 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-4">
            <div className="w-10 h-10 rounded-xl bg-[#003527] flex items-center justify-center text-white shadow-md shrink-0">
              <Home className="w-5 h-5 text-[#80bea6]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#003527] leading-none">HavenAdmin</h1>
              <p className="text-[10px] text-[#404944] tracking-widest font-semibold uppercase mt-1">Property Control</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 ${activeTab === 'overview' ? 'bg-[#003527] text-white shadow-sm' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 ${activeTab === 'rooms' ? 'bg-[#003527] text-white shadow-sm' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Bed className="w-4 h-4" />
              <span>Room Management</span>
            </button>

            <button 
              onClick={() => setActiveTab('reception')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 ${activeTab === 'reception' ? 'bg-[#fd8a42] text-white shadow-sm' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4" />
                <span>Reception (Lễ tân)</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce shrink-0">
                  {pendingCount} MỚI
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 ${activeTab === 'customers' ? 'bg-[#003527] text-white shadow-sm' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 ${activeTab === 'services' ? 'bg-[#003527] text-white shadow-sm' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Services</span>
            </button>
          </nav>

          <button 
            onClick={onNavigateToDiscover}
            className="mt-6 w-full py-3 px-4 bg-[#003527] text-white hover:bg-[#064e3b] transition-all rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#80bea6]" />
            <span>Quay lại Booking đặt phòng</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#bfc9c3]/50 pt-4 space-y-1 text-[#404944]">
          <a className="flex items-center gap-3 px-4 py-2 hover:bg-[#e9edff] rounded-xl font-bold text-xs" href="#">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </a>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 overflow-y-auto bg-[#f9f9ff] p-6">
        {/* Top Header Section */}
        <header className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#003527]">
              {activeTab === 'overview' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'rooms' && 'Quản Lý Danh Sách Phòng'}
              {activeTab === 'reception' && 'Màn Hình Reception Lễ Tân'}
              {activeTab === 'customers' && 'Quản Lý Khách Hàng'}
              {activeTab === 'services' && 'Quản Lý Dịch Vụ Phụ Trợ'}
            </h2>
            <p className="text-xs text-[#404944] mt-0.5">HavenStay Property Control Platform</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-xs">
              <span className="font-bold text-[#141b2b] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9b4500]" />
                {dateStr}
              </span>
              <span className="text-[10px] text-[#404944] uppercase tracking-wider font-semibold mt-0.5">{timeStr}</span>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#bfc9c3]">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Receptionist Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2s9hki7EX7wxgqiauQC77juz05iBh3veCz02XeIyG1IsgFqwlT-D5Mg5JhXsIx4DRklOf2ErJ_pPBu1ldlV3iqt-uJ2bebBOVNxKdXHMiXHJDKICjh80BnKXYlkaZ1dtJMZb42R_MqdNJUQ8Fgna4uO2a7kJfHlCs3WegaW8fZiaH-qc900QxhdWlpmdcVNcYwA0Amp1JF_LguzEuWBgWv2yW6rjuaNDkClsL-WuVQIuIn7yMB_q4dr_66eWmEg-vHDFnsfruaQ"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={onLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                title="Đăng xuất khỏi Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          </div>
        </header>

        {/* Real-time New Booking Alert Banner for Receptionist */}
        {pendingCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-[#9b4500] to-[#fd8a42] text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span>Thông Báo Lễ Tân: Có {pendingCount} Đơn Đặt Phòng Mới Từ Khách!</span>
                  <span className="bg-white text-[#9b4500] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Mới Cập Nhật
                  </span>
                </h4>
                <p className="text-xs text-white/90 mt-0.5">
                  Khách vừa tạo đơn đặt phòng mới. Vui lòng kiểm tra thông tin và nhấn "Lễ Tân Xác Nhận" hoặc "Check-in".
                </p>
              </div>
            </div>
            {activeTab !== 'reception' && (
              <button 
                onClick={() => setActiveTab('reception')}
                className="px-4 py-2 bg-white text-[#9b4500] hover:bg-amber-50 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm"
              >
                Mở Màn Hình Lễ Tân ➔
              </button>
            )}
          </div>
        )}

        {/* Tab Content Renderer */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'rooms' && <RoomManagementTab />}
        {activeTab === 'reception' && (
          <ReceptionTab 
            bookings={bookings}
            stayGuests={stayGuests}
            checkoutGuests={checkoutGuests}
            onConfirmBooking={onConfirmBooking}
            onCheckIn={onCheckIn}
            onAddService={onAddService}
            onCheckOut={onCheckOut}
            showToast={showToast}
          />
        )}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'services' && <ServicesTab />}
      </main>

      {/* Dynamic Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#141b2b] text-[#edf0ff] px-5 py-3.5 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-[#80bea6] shrink-0" />
            <span className="text-xs font-semibold leading-relaxed">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
