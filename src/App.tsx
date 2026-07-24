import React, { useState, useEffect } from 'react';
import { ViewType, Room, Booking, CheckoutGuest, UserAccount, UserRole } from './types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_STAY_GUESTS, INITIAL_CHECKOUTS } from './data';
import DiscoverView from './components/DiscoverView';
import BookingView from './components/BookingView';
import AdminView from './components/AdminView';
import AuthModal from './components/AuthModal';
import { Compass, Eye, Shield, Layers, HelpCircle, CheckCircle2, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Persistent or cached lists state
  const [view, setView] = useState<ViewType>('discover');
  const [selectedRoom, setSelectedRoom] = useState<Room>(INITIAL_ROOMS[0]); // default to Panorama

  // Date search parameters state
  const [searchCheckInDate, setSearchCheckInDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [searchCheckOutDate, setSearchCheckOutDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });

  const [searchNights, setSearchNights] = useState<number>(1);

  const handleSelectRoomWithSearchDates = (room: Room, checkIn?: string, checkOut?: string, nights?: number) => {
    setSelectedRoom(room);
    if (checkIn) setSearchCheckInDate(checkIn);
    if (checkOut) setSearchCheckOutDate(checkOut);
    if (nights && nights > 0) setSearchNights(nights);
  };
  
  // Multi-Role User Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('haven_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');

  const isAdminLoggedIn = currentUser?.role === 'admin';

  // One-time purge of legacy cached mock data in browser storage
  if (typeof window !== 'undefined' && !localStorage.getItem('haven_storage_v4_clean')) {
    localStorage.removeItem('haven_bookings');
    localStorage.removeItem('haven_stays');
    localStorage.removeItem('haven_checkouts');
    localStorage.setItem('haven_storage_v4_clean', 'true');
  }

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('haven_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [stayGuests, setStayGuests] = useState<any[]>(() => {
    const saved = localStorage.getItem('haven_stays');
    return saved ? JSON.parse(saved) : INITIAL_STAY_GUESTS;
  });

  const [checkoutGuests, setCheckoutGuests] = useState<CheckoutGuest[]>(() => {
    const saved = localStorage.getItem('haven_checkouts');
    return saved ? JSON.parse(saved) : INITIAL_CHECKOUTS;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('haven_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('haven_stays', JSON.stringify(stayGuests));
  }, [stayGuests]);

  useEffect(() => {
    localStorage.setItem('haven_checkouts', JSON.stringify(checkoutGuests));
  }, [checkoutGuests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('haven_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('haven_current_user');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleOpenAuthModal = (role: UserRole = 'customer') => {
    setAuthModalRole(role);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user.role === 'admin') {
      setView('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('haven_current_user');
    if (view === 'admin') {
      setView('discover');
    }
  };

  // Admin access gate trigger
  const handleNavigateToAdmin = () => {
    if (currentUser?.role === 'admin') {
      setView('admin');
    } else {
      handleOpenAuthModal('admin');
    }
  };

  const [autoOpenMyBookings, setAutoOpenMyBookings] = useState<boolean>(false);

  // Handler for booking submission from Customer Page
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);

    // Automatically log in or sync current customer account with the new booking details
    if (!currentUser) {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        role: 'customer',
        fullName: newBooking.guestName || 'Khách Hàng',
        email: newBooking.email || 'khachhang@havenstay.vn',
        phone: newBooking.phone || '+84 987 654 321',
        cccd: newBooking.cccd || '012345678901',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      };
      setCurrentUser(newUser);
    } else if (currentUser.role === 'customer') {
      setCurrentUser(prev => prev ? {
        ...prev,
        fullName: newBooking.guestName || prev.fullName,
        email: newBooking.email || prev.email,
        phone: newBooking.phone || prev.phone,
        cccd: newBooking.cccd || prev.cccd
      } : prev);
    }
  };

  const handleAddSampleBooking = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const sample: Booking = {
      id: `booking-${Date.now()}`,
      guestName: currentUser?.fullName || 'Nguyễn Văn A',
      cccd: currentUser?.cccd || '012345678901',
      email: currentUser?.email || 'khachhang@gmail.com',
      phone: currentUser?.phone || '+84 987 654 321',
      backpackerLevel: 'Lính mới (Newbie)',
      roomName: 'Căn Hộ Panorama View',
      roomType: 'Deluxe',
      checkInDate: today,
      checkOutDate: tomorrow,
      nights: 2,
      guestsCount: '02 Người lớn',
      basePrice: 2500000,
      serviceFee: 250000,
      totalPrice: 2750000,
      paymentMethod: 'vnpay',
      status: 'pending_payment',
      smartLockCode: '882419',
      eta: '14:00'
    };
    setBookings(prev => [sample, ...prev]);

    if (!currentUser) {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        role: 'customer',
        fullName: sample.guestName,
        email: sample.email,
        phone: sample.phone,
        cccd: sample.cccd,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      };
      setCurrentUser(newUser);
    }
  };

  // Handler for receptionist confirming booking
  const handleConfirmBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b));
  };

  // Handler for guest or admin cancelling booking
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // Handler for receptionist confirming check-in
  const handleCheckIn = (bookingId: string, updatedBooking: any) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'checked_in' as const } : b));
    
    const newStay = {
      id: `stay-${Date.now()}`,
      roomNumber: updatedBooking.roomName,
      roomType: updatedBooking.roomType,
      guestName: updatedBooking.guestName,
      services: [],
      status: 'active'
    };
    setStayGuests(prev => [newStay, ...prev]);
  };

  // Handler for adding auxiliary services on receptionist side
  const handleAddService = (guestId: string, serviceName: string, servicePrice: number) => {
    setStayGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        return {
          ...g,
          services: [...g.services, serviceName]
        };
      }
      return g;
    }));

    setCheckoutGuests(prev => prev.map(c => {
      if (c.guestName === stayGuests.find(g => g.id === guestId)?.guestName) {
        const newServicePrice = c.servicePrice + servicePrice;
        return {
          ...c,
          servicePrice: newServicePrice,
          totalPrice: c.roomPrice + newServicePrice
        };
      }
      return c;
    }));
  };

  // Handler for checking out
  const handleCheckOut = (checkoutId: string) => {
    setCheckoutGuests(prev => prev.filter(c => c.id !== checkoutId));
  };

  // Handler for early check-out
  const handleEarlyCheckOut = (bookingId: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let targetBooking = bookings.find(b => b.id === bookingId);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'checked_out' as const,
          actualCheckOutDate: today,
          earlyCheckOut: true,
          earlyCheckOutNotes: notes || 'Check-out sớm theo yêu cầu'
        };
      }
      return b;
    }));

    if (targetBooking) {
      setStayGuests(prev => prev.filter(s => s.guestName !== targetBooking.guestName && !s.roomNumber.includes(targetBooking.roomName)));

      const newCheckout: CheckoutGuest = {
        id: `checkout-early-${Date.now()}`,
        roomNumber: targetBooking.roomName,
        roomType: targetBooking.roomType,
        guestName: targetBooking.guestName,
        roomPrice: targetBooking.totalPrice,
        servicePrice: 0,
        totalPrice: targetBooking.totalPrice,
        status: 'normal',
        checkoutTime: nowTime,
        isEarlyCheckOut: true
      };

      setCheckoutGuests(prev => [newCheckout, ...prev.filter(c => c.guestName !== targetBooking.guestName)]);
    }
  };

  // Handler for deleting a stay guest
  const handleDeleteStayGuest = (stayId: string) => {
    setStayGuests(prev => prev.filter(s => s.id !== stayId));
  };

  // Handler for clearing all old guests & bookings data
  const handleClearAllData = () => {
    setBookings([]);
    setStayGuests([]);
    setCheckoutGuests([]);
    localStorage.removeItem('haven_bookings');
    localStorage.removeItem('haven_stays');
    localStorage.removeItem('haven_checkouts');
  };

  return (
    <div className="relative">
      {/* Multi-Role Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Dynamic View Container */}
      <AnimatePresence mode="wait">
        {view === 'discover' && (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DiscoverView 
              bookings={bookings}
              currentUser={currentUser}
              initialOpenMyBookings={autoOpenMyBookings}
              onOpenAuthModal={handleOpenAuthModal}
              onLogout={handleLogout}
              onCancelBooking={handleCancelBooking}
              onEarlyCheckOut={handleEarlyCheckOut}
              onSelectRoom={(room, checkIn, checkOut, nights) => {
                setAutoOpenMyBookings(false);
                handleSelectRoomWithSearchDates(room, checkIn, checkOut, nights);
              }}
              onNavigateToBooking={() => {
                setAutoOpenMyBookings(false);
                setView('booking');
              }}
              onNavigateToAdmin={handleNavigateToAdmin}
              onAddSampleBooking={handleAddSampleBooking}
            />
          </motion.div>
        )}

        {view === 'booking' && (
          <motion.div
            key="booking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BookingView 
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              initialCheckInDate={searchCheckInDate}
              initialCheckOutDate={searchCheckOutDate}
              initialNights={searchNights}
              onBookingSuccess={handleBookingSuccess}
              onNavigateToDiscover={() => {
                setAutoOpenMyBookings(true);
                setView('discover');
              }}
              onNavigateToAdmin={handleNavigateToAdmin}
            />
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isAdminLoggedIn ? (
              <AdminView 
                bookings={bookings}
                stayGuests={stayGuests}
                checkoutGuests={checkoutGuests}
                onConfirmBooking={handleConfirmBooking}
                onCheckIn={handleCheckIn}
                onAddService={handleAddService}
                onCheckOut={handleCheckOut}
                onEarlyCheckOut={handleEarlyCheckOut}
                onDeleteStayGuest={handleDeleteStayGuest}
                onClearAllData={handleClearAllData}
                onNavigateToDiscover={() => setView('discover')}
                onLogout={handleLogout}
              />
            ) : (
              /* Guard fallback if view was set to admin without admin role */
              <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003527]">Yêu Cầu Tài Khoản Lễ Tân / Admin</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Màn hình quản lý yêu cầu đăng nhập tài khoản Lễ tân/Admin.
                    {currentUser && (
                      <span className="block mt-1 text-amber-800 font-bold">
                        (Tài khoản hiện tại "{currentUser.fullName}" thuộc quyền Khách Hàng)
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => handleOpenAuthModal('admin')}
                    className="w-full bg-[#fd8a42] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#e07530] transition-colors shadow-md"
                  >
                    Đăng Nhập Tài Khoản Lễ Tân
                  </button>
                  <button
                    onClick={() => setView('discover')}
                    className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Quay lại Khám phá phòng (Guest / User)
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Quick Switch Controller Card */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-gray-200 shrink-0">
            <Layers className="w-4.5 h-4.5 text-[#9b4500]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#003527]">Role Controller</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setView('discover')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${view === 'discover' ? 'bg-[#003527] text-white' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Khám Phá (Guest/User)</span>
            </button>
            <button 
              onClick={() => setView('booking')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${view === 'booking' ? 'bg-[#003527] text-white' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Đặt Phòng & VR</span>
            </button>
            <button 
              onClick={handleNavigateToAdmin}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${view === 'admin' ? 'bg-[#fd8a42] text-white' : 'text-[#404944] hover:bg-[#e9edff]'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                Lễ tân Admin {isAdminLoggedIn ? '✓' : '🔒'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

