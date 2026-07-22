import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Download, MoreVertical, ChevronLeft, ChevronRight, 
  TrendingUp, Award, UserPlus, FileSpreadsheet, ShieldCheck 
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cccd: string;
  totalBookings: number;
  status: 'VIP' | 'Regular' | 'New';
  initials: string;
  avatarBg: string;
}

export default function CustomersTab() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const initialCustomers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Jonathan Steele',
      email: 'j.steele@example.com',
      phone: '+1 (555) 012-3456',
      cccd: '079201004567',
      totalBookings: 24,
      status: 'VIP',
      initials: 'JS',
      avatarBg: 'bg-[#064e3b] text-[#80bea6]'
    },
    {
      id: 'cust-2',
      name: 'Alice Moore',
      email: 'alice.m@webmail.org',
      phone: '+44 20 7946 0958',
      cccd: '082194002134',
      totalBookings: 8,
      status: 'Regular',
      initials: 'AM',
      avatarBg: 'bg-[#e1e8fd] text-[#404944]'
    },
    {
      id: 'cust-3',
      name: 'Kevin Lee',
      email: 'kevin.lee@tech.io',
      phone: '+84 90 123 4567',
      cccd: '012301009876',
      totalBookings: 1,
      status: 'New',
      initials: 'KL',
      avatarBg: 'bg-[#dce2f7] text-[#404944]'
    },
    {
      id: 'cust-4',
      name: 'Elena Petrov',
      email: 'elena.p@global.com',
      phone: '+7 999 123-45-67',
      cccd: '034502005512',
      totalBookings: 15,
      status: 'VIP',
      initials: 'EP',
      avatarBg: 'bg-[#fd8a42]/20 text-[#682c00]'
    },
    {
      id: 'cust-5',
      name: 'David Brown',
      email: 'david.b@creative.net',
      phone: '+1 (555) 987-6543',
      cccd: '011293003456',
      totalBookings: 5,
      status: 'Regular',
      initials: 'DB',
      avatarBg: 'bg-[#e1e8fd] text-[#404944]'
    }
  ];

  const filteredCustomers = initialCustomers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
           c.email.toLowerCase().includes(q) ||
           c.phone.toLowerCase().includes(q) ||
           c.cccd.includes(q);
  });

  const handleExportCSV = () => {
    alert("Đã xuất danh sách 1,284 khách hàng ra tệp CSV thành công!");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#003527]">Customers (Khách Hàng)</h2>
            <span className="bg-[#e9edff] text-[#404944] px-3 py-1 rounded-full text-xs font-bold">1,284 Tổng</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý cơ sở dữ liệu khách hàng và lịch sử đặt phòng.</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#003527] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-[#141b2b] hover:bg-gray-50 shadow-sm">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-[#141b2b] hover:bg-gray-50 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Registration Date</span>
            </button>
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#fd8a42]/10 text-[#9b4500] border border-[#fd8a42]/20 rounded-xl text-xs font-bold hover:bg-[#9b4500] hover:text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#404944] text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">ID Number (CCCD)</th>
                <th className="px-6 py-4 text-center">Total Bookings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#f1f3ff]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${c.avatarBg} flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm`}>
                        {c.initials}
                      </div>
                      <div>
                        <p className="font-extrabold text-[#141b2b] text-xs">{c.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#404944]">{c.phone}</td>
                  <td className="px-6 py-4 font-semibold text-[#404944]">{c.cccd}</td>
                  <td className="px-6 py-4 text-center font-extrabold text-[#141b2b]">{c.totalBookings}</td>
                  <td className="px-6 py-4">
                    {c.status === 'VIP' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#fd8a42] text-white shadow-sm">
                        VIP
                      </span>
                    )}
                    {c.status === 'Regular' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#003527]/15 text-[#003527]">
                        Regular
                      </span>
                    )}
                    {c.status === 'New' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#003527] rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#404944]">
          <span className="font-medium">
            Showing <strong className="text-[#141b2b]">1 - 5</strong> of 1,284 customers
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-30 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#003527] text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-[#404944] font-bold text-xs hover:bg-gray-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-[#404944] font-bold text-xs hover:bg-gray-50">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-[#404944] font-bold text-xs hover:bg-gray-50">257</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-[#404944] hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Insight Cards (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003527]/10 flex items-center justify-center text-[#003527] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tỷ Lệ Tăng Trưởng (Growth Rate)</p>
            <h3 className="text-2xl font-black text-[#141b2b] mt-0.5">+12.5%</h3>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">So với tháng trước</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fd8a42]/10 flex items-center justify-center text-[#9b4500] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Khách Hàng Thân Thiết (Loyalty Ratio)</p>
            <h3 className="text-2xl font-black text-[#141b2b] mt-0.5">68%</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">VIP & Khách quay lại</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e9edff] flex items-center justify-center text-[#2c2f30] shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Khách Mới Hôm Nay (New Today)</p>
            <h3 className="text-2xl font-black text-[#141b2b] mt-0.5">14</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Lượt đăng ký mới</p>
          </div>
        </div>
      </div>
    </div>
  );
}
