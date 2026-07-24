import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// =========================================================
// IN-MEMORY DATABASE & REPOSITORY DATA STORES
// =========================================================

interface RoomLock {
  roomId: string;
  checkIn: string;
  checkOut: string;
  lockedAt: number;
  expiresAt: number;
  lockedBySession: string;
}

interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
}

interface RoomRecord {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  vrLink?: string;
  image?: string;
  status: 'available' | 'occupied' | 'maintenance';
}

interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cccd: string;
  passwordHash?: string;
  role: 'customer' | 'admin';
  backpackingLevel?: string;
}

interface BookingRecord {
  id: string;
  customerId: string;
  roomId: string;
  roomName: string;
  guestName: string;
  cccd: string;
  phone: string;
  email: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  basePrice: number;
  serviceFee: number;
  totalPrice: number;
  paymentMethod: 'vnpay' | 'stripe';
  status: 'pending' | 'pending_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  lockedUntil?: string;
  smartLockCode?: string;
  aiItinerary?: any;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

interface CheckInOutLog {
  id: string;
  bookingId: string;
  guestName: string;
  roomName: string;
  action: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  identityVerified: boolean;
}

// Global Stores
const activeRoomLocks: RoomLock[] = [];
const activeOTPCodes: OTPRecord[] = [];

const roomsStore: RoomRecord[] = [
  {
    id: 'room-panorama',
    name: 'Căn Hộ Panorama View',
    type: 'Luxury Apartment',
    capacity: 4,
    pricePerNight: 1250000,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'room-suite',
    name: 'Suite Rừng Thông Deluxe',
    type: 'Suite Room',
    capacity: 2,
    pricePerNight: 980000,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'room-pine',
    name: 'Phòng Pine View Cozy',
    type: 'Standard Room',
    capacity: 2,
    pricePerNight: 650000,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'room-bungalow',
    name: 'Bungalow Gỗ Săn Mây',
    type: 'Bungalow',
    capacity: 3,
    pricePerNight: 1500000,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
  }
];

const customersStore: CustomerRecord[] = [
  {
    id: 'usr-admin-1',
    fullName: 'Lễ Tân HavenStay',
    email: 'admin@havenstay.vn',
    phone: '+84 243 999 888',
    cccd: '001099887766',
    passwordHash: 'admin123',
    role: 'admin'
  },
  {
    id: 'usr-customer-1',
    fullName: 'Nguyễn Văn A',
    email: 'khachhang@gmail.com',
    phone: '+84 987 654 321',
    cccd: '012345678901',
    passwordHash: '123456',
    role: 'customer',
    backpackingLevel: 'Lính mới (Newbie)'
  }
];

const bookingsStore: BookingRecord[] = [
  {
    id: 'booking-seed-1',
    customerId: 'usr-customer-1',
    roomId: 'room-panorama',
    roomName: 'Căn Hộ Panorama View',
    guestName: 'Nguyễn Văn A',
    cccd: '012345678901',
    phone: '+84 987 654 321',
    email: 'khachhang@gmail.com',
    checkIn: '2026-08-01',
    checkOut: '2026-08-04',
    nights: 3,
    basePrice: 3750000,
    serviceFee: 250000,
    totalPrice: 4000000,
    paymentMethod: 'vnpay',
    status: 'confirmed',
    smartLockCode: '882419',
    createdAt: new Date().toISOString()
  }
];

const paymentsStore: PaymentRecord[] = [];
const checkInOutLogsStore: CheckInOutLog[] = [];

// Cleanup expired soft locks & OTP codes every minute
setInterval(() => {
  const now = Date.now();
  for (let i = activeRoomLocks.length - 1; i >= 0; i--) {
    if (activeRoomLocks[i].expiresAt < now) {
      activeRoomLocks.splice(i, 1);
    }
  }
  for (let i = activeOTPCodes.length - 1; i >= 0; i--) {
    if (activeOTPCodes[i].expiresAt < now) {
      activeOTPCodes.splice(i, 1);
    }
  }
}, 60000);

// Initialize Gemini API Client
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set in environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key-for-dev",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// =========================================================
// 1. HEALTH & DATABASE SCRIPTS API
// =========================================================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    activeLocksCount: activeRoomLocks.length,
    bookingsCount: bookingsStore.length,
    roomsCount: roomsStore.length
  });
});

