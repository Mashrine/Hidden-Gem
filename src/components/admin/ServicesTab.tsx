import React, { useState } from 'react';
import { ShoppingBag, Plus, Coffee, Settings, Flame, Bike, Sparkles, Check, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  active: boolean;
  description: string;
  iconName: string;
}

export default function ServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'srv-1',
      name: 'Ăn sáng buffet cao cấp',
      category: 'Ẩm thực',
      price: 150000,
      unit: 'khách/ngày',
      active: true,
      description: 'Buffet các món Á - Âu kèm trà, cà phê và nước ép hoa quả tươi.',
      iconName: 'coffee'
    },
    {
      id: 'srv-2',
      name: 'Giặt sấy hơi nước siêu tốc',
      category: 'Tiện ích',
      price: 100000,
      unit: 'kg',
      active: true,
      description: 'Giặt sấy diệt khuẩn bằng công nghệ hơi nước cao cấp, nhận lại trong 3 tiếng.',
      iconName: 'settings'
    },
    {
      id: 'srv-3',
      name: 'Set tiệc BBQ nướng sân thượng',
      category: 'Ẩm thực',
      price: 500000,
      unit: 'set 2 người',
      active: true,
      description: 'Thịt bò Mỹ, sườn cừu, hải sản nướng kèm sốt đặc biệt và rượu vang đỏ.',
      iconName: 'flame'
    },
    {
      id: 'srv-4',
      name: 'Thuê xe máy tay ga Vespa',
      category: 'Di chuyển',
      price: 250000,
      unit: 'xe/ngày',
      active: true,
      description: 'Xe tay ga thời trang cao cấp đời mới kèm 2 mũ bảo hiểm chuẩn an toàn.',
      iconName: 'bike'
    },
    {
      id: 'srv-5',
      name: 'Sauna & Jacuzzi xông hơi đá nóng',
      category: 'Thư giãn',
      price: 350000,
      unit: 'lượt 60 phút',
      active: false,
      description: 'Phòng xông hơi đá muối Hymalaya kết hợp ngâm bồn nước nóng thủy lực.',
      iconName: 'sparkles'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Ẩm thực');
  const [newUnit, setNewUnit] = useState<string>('lượt');

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    const item: ServiceItem = {
      id: `srv-${Date.now()}`,
      name: newName,
      category: newCategory,
      price: parseInt(newPrice) || 100000,
      unit: newUnit,
      active: true,
      description: 'Dịch vụ phụ trợ tiện ích được thêm mới.',
      iconName: 'shopping'
    };
    setServices(prev => [item, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewPrice('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#003527]">Services (Quản Lý Dịch Vụ)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Danh mục các dịch vụ phụ trợ lưu trú dành cho khách hàng.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#003527] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#064e3b] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#80bea6]" />
          <span>Thêm Dịch Vụ Mới</span>
        </button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div 
            key={s.id}
            className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${s.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#f1f3ff] text-[#003527] rounded-lg">
                  {s.category}
                </span>

                <button 
                  onClick={() => toggleService(s.id)}
                  className={`text-xs font-bold flex items-center gap-1 transition-colors ${s.active ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  {s.active ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                  <span>{s.active ? 'Đang bật' : 'Tạm ngưng'}</span>
                </button>
              </div>

              <h4 className="font-extrabold text-base text-[#141b2b] mb-1">{s.name}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.description}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-[#003527]">{s.price.toLocaleString('vi-VN')}đ</span>
                <span className="text-[10px] text-gray-400 font-medium ml-1">/{s.unit}</span>
              </div>

              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[#003527]">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Service */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg text-[#003527]">Tạo dịch vụ phụ trợ</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 text-xs font-semibold text-[#404944]">
              <div>
                <label className="block mb-1 font-bold">Tên dịch vụ</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Đưa đón sân bay Liên Khương"
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#003527] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Đơn giá (VNĐ)</label>
                  <input 
                    type="number" 
                    placeholder="300000"
                    value={newPrice} 
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#003527] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Đơn vị tính</label>
                  <input 
                    type="text" 
                    placeholder="chuyến / lượt / ngày"
                    value={newUnit} 
                    onChange={e => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#003527] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold">Phân loại</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#003527] outline-none font-bold"
                >
                  <option value="Ẩm thực">Ẩm thực</option>
                  <option value="Tiện ích">Tiện ích</option>
                  <option value="Di chuyển">Di chuyển</option>
                  <option value="Thư giãn">Thư giãn</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#003527] text-white rounded-xl font-bold hover:bg-[#064e3b]"
                >
                  Lưu Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
