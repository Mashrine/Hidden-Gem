export interface Room {
  id: string;
  name: string;
  pricePerNight: number;
  rating: number;
  tags: string[];
  image: string;
  location: string;
  description: string;
  capacity?: number;
  roomType?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  cccd: string;
  email: string;
  phone: string;
  backpackerLevel: string;
  roomName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: string;
  basePrice: number;
  serviceFee: number;
  totalPrice: number;
  paymentMethod: 'vnpay' | 'stripe';
  status: 'pending' | 'pending_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  lockedUntil?: string; // Soft lock expiry timestamp (10 mins)
  smartLockCode?: string; // 6-digit electronic lock PIN
  aiItinerary?: any; // Stored AI trip itinerary JSON/object
  eta?: string;
  createdAt?: string;
}

export interface StayGuest {
  id: string;
  roomNumber: string;
  roomType: string;
  guestName: string;
  services: string[];
  status: 'active' | 'pending';
}

export interface CheckoutGuest {
  id: string;
  roomNumber: string;
  roomType: string;
  guestName: string;
  roomPrice: number;
  servicePrice: number;
  totalPrice: number;
  status: 'normal' | 'overtime';
  checkoutTime?: string;
}

export type UserRole = 'customer' | 'admin' | 'guest';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cccd: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
}

export type ViewType = 'discover' | 'booking' | 'admin';