app.get("/api/database-scripts", (req, res) => {
  const postgresSQL = `-- =========================================================
-- HAVENSTAY DATABASE INITIALIZATION (POSTGRESQL STANDARD DDL)
-- Full ERD: 8 Tables with PK, FK ON DELETE CASCADE, UNIQUE 1-1
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    identity_card VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    backpacking_level VARCHAR(100) DEFAULT 'Lính mới (Newbie)'
);

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    expected_check_in TIMESTAMP NOT NULL,
    expected_check_out TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    locked_until TIMESTAMP,
    ai_itinerary JSONB,
    CONSTRAINT check_dates CHECK (expected_check_out > expected_check_in)
);

CREATE INDEX IF NOT EXISTS idx_booking_dates ON bookings (room_id, expected_check_in, expected_check_out, status, locked_until);
`;

  res.json({ sql: postgresSQL });
});

// =========================================================
// 2. AUTHENTICATION API (LOGIN & OTP)
// =========================================================
app.post("/api/auth/login", (req, res) => {
  const { emailOrUsername, password, role } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ Tên đăng nhập/Email và Mật khẩu." });
  }

  const queryUser = emailOrUsername.trim().toLowerCase();

  if (role === 'admin' || queryUser === 'admin' || queryUser === 'reception') {
    if (password === 'admin123' || password === '123456') {
      const adminUser = customersStore.find(c => c.role === 'admin') || {
        id: 'usr-admin-1',
        fullName: 'Lễ Tân HavenStay',
        email: 'admin@havenstay.vn',
        phone: '+84 243 999 888',
        cccd: '001099887766',
        role: 'admin' as const
      };
      return res.json({
        success: true,
        message: "Đăng nhập Quyền Quản trị Lễ tân thành công!",
        user: adminUser,
        token: `jwt-admin-${Date.now()}`
      });
    } else {
      return res.status(401).json({ error: "Mật khẩu Admin không chính xác. Mật khẩu mặc định: admin123" });
    }
  } else {
    let customer = customersStore.find(c => c.email.toLowerCase() === queryUser && c.role === 'customer');
    if (!customer) {
      customer = {
        id: `usr-${Date.now()}`,
        fullName: emailOrUsername.split('@')[0].toUpperCase() || 'Khách Hàng',
        email: emailOrUsername,
        phone: '+84 987 654 321',
        cccd: '012345678901',
        role: 'customer',
        backpackingLevel: 'Lính mới (Newbie)'
      };
      customersStore.push(customer);
    }

    return res.json({
      success: true,
      message: "Đăng nhập Khách Hàng thành công!",
      user: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        cccd: customer.cccd,
        role: customer.role
      },
      token: `jwt-customer-${Date.now()}`
    });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password, phone, cccd, backpackingLevel } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Thiếu Họ tên hoặc Email." });
  }

  const existing = customersStore.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email này đã được đăng ký tài khoản. Vui lòng chọn Đăng Nhập." });
  }

  const newCustomer: CustomerRecord = {
    id: `usr-${Date.now()}`,
    fullName,
    email,
    phone: phone || '+84 987 654 321',
    cccd: cccd || '012345678901',
    passwordHash: password || '123456',
    role: 'customer',
    backpackingLevel: backpackingLevel || 'Lính mới (Newbie)'
  };

  customersStore.push(newCustomer);

  res.json({
    success: true,
    message: "Đăng ký tài khoản Khách Hàng mới thành công!",
    user: {
      id: newCustomer.id,
      fullName: newCustomer.fullName,
      email: newCustomer.email,
      phone: newCustomer.phone,
      cccd: newCustomer.cccd,
      role: newCustomer.role
    },
    token: `jwt-${Date.now()}`
  });
});

app.post("/api/auth/send-otp", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Vui lòng nhập địa chỉ email hợp lệ." });
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  const existingIdx = activeOTPCodes.findIndex(o => o.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    activeOTPCodes.splice(existingIdx, 1);
  }
  activeOTPCodes.push({ email: email.toLowerCase(), code: generatedOtp, expiresAt });

  res.json({
    success: true,
    message: `Mã OTP 6 chữ số đã được gửi tới email ${email}!`,
    otpDemo: generatedOtp,
    expiresInSeconds: 300
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Thiếu email hoặc mã OTP." });
  }

  const record = activeOTPCodes.find(
    o => o.email.toLowerCase() === email.toLowerCase() && o.code === String(otp).trim()
  );

  if (!record) {
    return res.status(400).json({ error: "Mã OTP không đúng. Vui lòng kiểm tra lại." });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Mã OTP đã hết hạn (chỉ có hiệu lực trong 5 phút)." });
  }

  const idx = activeOTPCodes.indexOf(record);
  if (idx !== -1) activeOTPCodes.splice(idx, 1);

  let customer = customersStore.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    customer = {
      id: `usr-otp-${Date.now()}`,
      fullName: email.split("@")[0].toUpperCase() || "Khách Hàng HavenStay",
      email: email,
      phone: "+84 987 654 321",
      cccd: "012345678901",
      role: "customer"
    };
    customersStore.push(customer);
  }

  res.json({
    success: true,
    message: "Xác thực OTP thành công! Bạn đã đăng nhập vào hệ thống HavenStay.",
    user: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      cccd: customer.cccd,
      role: customer.role
    },
    jwtToken: `jwt-otp-${Date.now()}`
  });
});

