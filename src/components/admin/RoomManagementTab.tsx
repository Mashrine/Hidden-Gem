import React, { useState } from 'react';
import { 
  Search, Bed, MapPin, Wifi, Wind, Tv, Edit3, Eye, Wrench, 
  RotateCcw, Sparkles, CheckCircle2, User, AlertTriangle, Plus 
} from 'lucide-react';
import { INITIAL_ROOMS } from '../../data';

export default function RoomManagementTab() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample static room cards with different operational statuses as specified in Stitch mockups
  const adminRooms = [
    {
      id: 'r-302',
      number: 'Room 302',
      type: 'Deluxe King • Floor 3',
      price: 240,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      amenities: ['Wifi', 'Điều hòa AC', 'Smart TV']
    },
    {
      id: 'r-105',
      number: 'Room 105',
      type: 'Standard Queen • Floor 1',
      price: 180,
      status: 'occupied',
      guest: 'Mr. Jonathan Wick',
      checkout: 'Oct 14, 2024',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      amenities: ['Wifi', 'Máy pha Cafe']
    },
    {
      id: 'r-412',
      number: 'Room 412',
      type: 'Penthouse Suite • Floor 4',
      price: 550,
      status: 'cleaning',
      cleaningProgress: 65,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      amenities: ['Jacuzzi', 'Sauna']
    },
    {
      id: 'r-208',
      number: 'Room 208',
      type: 'Deluxe Twin • Floor 2',
      price: 220,
      status: 'maintenance',
      issue: 'Hỏng máy nén điều hòa. Đã đặt linh kiện thay thế.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      amenities: ['Ban công']
    },
    {
      id: 'r-310',
      number: 'Room 310',
      type: 'Standard King • Floor 3',
      price: 210,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      amenities: ['Wifi', 'Tủ lạnh']
    },
    {
      id: 'r-112',
      number: 'Room 112',
      type: 'Deluxe Twin • Floor 1',
      price: 280,
      status: 'occupied',
      guest: 'Ms. Alice Moore',
      checkout: 'Oct 18, 2024',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      amenities: ['Lò sưởi']
    }
  ];

  const filteredAdminRooms = adminRooms.filter(r => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.number.toLowerCase().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      const matchGuest = r.guest?.toLowerCase().includes(q) || false;
      if (!matchNum && !matchType && !matchGuest) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo số phòng, loại phòng hoặc tên khách..." 
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
            <option value="Deluxe">Deluxe</option>
            <option value="Standard">Standard</option>
            <option value="Penthouse">Penthouse</option>
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Sẵn sàng (Available)</option>
            <option value="occupied">Đang có khách (Occupied)</option>
            <option value="cleaning">Đang dọn dẹp (Cleaning)</option>
            <option value="maintenance">Bảo trì (Maintenance)</option>
          </select>

          <button className="bg-[#003527] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-[#064e3b] transition-all flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm phòng mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng Số Phòng</p>
            <h3 className="text-3xl font-black text-[#003527] mt-1">124</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#003527]/10 flex items-center justify-center text-[#003527]">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đang Có Khách</p>
            <h3 className="text-3xl font-black text-[#9b4500] mt-1">86</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fd8a42]/10 flex items-center justify-center text-[#9b4500]">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phòng Trống (Sẵn Sàng)</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">38</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdminRooms.map((room) => (
          <div 
            key={room.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image & Status Badge */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.number} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Status Badges */}
                {room.status === 'available' && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Sẵn sàng
                  </span>
                )}
                {room.status === 'occupied' && (
                  <span className="absolute top-3 right-3 bg-[#9b4500] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> Đang ở
                  </span>
                )}
                {room.status === 'cleaning' && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-spin" /> Đang dọn dẹp
                  </span>
                )}
                {room.status === 'maintenance' && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Bảo trì
                  </span>
                )}
              </div>

              {/* Room Information */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-base text-[#141b2b]">{room.number}</h4>
                    <p className="text-xs text-gray-400 font-medium">{room.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#003527]">${room.price}</span>
                    <span className="text-[10px] text-gray-400 block">/đêm</span>
                  </div>
                </div>

                {/* Status Specific Detail box */}
                {room.status === 'occupied' && (
                  <div className="bg-[#fd8a42]/10 p-2.5 rounded-xl border border-[#fd8a42]/20 text-[11px] text-[#682c00]">
                    <p className="font-bold">Khách ở: {room.guest}</p>
                    <p className="text-[10px] text-gray-500">Trả phòng: {room.checkout}</p>
                  </div>
                )}

                {room.status === 'cleaning' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#003527]">
                      <span>Tiến độ dọn phòng:</span>
                      <span>{room.cleaningProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${room.cleaningProgress}%` }} />
                    </div>
                  </div>
                )}

                {room.status === 'maintenance' && (
                  <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-[11px] text-red-700 space-y-0.5">
                    <p className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Chi tiết sự cố:</p>
                    <p className="text-[10px] text-red-600">{room.issue}</p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {room.amenities.map((a, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar Bottom */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-2 bg-[#003527] text-white rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all flex items-center justify-center gap-1">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Quản lý</span>
              </button>
              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-200 text-gray-600 transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
