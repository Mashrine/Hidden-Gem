import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Compass, X, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom?: () => void;
}

export default function AITripPlannerModal({ isOpen, onClose, onSelectRoom }: AITripPlannerModalProps) {
  const [backpackerLevel, setBackpackerLevel] = useState('Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng');
  const [durationDays, setDurationDays] = useState(3);
  const [interests, setInterests] = useState('Săn mây, ngắm rừng thông, quán cà phê chill, chợ đêm');
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backpackerLevel, durationDays, interests })
      });
      const data = await response.json();
      if (data.success) {
        setTripPlan(data.trip);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tạo lịch trình AI.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ AI. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#003527] text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#80bea6]/20 flex items-center justify-center text-[#80bea6]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                Trợ Lý AI Lên Lịch Trình Phượt Đà Lạt
                <span className="bg-[#9b4500] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Gemini AI</span>
              </h3>
              <p className="text-xs text-[#80bea6]">Thiết kế chuyến đi cá nhân hóa theo cấp độ & sở thích của bạn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#f9f9ff]">
          {!tripPlan ? (
            <div className="space-y-5">
              {/* Cấp độ phượt */}
              <div>
                <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-2">
                  1. Cấp độ phượt & Trải nghiệm
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng',
                    'Tay phượt lão luyện (Pro) - Sẵn sàng cho mọi địa hình',
                    'Săn mây & Nhiếp ảnh gia - Yêu bình minh đồi cao',
                    'Gia đình & Nhóm bạn - Cần sự an toàn & tiện nghi'
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setBackpackerLevel(lvl)}
                      className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                        backpackerLevel === lvl
                          ? 'border-[#003527] bg-[#e9edff] text-[#003527] font-bold shadow-sm'
                          : 'border-gray-200 bg-white text-[#404944] hover:border-gray-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Số ngày đi */}
              <div>
                <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-2">
                  2. Thời gian chuyến đi
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        durationDays === d
                          ? 'bg-[#003527] text-white border-[#003527]'
                          : 'bg-white text-[#404944] border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {d} Ngày {d > 1 ? `${d - 1} Đêm` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sở thích */}
              <div>
                <label className="block text-xs font-bold text-[#003527] uppercase tracking-wider mb-2">
                  3. Ghi chú sở thích cá nhân
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Ví dụ: Săn mây đồi Cầu Đất, cà phê ngắm rừng thông, đồ nướng đêm..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#141b2b] focus:ring-2 focus:ring-[#003527] focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="w-full bg-[#003527] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#064e3b] transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#80bea6]" />
                    <span>Gemini AI đang tổng hợp dữ liệu & thiết kế lịch trình...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#80bea6]" />
                    <span>Tạo Lịch Trình AI Ngay</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trip Header Banner */}
              <div className="bg-[#003527] text-white p-5 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="bg-[#80bea6]/20 text-[#80bea6] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    Gợi ý từ Hidden Gem AI Planner
                  </span>
                  <h4 className="text-xl font-extrabold text-white mb-1">{tripPlan.title}</h4>
                  <p className="text-xs text-[#80bea6] flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    Khuyên chọn Homestay: <strong className="text-white">{tripPlan.recommendedHomestay}</strong>
                  </p>
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              <div className="space-y-4">
                {tripPlan.days?.map((day: any) => (
                  <div key={day.dayNumber} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                    <h5 className="font-bold text-sm text-[#003527] mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="w-6 h-6 rounded-full bg-[#9b4500] text-white text-xs flex items-center justify-center font-extrabold">
                        {day.dayNumber}
                      </span>
                      Ngày {day.dayNumber}: {day.theme}
                    </h5>

                    <div className="space-y-3">
                      {day.activities?.map((act: any, idx: number) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <span className="font-bold text-[#9b4500] whitespace-nowrap w-24 shrink-0 bg-[#ffdbca]/30 px-2 py-1 rounded-md h-fit text-center">
                            {act.time}
                          </span>
                          <div className="flex-1">
                            <h6 className="font-bold text-[#141b2b]">{act.spot}</h6>
                            <p className="text-gray-600 mt-0.5">{act.description}</p>
                            {act.tip && (
                              <span className="inline-block mt-1 text-[11px] text-[#003527] bg-[#e9edff] px-2 py-0.5 rounded font-medium">
                                💡 Mẹo: {act.tip}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Tips */}
              {tripPlan.safetyTips && (
                <div className="bg-[#ffdbca]/30 p-4 rounded-xl border border-[#ffdbca] text-xs">
                  <h6 className="font-bold text-[#9b4500] mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Lưu Ý An Toàn Cho Chuyến Đi:
                  </h6>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {tripPlan.safetyTips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setTripPlan(null)}
                  className="flex-1 border border-gray-200 bg-white py-3 rounded-xl font-bold text-xs text-[#404944] hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Tạo Lại Lịch Trình
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectRoom) onSelectRoom();
                  }}
                  className="flex-1 bg-[#003527] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#064e3b] flex items-center justify-center gap-2 shadow-md"
                >
                  <MapPin className="w-4 h-4 text-[#80bea6]" /> Tiến Hành Đặt Phòng Theo Lịch Trình
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