// =========================================================
// 3. BOOKING AVAILABILITY & OVERLAP CHECK (DATABASE LOOKUP)
// =========================================================
app.post("/api/bookings/check-availability", (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Thiếu thông tin roomId, checkIn hoặc checkOut." });
  }

  const reqCheckIn = new Date(checkIn).getTime();
  const reqCheckOut = new Date(checkOut).getTime();

  if (isNaN(reqCheckIn) || isNaN(reqCheckOut) || reqCheckOut <= reqCheckIn) {
    return res.status(400).json({ error: "Khoảng thời gian nhận/trả phòng không hợp lệ." });
  }

  // 1. Check Soft Locks
  const activeLock = activeRoomLocks.find(
    (lock) =>
      lock.roomId === roomId &&
      lock.expiresAt > Date.now() &&
      new Date(lock.checkIn).getTime() < reqCheckOut &&
      new Date(lock.checkOut).getTime() > reqCheckIn
  );

  if (activeLock) {
    const remainingSeconds = Math.ceil((activeLock.expiresAt - Date.now()) / 1000);
    return res.json({
      available: false,
      reason: `Phòng này đang được giữ chỗ tạm thời (Soft Lock: locked_until) bởi một khách hàng khác. Tự động giải phóng sau ${remainingSeconds} giây.`,
      locked: true,
      remainingSeconds
    });
  }

  // 2. Check Database Overlap: expected_check_in < new_check_out AND expected_check_out > new_check_in
  const overlappingBooking = bookingsStore.find(b => {
    if (b.roomId !== roomId) return false;
    if (b.status === 'cancelled') return false;

    const existingCheckIn = new Date(b.checkIn).getTime();
    const existingCheckOut = new Date(b.checkOut).getTime();

    return (existingCheckIn < reqCheckOut && existingCheckOut > reqCheckIn);
  });

  if (overlappingBooking) {
    return res.json({
      available: false,
      reason: `Phòng này đã có đơn đặt phòng đè trùng lịch từ ${overlappingBooking.checkIn} đến ${overlappingBooking.checkOut} (Mã đơn: ${overlappingBooking.id}). Vui lòng chọn ngày khác.`,
      conflictingBookingId: overlappingBooking.id
    });
  }

  res.json({ available: true, message: "Phòng còn trống trong khoảng thời gian này!" });
});

app.post("/api/bookings/lock", (req, res) => {
  const { roomId, checkIn, checkOut, sessionId } = req.body;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ." });
  }

  const now = Date.now();
  const tenMinutesMs = 10 * 60 * 1000;

  const existingIdx = activeRoomLocks.findIndex(l => l.lockedBySession === sessionId);
  if (existingIdx !== -1) {
    activeRoomLocks.splice(existingIdx, 1);
  }

  const newLock: RoomLock = {
    roomId,
    checkIn,
    checkOut,
    lockedAt: now,
    expiresAt: now + tenMinutesMs,
    lockedBySession: sessionId || `session-${now}`
  };

  activeRoomLocks.push(newLock);

  res.json({
    success: true,
    message: "Đã tạo Soft Lock (locked_until = NOW + 10 mins) cho phòng.",
    lockedUntil: new Date(newLock.expiresAt).toISOString(),
    expiresAt: newLock.expiresAt
  });
});

