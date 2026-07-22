import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory soft locks for room reservation (10 minute auto-expire soft lock)
interface RoomLock {
  roomId: string;
  checkIn: string;
  checkOut: string;
  lockedAt: number; // timestamp
  expiresAt: number; // timestamp
  lockedBySession: string;
}

const activeRoomLocks: RoomLock[] = [];

// In-memory OTP code store for guest login
interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
}
const activeOTPCodes: OTPRecord[] = [];

// Clean up expired soft locks & OTP codes every 1 minute (Simulating node-cron background cleanup)
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

// Initialize Google GenAI
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

// ----------------------------------------------------
// 1. Health & Database SQL / DBML Schema Export API
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/database-scripts", (req, res) => {
  const postgresSQL = `-- =========================================================
-- HAVENSTAY DATABASE INITIALIZATION (POSTGRESQL STANDARD DDL)
-- Full ERD: 8 Tables with PK, FK ON DELETE CASCADE, UNIQUE 1-1
-- Optimized: Soft Lock, OTP Auth, Stored AI Itinerary & Review Guards
-- =========================================================

-- 1. Customers Table (Supports Guest Checkout with OTP Login)
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

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    price DECIMAL(12, 2) NOT NULL,
    vr_link TEXT,
    status VARCHAR(20) DEFAULT 'available'
);

-- 3. Bookings Table (Soft Lock with locked_until + Stored ai_itinerary)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    expected_check_in TIMESTAMP NOT NULL,
    expected_check_out TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT', -- 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'
    locked_until TIMESTAMP, -- Soft Lock (10 phút giữ chỗ tạm thời)
    ai_itinerary JSONB, -- Lịch trình AI Trip Planner lưu vĩnh viễn
    CONSTRAINT check_dates CHECK (expected_check_out > expected_check_in)
);

-- Index for high-speed date collision & soft-lock queries
CREATE INDEX IF NOT EXISTS idx_booking_dates ON bookings (room_id, expected_check_in, expected_check_out, status, locked_until);

-- 4. Payments Table (1-1 with Bookings via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'vnpay', 'stripe', 'cash'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'completed',
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gateway VARCHAR(50)
);

-- 5. CheckInOut_Logs Table (1-1 with Bookings via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS checkinout_logs (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    actual_check_in_time TIMESTAMP,
    actual_check_out_time TIMESTAMP,
    identity_verified BOOLEAN DEFAULT FALSE,
    deposit_held DECIMAL(12, 2) DEFAULT 0,
    log_status VARCHAR(30) DEFAULT 'active' -- 'active', 'CHECKED_OUT'
);

-- 6. Reviews Table (1-1 with Bookings via UNIQUE constraint, ENFORCED POST-CHECKOUT)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Services Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT
);

-- 8. Travel_Maps Table (Attractions & Homestays Pin locations)
CREATE TABLE IF NOT EXISTS travel_maps (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    difficulty_level VARCHAR(50),
    description TEXT
);
`;

  const dbmlCode = `// HavenStay ERD Diagram DBML Schema
// Paste this directly into dbdiagram.io

Table customers {
  id string [pk]
  full_name string
  email string [unique]
  phone string
  identity_card string
  otp_code string
  otp_expires_at datetime
  backpacking_level string
}

Table rooms {
  id string [pk]
  name string
  type string
  capacity int
  price decimal
  vr_link string
  status string
}

Table bookings {
  id string [pk]
  customer_id string [ref: > customers.id]
  room_id string [ref: > rooms.id]
  expected_check_in datetime
  expected_check_out datetime
  status string
  locked_until datetime
  ai_itinerary jsonb
}

Table payments {
  id string [pk]
  booking_id string [unique, ref: - bookings.id]
  amount decimal
  payment_method string
  payment_status string
  transaction_time datetime
  gateway string
}

Table checkinout_logs {
  id string [pk]
  booking_id string [unique, ref: - bookings.id]
  actual_check_in_time datetime
  actual_check_out_time datetime
  identity_verified boolean
  deposit_held decimal
  log_status string
}

Table reviews {
  id string [pk]
  booking_id string [unique, ref: - bookings.id]
  rating int
  comment string
  created_at datetime
}

Table services {
  id string [pk]
  name string
  price decimal
  description string
}

Table travel_maps {
  id string [pk]
  title string
  lat decimal
  lng decimal
  difficulty_level string
  description string
}
`;

  res.json({ sql: postgresSQL, dbml: dbmlCode });
});

// ----------------------------------------------------
// 2. OTP Authentication Endpoints (Guest Login without password)
// ----------------------------------------------------
app.post("/api/auth/send-otp", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Vui lòng nhập địa chỉ email hợp lệ." });
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

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

  // Clear used OTP
  const idx = activeOTPCodes.indexOf(record);
  if (idx !== -1) activeOTPCodes.splice(idx, 1);

  res.json({
    success: true,
    message: "Xác thực OTP thành công! Bạn đã đăng nhập vào hệ thống HavenStay.",
    user: {
      id: `usr-otp-${Date.now()}`,
      fullName: email.split("@")[0].toUpperCase() || "Khách Hàng HavenStay",
      email: email,
      phone: "+84 987 654 321",
      cccd: "012345678901",
      role: "customer"
    },
    jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.otp-${Date.now()}`
  });
});

// ----------------------------------------------------
// 3. Booking Soft Lock & Availability API
// ----------------------------------------------------
app.post("/api/bookings/check-availability", (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Thiếu thông tin roomId, checkIn hoặc checkOut." });
  }

  const reqCheckIn = new Date(checkIn).getTime();
  const reqCheckOut = new Date(checkOut).getTime();

  // Check Soft Lock status
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

  res.json({ available: true, message: "Phòng còn trống trong khoảng thời gian này!" });
});

// API Lock Room (Soft Lock with locked_until timestamp)
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
    message: "Đã tạo Soft Lock (locked_until = NOW + 10 mins). Tránh treo kết nối Database Connection Pool.",
    lockedUntil: new Date(newLock.expiresAt).toISOString(),
    expiresAt: newLock.expiresAt
  });
});

// ----------------------------------------------------
// 4. Enforce Post-Checkout Review Endpoint
// ----------------------------------------------------
app.post("/api/reviews", (req, res) => {
  const { bookingId, rating, comment, bookingStatus } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "Thiếu mã đơn đặt phòng (bookingId)." });
  }

  // Strict constraint check
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

// ----------------------------------------------------
// 3. AI Trip Planner Endpoint (Gemini API)
// ----------------------------------------------------
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

// ----------------------------------------------------
// 4. Vite Middleware & Server Listen
// ----------------------------------------------------
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
    console.log(`[HavenStay Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
