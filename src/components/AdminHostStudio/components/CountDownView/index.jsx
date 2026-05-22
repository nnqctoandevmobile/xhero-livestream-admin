import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminPanelService } from "../../../../api";
import { Badge, message } from "antd";
import { useIsMobile } from "../../../../hook/useMediaQuery";
import IconClock from "../../../../icons/IconClock";
import IconFileText from "../../../../icons/IconFileText";
import IconCopy from "../../../../icons/IconCopy";
import IconQr from "../../../../icons/IconQr";

const api = new AdminPanelService();

export default function CountDownView() {
  const { _id: roomId } = useParams();
  const [isReady, setIsReady] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);
  const isMobile = useIsMobile();
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (roomId) {
      getDetailLivestream();
    }
  }, [roomId]);

  const parseTargetDate = (timeStr, dateStr) => {
    if (!timeStr || !timeStr.includes(':')) return null;

    const parts = timeStr.split(':');
    const targetH = parseInt(parts[0], 10);
    const targetM = parseInt(parts[1], 10);

    if (isNaN(targetH) || isNaN(targetM)) return null;

    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(targetH, targetM, 0, 0);

    const dateLower = (dateStr || '').toLowerCase();
    if (dateLower.includes('mai')) {
      targetDate.setDate(now.getDate() + 1);
    } else if (dateLower.includes('chủ nhật')) {
      const currentDay = now.getDay();
      const daysUntilSunday = (7 - currentDay) % 7 || 7;
      targetDate.setDate(now.getDate() + daysUntilSunday);
    } else if (dateStr && (dateStr.includes('/') || dateStr.includes('-'))) {
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
    return targetDate;
  };

  const TimerDisplay = React.memo(({ timeStr, dateStr, isMobile, onReadyChange }) => {
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    useEffect(() => {
      const targetDate = parseTargetDate(timeStr, dateStr);
      if (!targetDate) return;

      const updateCountdown = () => {
        const diff = targetDate.getTime() - new Date().getTime();

        if (diff <= 0) {
          setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
          onReadyChange(true);
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
        onReadyChange(diff <= 5 * 60 * 1000);
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [timeStr, dateStr, onReadyChange]);

    if (isMobile) {
      return (
        <div className="flex flex-col items-center mt-1.5 w-full">
          <div className="text-[36px] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-lg">
            {timeLeft.days !== '00' && <span className="text-[#D4AF37]">{timeLeft.days}:</span>}
            {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
          <div className="flex gap-4 text-[#7E8CA8] font-bold text-[8px] uppercase tracking-[2px] mt-1 ml-1">
            {timeLeft.days !== '00' && <span className="text-[#D4AF37]">Ngày</span>}
            <span>Giờ</span>
            <span>Phút</span>
            <span>Giây</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center mb-12">
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
    );
  });

  const getDetailLivestream = async () => {
    try {
      const res = await api.actGetDetailLivestream(roomId);
      setDetailData(res.data.mainData);
      setAudioUrl(res.data.mainData?.inStreamSettings?.music || "");
      setVideoUrl(res.data.mainData?.inStreamSettings?.video || "");
      setBackgroundUrl(res.data.mainData?.inStreamSettings?.background || "");
      if (res.data.mainData?.info?.startAt) {
        const date = new Date(res.data.mainData.info.startAt);
        setTimeStr(date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
        setDateStr(date.toLocaleDateString("vi-VN"));
      }
    } catch (error) {
      console.error("Failed to get detail livestream:", error);
    }
  };

  const togglePlayAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.warn('Audio play block:', err));
    }
    setIsPlayingAudio(!isPlayingAudio);
  }, [isPlayingAudio]);

  useEffect(() => {
    if (audioRef.current && audioUrl !== "") {
      audioRef.current.src = audioUrl;
    }
    setIsPlayingAudio(false);
  }, [audioUrl]);

  const getYouTubeEmbedUrl = useCallback((url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoUrl}` : url;
  }, []);

  const getAppUrl = useCallback((type) => {
    const baseLink = import.meta.env.NEXT_PUBLIC_LIVESTREAM_URL || window.location.origin;
    if (type === 'host') {
      return `${baseLink}/host/${roomId}`;
    }
    return `${baseLink}/live/${roomId}`;
  }, [roomId]);

  const handleCopyLink = useCallback((text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success(`Đã sao chép đường dẫn ${type} thành công!`);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        message.error('Không thể tự động sao chép. Vui lòng sao chép thủ công.');
      });
  }, []);

  const hostAppUrl = useMemo(() => getAppUrl('host'), [getAppUrl]);
  const viewerAppUrl = useMemo(() => getAppUrl('live'), [getAppUrl]);

  const hostQrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(hostAppUrl)}`;
  }, [hostAppUrl]);

  const viewerQrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(viewerAppUrl)}`;
  }, [viewerAppUrl]);

  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl, getYouTubeEmbedUrl]);

  const handleReadyChange = useCallback((ready) => {
    setIsReady((prev) => (prev !== ready ? ready : prev));
  }, []);

  const bgStyle = useMemo(() => backgroundUrl
    ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}, [backgroundUrl]);

  return (
    <div style={bgStyle}
      className={`absolute inset-0 bg-[#090D14] z-[100] flex ${isMobile ? 'flex-col px-6 gap-8 overflow-y-auto' : 'p-12 gap-12 overflow-hidden'}`}>
      <div className="absolute inset-0 bg-[#090D14]/90 backdrop-blur-md pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,_#D4AF3705_0%,_transparent_50%)] pointer-events-none"></div>
      {/* Sticky Header: Contains Quick Actions & Countdown Timer on Mobile */}
      <div className={`${isMobile ? 'sticky top-0 z-50 bg-[#090D14]/90 backdrop-blur-md pb-4 pt-6 -mx-6 px-6 border-b border-[#1E2633]/20 shadow-md flex flex-col items-center gap-3' : 'absolute top-8 right-12 z-[110] flex items-center gap-3'}`}>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 items-center">
          {/* Copy Host Link */}
          <button
            onClick={() => handleCopyLink(hostAppUrl, 'Host')}
            className={`
              flex items-center gap-2 
              bg-[#151D2C]/90 hover:bg-[#D4AF37]/20
              text-white hover:text-[#FFF5C3]
              border border-[#1E2633] hover:border-[#D4AF37]/50
              rounded-xl font-bold transition-all duration-300
              cursor-pointer shadow-lg
              ${isMobile ? 'px-3 py-1.5 text-[10px]' : 'px-3.5 py-2 text-xs'}
            `}
          >
            <IconCopy className="w-4 h-4 text-[#D4AF37]" />
            Host Link
          </button>

          {/* Copy Viewer Link */}
          <button
            onClick={() => handleCopyLink(viewerAppUrl, 'Viewer')}
            className={`
              flex items-center gap-2 
              bg-[#151D2C]/90 hover:bg-[#3B82F6]/20
              text-white hover:text-[#FFF5C3]
              border border-[#1E2633] hover:border-[#3B82F6]/50
              rounded-xl font-bold transition-all duration-300
              cursor-pointer shadow-lg
              ${isMobile ? 'px-3 py-1.5 text-[10px]' : 'px-3.5 py-2 text-xs'}
            `}
          >
            <IconCopy className="w-4 h-4 text-[#3B82F6]" />
            Viewer Link
          </button>

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className={`
              flex items-center gap-2 
              bg-[#151D2C]/90 hover:bg-[#D4AF37]/20
              text-white hover:text-[#FFF5C3]
              border border-[#1E2633] hover:border-[#D4AF37]/50
              rounded-xl font-bold transition-all duration-300
              cursor-pointer shadow-lg
              ${isMobile ? 'px-3 py-1.5 text-[10px]' : 'px-3.5 py-2 text-xs'}
            `}
          >
            <IconQr className="w-4 h-4 text-[#D4AF37]" />
            QR Codes
          </button>

          {/* Xem Intro Video Button */}
          {videoUrl && (
            <button
              onClick={() => setShowVideoModal(true)}
              className={`
                flex items-center gap-2 
                bg-[#151D2C]/90 hover:bg-red-500/20
                text-white hover:text-[#FFF5C3]
                border border-[#1E2633] hover:border-red-500/50
                rounded-xl font-bold transition-all duration-300
                cursor-pointer shadow-lg
                ${isMobile ? 'px-3 py-1.5 text-[10px]' : 'px-3.5 py-2 text-xs'}
              `}
            >
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Intro Video
            </button>
          )}

          {/* Audio Player Control */}
          {audioUrl && (
            <div className="flex items-center gap-2 bg-[#151D2C]/90 border border-[#D4AF37]/30 rounded-xl px-3 py-1 shadow-lg h-full self-stretch">
              <audio ref={audioRef} loop className="hidden" />
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-6 h-6 rounded-full bg-[#D4AF37] hover:bg-[#FFF5C3] text-black flex items-center justify-center transition-all cursor-pointer text-xs shrink-0"
              >
                {isPlayingAudio ? '❚❚' : '▶'}
              </button>
              <div className="text-left select-none pr-1">
                <span className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-wider block leading-none">
                  {isPlayingAudio ? 'Đang phát nhạc' : 'Phát nhạc chờ'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile ONLY: Compact Sticky Countdown Timer */}
        {isMobile && (
          <TimerDisplay
            timeStr={timeStr}
            dateStr={dateStr}
            isMobile={true}
            onReadyChange={handleReadyChange}
          />
        )}
      </div>

      {/* Left Panel: Simplified Countdown (Titles & Starts-in info) */}
      <div className={`flex flex-col items-center justify-center text-center z-10 ${isMobile ? 'w-full pb-6 border-b border-[#1E2633]/30' : 'flex-[2] border-r border-[#1E2633]/50 pr-12'}`}>
        <h2 className={`text-[12px] font-bold text-[#D4AF37] uppercase tracking-[8px] ${isMobile ? '' : 'mb-6'} opacity-80`}>Trạng thái: Đang chuẩn bị lên sóng</h2>
        <h1 className={`text-4xl font-extrabold text-white tracking-tight ${isMobile ? 'mb-8' : 'mb-16'}`}>{detailData?.info?.name}</h1>

        {/* Desktop ONLY Inline Countdown Timer */}
        {!isMobile && (
          <TimerDisplay
            timeStr={timeStr}
            dateStr={dateStr}
            isMobile={false}
            onReadyChange={handleReadyChange}
          />
        )}

        <div className={`${isMobile ? 'mt-4 flex-col px-4 py-3 rounded-2xl gap-3 w-full max-w-[280px] mx-auto' : 'mt-8 px-8 py-4 rounded-full gap-6'} bg-[#151D2C] border border-[#1E2633] flex items-center shadow-2xl`}>
          <div className="flex items-center gap-3">
            <IconClock className="w-5 h-5 text-[#D4AF37]" />
            <div className="text-left">
              <div className="text-[9px] text-[#7E8CA8] uppercase font-bold tracking-widest leading-none mb-1">Thời gian bắt đầu</div>
              <div className="text-sm font-bold text-white leading-none">{dateStr} | {timeStr}</div>
            </div>
          </div>
          <div className={`${isMobile ? 'h-[1px] w-full bg-[#1E2633]' : 'h-8 w-[1px] bg-[#1E2633]'}`}></div>
          <div className="flex items-center gap-3">
            <Badge status={isReady ? "processing" : "default"} color={isReady ? "#D4AF37" : "#4F5E7B"} />
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isReady ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}>
              {isReady ? 'Hệ thống đã sẵn sàng' : 'Đang đồng bộ...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Consulting Forms */}
      <div className={`flex-1 flex flex-col z-10 min-w-0 ${isMobile ? 'w-full mt-4' : ''}`}>
        <div className={`bg-[#0D1424] border border-[#1E2633] ${isMobile ? 'rounded-[20px] p-4 min-h-[300px]' : 'rounded-[32px] p-8'} flex flex-col h-full shadow-2xl`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
              <IconFileText className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold text-white">Form tư vấn</h3>
          </div>
          <p className="text-xs text-[#7E8CA8] mb-8 leading-relaxed">Câu hỏi từ người xem gửi về trước phiên livestream.</p>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {/* {FORMS_DATA.map(form => (
              <div key={form.id} className="bg-[#151D2C] border border-[#1E2633] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">{form.user}</div>
                  <div className="text-[9px] text-[#4F5E7B] font-bold uppercase">Mới</div>
                </div>
                <div className="text-[13px] text-gray-200 leading-relaxed italic opacity-90">"{form.question}"</div>
              </div>
            ))} */}
          </div>
        </div>
      </div>

    </div>
  );
}