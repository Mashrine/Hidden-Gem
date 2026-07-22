import React from 'react';
import { TrendingUp, BookOpen, Percent, UserPlus, MoreVertical, ChevronRight } from 'lucide-react';

export default function OverviewTab() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#003527]">Dashboard Overview</h2>
          <p className="text-xs md:text-sm text-[#404944] mt-1">Tổng quan tình hình hoạt động kinh doanh và bất động sản của bạn hôm nay.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#e9edff] px-3.5 py-2 rounded-xl border border-[#bfc9c3]/50 text-xs font-bold text-[#003527] flex items-center gap-2">
            <span>Tháng 10, 2024</span>
          </div>
          <button className="bg-white border border-gray-200 p-2 rounded-xl hover:bg-gray-50 text-[#003527] transition-all shadow-sm">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid for Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Revenue - Main Card */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#404944] uppercase tracking-wider">Tổng Doanh Thu (Total Revenue)</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#003527] mt-1">$124,592.00</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% so với tháng trước</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="px-3 py-1 bg-[#003527] text-white rounded-full text-[11px] font-bold">Tăng trưởng</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">Sản lượng</span>
            </div>
          </div>

          {/* Simulated Visual Chart */}
          <div className="h-44 w-full relative pt-4 flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,70 100,85 T200,60 T300,40 T400,20" fill="none" stroke="#064e3b" strokeWidth="3" />
              <path d="M0,80 Q50,70 100,85 T200,60 T300,40 T400,20 V100 H0 Z" fill="url(#revenueGrad)" />
              <circle cx="100" cy="85" r="4" fill="#064e3b" />
              <circle cx="200" cy="60" r="4" fill="#064e3b" />
              <circle cx="300" cy="40" r="4" fill="#064e3b" />
              <circle cx="400" cy="20" r="4" fill="#064e3b" />
            </svg>
          </div>
        </div>

        {/* Small Metric Cards Grid */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {/* Total Bookings */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#404944] uppercase tracking-wider">Lượt Đặt Phòng (Total Bookings)</p>
              <h3 className="text-2xl font-extrabold text-[#141b2b] mt-1">1,482</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">+8% đơn đặt hoạt động</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#064e3b]/10 flex items-center justify-center text-[#064e3b] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#404944] uppercase tracking-wider">Tỷ Lệ Lấp Đầy (Occupancy)</p>
              <h3 className="text-2xl font-extrabold text-[#141b2b] mt-1">94.2%</h3>
              <div className="w-28 bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#9b4500] h-full" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fd8a42]/10 flex items-center justify-center text-[#9b4500] shrink-0">
              <Percent className="w-6 h-6" />
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#404944] uppercase tracking-wider">Khách Hàng Mới (New Customers)</p>
              <h3 className="text-2xl font-extrabold text-[#141b2b] mt-1">324</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">+14% so với kỳ trước</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#e9edff] flex items-center justify-center text-[#003527] shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Property & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue by Property List */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-sm text-[#003527]">Doanh Thu Theo Bất Động Sản</h4>
            <span className="text-xs text-gray-400 font-medium">3 căn dẫn đầu</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80" 
                alt="Alpine Retreat" 
                className="w-12 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#141b2b]">Alpine Retreat Cabin</span>
                  <span className="text-[#003527]">$42,000</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#003527] h-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80" 
                alt="Azure Horizon Villa" 
                className="w-12 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#141b2b]">Azure Horizon Villa</span>
                  <span className="text-[#003527]">$35,000</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#003527] h-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=300&q=80" 
                alt="Urban Loft Central" 
                className="w-12 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#141b2b]">Urban Loft Central</span>
                  <span className="text-[#003527]">$23,000</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#003527] h-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-[#404944] hover:bg-gray-50 transition-all">
            Xem tất cả căn hộ
          </button>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-sm text-[#003527]">Hoạt Động Gần Đây (Recent Activity)</h4>
            <div className="flex gap-1.5 text-[10px] font-bold">
              <span className="px-2.5 py-1 bg-[#b0f0d6]/30 text-[#0b513d] rounded-full">Check-in</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">Check-out</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[#404944] uppercase text-[10px] font-bold">
                  <th className="py-2 px-3">Khách hàng</th>
                  <th className="py-2 px-3">Bất động sản</th>
                  <th className="py-2 px-3">Trạng thái</th>
                  <th className="py-2 px-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-[#141b2b]">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold">Marcus Sterling</div>
                    <div className="text-[10px] text-gray-400">Khách VVIP</div>
                  </td>
                  <td className="py-3 px-3">Alpine Retreat Cabin</td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Checked In</span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">Hôm nay, 10:45 AM</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold">Elena Laurent</div>
                    <div className="text-[10px] text-gray-400">Khách quen</div>
                  </td>
                  <td className="py-3 px-3">Azure Horizon Villa</td>
                  <td className="py-3 px-3">
                    <span className="bg-amber-50 text-[#9b4500] px-2 py-0.5 rounded text-[10px] font-bold">Chờ duyệt</span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">Hôm nay, 02:15 PM</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold">David Wu</div>
                    <div className="text-[10px] text-gray-400">Khách mới</div>
                  </td>
                  <td className="py-3 px-3">Urban Loft Central</td>
                  <td className="py-3 px-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">Checked Out</span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">Hôm qua, 11:00 AM</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="w-full py-2 text-xs font-bold text-[#003527] hover:underline flex items-center justify-center gap-1 pt-2">
            <span>Xem lịch sử đầy đủ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
