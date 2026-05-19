import React, { useState, useEffect } from 'react';
import { Badge } from 'antd';

const IconClock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconFileText = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function CountdownView({ roomInfo }) {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [isReady, setIsReady] = useState(false);

  const timeStr = roomInfo?.state?.timeStr || '00:00';
  const dateStr = roomInfo?.state?.dateStr || '';

  // Mock forms data
  const forms = [
    { id: 1, user: 'Nguyễn Văn A', question: 'Làm sao để tối ưu hóa chiến dịch quảng cáo?' },
    { id: 2, user: 'Trần Thị B', question: 'Ngân sách tối thiểu cho người mới bắt đầu là bao nhiêu?' },
    { id: 3, user: 'Lê Văn C', question: 'Lớp học có hỗ trợ tài liệu sau buổi live không ạ?' },
  ];

  useEffect(() => {
    if (!timeStr || !timeStr.includes(':')) return;

    const parts = timeStr.split(':');
    const targetH = parseInt(parts[0], 10);
    const targetM = parseInt(parts[1], 10);

    if (isNaN(targetH) || isNaN(targetM)) return;

    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(targetH, targetM, 0, 0);

    const dateLower = dateStr.toLowerCase();
    if (dateLower.includes('mai')) {
      targetDate.setDate(now.getDate() + 1);
    } else if (dateLower.includes('chủ nhật')) {
      const currentDay = now.getDay();
      const daysUntilSunday = (7 - currentDay) % 7 || 7;
      targetDate.setDate(now.getDate() + daysUntilSunday);
    } else if (dateStr.includes('/') || dateStr.includes('-')) {
      try {
        const dParts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
        if (dParts.length === 3) {
          const isYearFirst = dParts[0].length === 4;
          const year = parseInt(isYearFirst ? dParts[0] : dParts[2], 10);
          const month = parseInt(dParts[1], 10) - 1;
          const day = parseInt(isYearFirst ? dParts[2] : dParts[0], 10);
          targetDate.setFullYear(year, month, day);
        }
      } catch (e) {
        console.error('Date parse error:', e);
      }
    } else {
      if (targetDate.getTime() < now.getTime() && !dateLower.includes('hôm nay')) {
        targetDate.setDate(now.getDate() + 1);
      }
    }

    const updateCountdown = () => {
      const diff = targetDate.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        setIsReady(true);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });
      setIsReady(diff <= 5 * 60 * 1000);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timeStr, dateStr]);

  return (
    <div className="absolute inset-0 bg-[#090D14] z-[100] flex p-12 gap-12 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,_#D4AF3705_0%,_transparent_50%)] pointer-events-none"></div>

      {/* Left: Simplified Countdown */}
      <div className="flex-[2] flex flex-col items-center justify-center text-center z-10 border-r border-[#1E2633]/50 pr-12">
        <h2 className="text-[12px] font-bold text-[#D4AF37] uppercase tracking-[8px] mb-6 opacity-80">Trạng thái: Đang chuẩn bị lên sóng</h2>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-16">XHERO STUDIO</h1>
        
        <div className="flex flex-col items-center">
          <div className="text-[140px] font-black text-white leading-none tracking-tighter mb-6 tabular-nums drop-shadow-2xl">
            {timeLeft.days !== '00' && <span className="text-[#D4AF37]">{timeLeft.days}:</span>}
            {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
          <div className="flex gap-16 text-[#7E8CA8] font-bold text-[10px] uppercase tracking-[6px] ml-4">
            {timeLeft.days !== '00' && <span className="text-[#D4AF37]">Ngày</span>}
            <span>Giờ</span>
            <span>Phút</span>
            <span>Giây</span>
          </div>
        </div>

        <div className="mt-20 bg-[#151D2C] border border-[#1E2633] px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl">
           <div className="flex items-center gap-3">
              <IconClock className="w-5 h-5 text-[#D4AF37]" />
              <div className="text-left">
                <div className="text-[9px] text-[#7E8CA8] uppercase font-bold tracking-widest leading-none mb-1">Thời gian bắt đầu</div>
                <div className="text-sm font-bold text-white leading-none">{roomInfo?.state?.dateStr} | {roomInfo?.state?.timeStr}</div>
              </div>
           </div>
           <div className="h-8 w-[1px] bg-[#1E2633]"></div>
           <div className="flex items-center gap-3">
              <Badge status={isReady ? "processing" : "default"} color={isReady ? "#D4AF37" : "#4F5E7B"} />
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isReady ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}>
                {isReady ? 'Hệ thống đã sẵn sàng' : 'Đang đồng bộ...'}
              </span>
           </div>
        </div>
      </div>

      {/* Right: Consulting Forms */}
      <div className="flex-1 flex flex-col z-10 min-w-0">
        <div className="bg-[#0D1424] border border-[#1E2633] rounded-[32px] p-8 flex flex-col h-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
              <IconFileText className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold text-white">Form tư vấn</h3>
          </div>
          <p className="text-xs text-[#7E8CA8] mb-8 leading-relaxed">Câu hỏi từ người xem gửi về trước phiên livestream.</p>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {forms.map(form => (
              <div key={form.id} className="bg-[#151D2C] border border-[#1E2633] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">{form.user}</div>
                  <div className="text-[9px] text-[#4F5E7B] font-bold uppercase">Mới</div>
                </div>
                <div className="text-[13px] text-gray-200 leading-relaxed italic opacity-90">"{form.question}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