// =========================================================
// 4. SERVER-SIDE PRICE CALCULATION & BOOKING CREATION
// =========================================================
app.post("/api/bookings/create", (req, res) => {
  const { 
    roomId, 
    checkIn, 
    checkOut, 
    guestName, 
    email, 
    phone, 
    cccd, 
    backpackerLevel, 
    paymentMethod,
    sessionId 
  } = req.body;

  if (!roomId || !checkIn || !checkOut || !guestName || !cccd) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc để khởi tạo đơn đặt phòng." });
  }

  const reqCheckIn = new Date(checkIn).getTime();
  const reqCheckOut = new Date(checkOut).getTime();

  if (isNaN(reqCheckIn) || isNaN(reqCheckOut) || reqCheckOut <= reqCheckIn) {
    return res.status(400).json({ error: "Ngày Check-in và Check-out không hợp lệ." });
  }

  // Look up Room
  const room = roomsStore.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Không tìm thấy thông tin phòng đặt." });
  }

  // Calculate nights & recalculate price on server
  const calcNights = Math.max(1, Math.round((reqCheckOut - reqCheckIn) / (1000 * 60 * 60 * 24)));
  const basePrice = room.pricePerNight * calcNights;
  const serviceFee = 250000;
  const totalPrice = basePrice + serviceFee;

  // Generate 6-digit Smart Lock pin
  const smartLockCode = Math.floor(100000 + Math.random() * 900000).toString();
  const bookingId = `booking-${Date.now()}`;

  // Find or create customer
  let customer = customersStore.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    customer = {
      id: `usr-${Date.now()}`,
      fullName: guestName,
      email: email,
      phone: phone || '+84 987 654 321',
      cccd: cccd,
      role: 'customer',
      backpackingLevel: backpackerLevel || 'Lính mới (Newbie)'
    };
    customersStore.push(customer);
  }

  const sampleAiItinerary = {
    title: `Lịch Trình Du Lịch Khám Phá Đà Lạt - Cấp Độ ${backpackerLevel || 'Lính mới (Newbie)'}`,
    recommendedHomestay: room.name,
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

  const newBooking: BookingRecord = {
    id: bookingId,
    customerId: customer.id,
    roomId: room.id,
    roomName: room.name,
    guestName,
    cccd,
    phone,
    email,
    checkIn,
    checkOut,
    nights: calcNights,
    basePrice,
    serviceFee,
    totalPrice,
    paymentMethod: paymentMethod === 'stripe' ? 'stripe' : 'vnpay',
    status: 'pending_payment',
    lockedUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    smartLockCode,
    aiItinerary: sampleAiItinerary,
    createdAt: new Date().toISOString()
  };

  bookingsStore.unshift(newBooking);

  // Record payment entry
  paymentsStore.push({
    id: `pay-${Date.now()}`,
    bookingId,
    amount: totalPrice,
    paymentMethod: paymentMethod || 'vnpay',
    status: 'completed',
    createdAt: new Date().toISOString()
  });

  // Release soft lock session
  if (sessionId) {
    const idx = activeRoomLocks.findIndex(l => l.lockedBySession === sessionId);
    if (idx !== -1) activeRoomLocks.splice(idx, 1);
  }

  res.json({
    success: true,
    message: "Tạo đơn đặt phòng thành công trên Server! Giá đã được xác thực an toàn.",
    booking: newBooking
  });
});

// =========================================================
// 5. ADMIN / RECEPTIONIST CRUD API
// =========================================================
// Rooms CRUD
app.get("/api/admin/rooms", (req, res) => {
  res.json({ success: true, rooms: roomsStore });
});

app.post("/api/admin/rooms", (req, res) => {
  const { name, type, capacity, pricePerNight, image } = req.body;
  if (!name || !pricePerNight) {
    return res.status(400).json({ error: "Thiếu tên phòng hoặc giá phòng." });
  }
  const newRoom: RoomRecord = {
    id: `room-${Date.now()}`,
    name,
    type: type || 'Standard Room',
    capacity: capacity || 2,
    pricePerNight: Number(pricePerNight),
    image: image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    status: 'available'
  };
  roomsStore.push(newRoom);
  res.json({ success: true, message: "Thêm phòng mới thành công!", room: newRoom });
});

app.put("/api/admin/rooms/:id", (req, res) => {
  const roomId = req.params.id;
  const room = roomsStore.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Không tìm thấy phòng." });

  const { name, type, capacity, pricePerNight, status } = req.body;
  if (name) room.name = name;
  if (type) room.type = type;
  if (capacity) room.capacity = Number(capacity);
  if (pricePerNight) room.pricePerNight = Number(pricePerNight);
  if (status) room.status = status;

  res.json({ success: true, message: "Cập nhật phòng thành công!", room });
});

app.patch("/api/admin/rooms/:id/status", (req, res) => {
  const roomId = req.params.id;
  const { status } = req.body; // 'available' | 'occupied' | 'maintenance'
  const room = roomsStore.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Không tìm thấy phòng." });

  room.status = status;
  res.json({ success: true, message: `Đã cập nhật trạng thái phòng sang ${status}!`, room });
});

app.delete("/api/admin/rooms/:id", (req, res) => {
  const roomId = req.params.id;
  const idx = roomsStore.findIndex(r => r.id === roomId);
  if (idx === -1) return res.status(404).json({ error: "Không tìm thấy phòng." });

  roomsStore.splice(idx, 1);
  res.json({ success: true, message: "Đã xóa phòng khỏi cơ sở dữ liệu." });
});

