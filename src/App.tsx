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

  // Handler for booking submission from Customer Page
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
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
              onOpenAuthModal={handleOpenAuthModal}
              onLogout={handleLogout}
              onCancelBooking={handleCancelBooking}
              onSelectRoom={(room) => setSelectedRoom(room)}
              onNavigateToBooking={() => setView('booking')}
              onNavigateToAdmin={handleNavigateToAdmin}
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
              onBookingSuccess={handleBookingSuccess}
              onNavigateToDiscover={() => setView('discover')}
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