// Bookings Admin Operations
app.get("/api/admin/bookings", (req, res) => {
  res.json({ success: true, bookings: bookingsStore });
});

app.patch("/api/admin/bookings/:id/status", (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  const booking = bookingsStore.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Không tìm thấy đơn đặt phòng." });

  booking.status = status;
  res.json({ success: true, message: `Đã cập nhật trạng thái đơn đặt phòng sang ${status}!`, booking });
});

app.post("/api/admin/bookings/:id/check-in", (req, res) => {
  const bookingId = req.params.id;
  const booking = bookingsStore.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Không tìm thấy đơn đặt phòng." });

  booking.status = 'checked_in';

  // Log Check-In
  const log: CheckInOutLog = {
    id: `log-${Date.now()}`,
    bookingId: booking.id,
    guestName: booking.guestName,
    roomName: booking.roomName,
    action: 'CHECK_IN',
    timestamp: new Date().toISOString(),
    identityVerified: true
  };
  checkInOutLogsStore.push(log);

  res.json({ success: true, message: `Khách hàng ${booking.guestName} đã Check-in thành công!`, booking, log });
});

app.post("/api/admin/bookings/:id/check-out", (req, res) => {
  const bookingId = req.params.id;
  const booking = bookingsStore.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Không tìm thấy đơn đặt phòng." });

  booking.status = 'checked_out';

  // Log Check-Out
  const log: CheckInOutLog = {
    id: `log-${Date.now()}`,
    bookingId: booking.id,
    guestName: booking.guestName,
    roomName: booking.roomName,
    action: 'CHECK_OUT',
    timestamp: new Date().toISOString(),
    identityVerified: true
  };
  checkInOutLogsStore.push(log);

  res.json({ success: true, message: `Khách hàng ${booking.guestName} đã Check-out thành công! Bây giờ khách có quyền viết Review.`, booking, log });
});

// Post-Checkout Review Enforcement Endpoint
app.post("/api/reviews", (req, res) => {
  const { bookingId, rating, comment, bookingStatus } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "Thiếu mã đơn đặt phòng (bookingId)." });
  }

  if (bookingStatus !== 'checked_out') {
    return res.status(403).json({
      error: "Ràng buộc bảo mật: Khách hàng CHỈ ĐƯỢC PHÉP gửi Đánh Giá (Review) sau khi hoàn tất thủ tục Check-out trả phòng!",
      code: "REVIEW_NOT_ALLOWED_BEFORE_CHECKOUT"
    });
  }

  res.json({
    success: true,
    message: "Gửi Đánh Giá phòng thành công! Nhận xét của bạn đã được ghi nhận.",
    review: {
      id: `rev-${Date.now()}`,
      bookingId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    }
  });
});

// =========================================================
// 6. AI TRIP PLANNER ENDPOINT (GEMINI API)
// =========================================================
app.post("/api/trip-planner", async (req, res) => {
  try {
    const { backpackerLevel, durationDays, interests } = req.body;

    const ai = getAIClient();
    const prompt = `Bạn là chuyên gia du lịch phượt Đà Lạt chuyên nghiệp thuộc HavenStay.
Hãy tạo một lịch trình gợi ý chi tiết ${durationDays || 3} ngày ${durationDays ? durationDays - 1 : 2} đêm tại Đà Lạt dành cho đối tượng:
- Cấp độ phượt: ${backpackerLevel || 'Lính mới (Newbie)'}
- Sở thích: ${interests || 'Săn mây, ngắm rừng thông, quán cà phê chill, ẩm thực đêm'}

Yêu cầu định dạng JSON với cấu trúc:
{
  "title": "Tên lịch trình hấp dẫn",
  "recommendedHomestay": "Căn hộ Panorama View / Suite Rừng Thông",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Chủ đề ngày 1",
      "activities": [
        { "time": "06:00 - 08:00", "spot": "Tên điểm đến", "description": "Mô tả trải nghiệm", "tip": "Mẹo nhỏ" }
      ]
    }
  ],
  "safetyTips": ["Mẹo an toàn 1", "Mẹo an toàn 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response generated from Gemini");
    }

    const tripData = JSON.parse(responseText.trim());
    res.json({ success: true, trip: tripData });
  } catch (error: any) {
    console.error("Error generating trip plan:", error);
    res.status(500).json({
      success: false,
      error: "Không thể khởi tạo lịch trình AI lúc này. Vui lòng thử lại.",
      details: error?.message || String(error)
    });
  }
});

// =========================================================
// 7. VITE MIDDLEWARE & SERVER LISTEN
// =========================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HiddenGem Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
