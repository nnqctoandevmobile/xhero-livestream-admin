'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import { rtdb } from '../../core/firebase';
import { ref, onValue, set, push, onChildAdded } from 'firebase/database';
import { useAntMedia } from '../../core/useAntMedia';
import { message, Tooltip, Badge, Tabs, Dropdown, Menu, Modal } from 'antd';
import CountdownView from './components/CountDownView';
import { dummyStreams } from '../../core/dummyData'

export default function AdminHostStudio() {
  const { _id: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [isChatVisible, setIsChatVisible] = useState(true);
  const isChatVisibleRef = useRef(true);

  // Keep reference updated for callbacks
  useEffect(() => {
    isChatVisibleRef.current = isChatVisible;
  }, [isChatVisible]);

  // State for controls
  const [isRecording, setIsRecording] = useState(false);
  const [activeScene, setActiveScene] = useState('focus'); // focus, presentation, dual
  const [isWaiting, setIsWaiting] = useState(true);

  // State for data
  const [roomInfo, setRoomInfo] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState('00:00:00');
  const [viewerName, setViewerName] = useState('');
  const [messages, setMessages] = useState([]);
  const [waitingList, setWaitingList] = useState([
    { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', waitTime: '2 phút', status: 'pending' },
    { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', waitTime: '5 phút', status: 'pending' },
    { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3', waitTime: '10 phút', status: 'pending' },
  ]);
  const [rightTab, setRightTab] = useState('chat');
  const [reactions, setReactions] = useState([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);

  const handleToggleLock = () => {
    setIsChatLocked(!isChatLocked);
    message.info(isChatLocked ? "Đã mở khóa khung chat" : "Đã khóa khung chat đối với khán giả");
  };

  const handlePinMessage = (msg) => {
    if (pinnedMessage?.id === msg.id || pinnedMessage?.text === msg.text) {
      setPinnedMessage(null);
      message.info("Đã bỏ ghim tin nhắn");
    } else {
      setPinnedMessage(msg);
      message.success("Đã ghim tin nhắn lên đầu");
    }
  };

  const handleChatAction = (type, msg) => {
    switch (type) {
      case 'mute':
        message.warning(`Đã cấm chat: ${msg.senderName}`);
        break;
      case 'block':
        message.error(`Đã chặn: ${msg.senderName}`);
        break;
      case 'kick':
        message.error(`Đã kick: ${msg.senderName} khỏi phòng`);
        break;
      default:
        break;
    }
  };

  // Stats state (mock)
  const [stats, setStats] = useState({
    bitrate: '4500 kbps',
    packetLoss: '0.02%',
    latency: '120ms',
    resolution: '1920x1080'
  });

  // AntMedia Integration (Publish mode for Host)
  const { remoteVideoRef, isPlaying, loading: mediaLoading, startPlaying, stopPlaying } = useAntMedia({
    serverUrl: import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER,
    streamId: roomId,
    mode: 'play'
  });

  // Keep playback alive
  useEffect(() => {
    if (!isWaiting && !isPlaying) {
      const timer = setInterval(() => {
        startPlaying();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isWaiting, isPlaying, startPlaying]);

  useEffect(() => {
    if (!roomId) return;
    const chatRef = ref(rtdb, `rooms/${roomId}/chat`);

    const unsubscribeAdded = onChildAdded(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.role === 'reaction') {
          const id = snapshot.key || Date.now().toString() + Math.random();
          const left = 10 + Math.random() * 80; // random position from 10% to 90%
          setReactions((prev) => [...prev, { id, emoji: data.text, left }]);
          setTimeout(() => {
            setReactions((prev) => prev.filter(r => r.id !== id));
          }, 3000);
        } else {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.text === data.text && msg.senderName === data.senderName && msg.timestamp === data.timestamp);
            if (exists) return prev;

            // Highlight badge if chat is currently collapsed
            if (!isChatVisibleRef.current) {
              setHasNewMessage(true);
            }
            return [...prev, {
              senderId: data.senderId,
              senderName: data.senderName,
              text: data.text,
              avatar: data.avatar,
              role: data.role,
              timestamp: data.timestamp || Date.now()
            }];
          });
        }
      }
    });

    const unsubscribeValue = onValue(chatRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([{ senderName: 'Hệ thống', text: 'Chào mừng bạn đến với Phòng Chờ XHERO LIVE!', timestamp: Date.now() }]);
      }
    });

    return () => {
      unsubscribeAdded();
      unsubscribeValue();
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    // Skip countdown if currently live in metadata
    const stream = dummyStreams.find(s => s.id === roomId);
    if (stream && stream.dateStr === 'Đang Live') {
      setIsWaiting(false);
      return;
    }

    const checkStreamStatus = async () => {
      try {
        const res = await fetch(`/api/stream/status?streamId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          // if (data.name) {
          //   setStreamName(data.name);
          // }
          if (data.status === 'broadcasting') {
            setIsWaiting(false);
          }
        }
      } catch (err) {
        console.warn('Failed to check stream status:', err);
      }
    };

    checkStreamStatus();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    // Sync with Firebase for room info
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomInfo(data);
        setViewerCount(Object.keys(data?.viewers || {}).length);
        
        if (data.state?.isLive === true || data.state?.status === 'LIVE') {
          setIsWaiting(false);
        } else {
          setIsWaiting(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  // Skip countdown screen if stream is active
  useEffect(() => {
    if (!roomId) return;

    // Skip countdown if currently live in metadata
    const stream = dummyStreams.find(s => s.id === roomId);
    if (stream && stream.dateStr === 'Đang Live') {
      setIsWaiting(false);
      return;
    }

    const checkStreamStatus = async () => {
      try {
        const res = await fetch(`/api/stream/status?streamId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) {
            setStreamName(data.name);
          }
          if (data.status === 'broadcasting') {
            setIsWaiting(false);
          }
        }
      } catch (err) {
        console.warn('Failed to check stream status:', err);
      }
    };

    checkStreamStatus();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user) {
      setViewerName(user.fullName || user.username);
    }
  }, [user]);

  const handleStopSession = () => {
    Modal.confirm({
      title: <span className="text-white font-bold">Kết thúc phiên livestream?</span>,
      content: <span className="text-gray-400">Tất cả khán giả sẽ bị ngắt kết nối và phiên live sẽ dừng lại ngay lập tức.</span>,
      okText: 'Kết thúc ngay',
      okType: 'danger',
      cancelText: 'Đóng',
      centered: true,
      className: 'dark-modal',
      onOk() {
        stopPublishing();
        navigate('/home');
      },
    });
  };

  const scenes = [
    { id: 'focus', name: 'Focus Cam', icon: <IconVideo className="w-5 h-5" />, desc: 'Chỉ hiển thị camera Chuyên gia' },
    { id: 'presentation', name: 'Presentation', icon: <IconMonitor className="w-5 h-5" />, desc: 'Tài liệu + Cam host góc nhỏ' },
    { id: 'dual', name: 'Dual Cam', icon: <IconUsers className="w-5 h-5" />, desc: 'Chuyên gia & Viewer tương tác' },
  ];

  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] h-screen bg-[#090D14] text-white overflow-hidden font-sans">
      {/* Pre-live Countdown Overlay */}
      {isWaiting && (
        <CountdownView roomInfo={roomInfo} />
      )}

      {/* LEFT SIDEBAR: Navigation & Scene Switcher */}
      <aside className="h-full border-r border-[#1E2633] bg-[#0D1424] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#1E2633]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <IconShield className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#D4AF37]">XHERO STUDIO</h1>
              <p className="text-[10px] text-[#7E8CA8] uppercase tracking-widest font-semibold">Admin Dashboard</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-3">Thông tin phiên</div>
            <div className="bg-[#151D2C] p-3 rounded-xl border border-[#1E2633]">
              <h2 className="text-sm font-semibold truncate text-white">{roomInfo?.state?.roomTitle || 'Đang tải...'}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs text-red-500 font-bold uppercase tracking-tighter">{roomInfo?.state?.status}</span>
                <span className="text-[11px] text-[#7E8CA8] ml-auto">{duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-4">Chế độ hiển thị (Scenes)</div>
          <div className="space-y-4">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setActiveScene(scene.id)}
                className={`w-full group relative transition-all duration-300 rounded-xl overflow-hidden border-2 ${activeScene === scene.id
                  ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/10'
                  : 'border-[#1E2633] hover:border-[#3B82F6]/50 bg-[#151D2C]'
                  }`}
              >
                <div className={`aspect-video w-full flex items-center justify-center transition-colors ${activeScene === scene.id ? 'bg-[#D4AF37]/10' : 'bg-[#0D1424]'
                  }`}>
                  {scene.icon}
                </div>
                <div className={`p-3 text-left relative ${activeScene === scene.id ? 'bg-[#D4AF37]/5' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-bold ${activeScene === scene.id ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}>
                      {scene.name}
                    </div>
                    {activeScene === scene.id && (
                      <span className="bg-[#D4AF37] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                        Đang phát
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#4F5E7B] mt-1 line-clamp-1">{scene.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[#1E2633] mt-auto">
          <button
            onClick={handleStopSession}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/5 group"
          >
            <IconStop className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Kết thúc phiên
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-[11px] font-medium text-[#4F5E7B] hover:text-white transition-all uppercase tracking-wider"
          >
            <IconLogOut className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>
      </aside>

      {/* MAIN CENTER AREA: Video Preview & Controls */}
      <main className="h-full flex flex-col bg-[#090D14] relative overflow-hidden">

        {/* TOP STATS BAR */}
        <header className="h-16 border-b border-[#1E2633] bg-[#0D1424]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <IconSignal className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-[10px] text-[#7E8CA8] leading-none mb-1 uppercase font-bold">Latency</div>
                <div className="text-xs font-mono font-bold text-green-500">{stats.latency}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconActivity className="w-4 h-4 text-[#3B82F6]" />
              <div>
                <div className="text-[10px] text-[#7E8CA8] leading-none mb-1 uppercase font-bold">Bitrate</div>
                <div className="text-xs font-mono font-bold text-[#3B82F6]">{stats.bitrate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconChart className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[10px] text-[#7E8CA8] leading-none mb-1 uppercase font-bold">Quality</div>
                <div className="text-xs font-mono font-bold text-orange-500">{stats.resolution}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#1A2333] px-4 py-2 rounded-lg border border-[#2A3441] flex items-center gap-2">
              <IconUsers className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-bold">{viewerCount.toLocaleString()}</span>
              <span className="text-[10px] text-[#7E8CA8] font-medium uppercase tracking-wider ml-1">Đang xem</span>
            </div>
            <button className="p-2.5 rounded-lg hover:bg-white/5 text-[#7E8CA8] transition-colors border border-transparent hover:border-[#2A3441]">
              <IconSettings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* STAGE: Video Preview */}
        <div className="flex-1 min-h-0 relative p-6 bg-[radial-gradient(circle_at_center,_#111827_0%,_#090D14_100%)]">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#1E2633] relative group">

            {/* Background for Presentation Scene */}
            {activeScene === 'presentation' && (
              <div className="absolute inset-0 bg-[#0D1424] flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-6 text-white/5">
                  <IconLayout className="w-48 h-48" />
                  <h2 className="text-2xl font-bold tracking-widest uppercase">Slide Content / Screen Share</h2>
                </div>
              </div>
            )}

            {/* The main video element (Host) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className={`transition-all duration-700 shadow-2xl object-cover ${activeScene === 'presentation'
                ? 'absolute bottom-6 right-6 w-1/4 aspect-video rounded-xl border-2 border-[#D4AF37] z-20'
                : activeScene === 'dual'
                  ? 'absolute left-0 top-0 w-1/2 h-full z-20'
                  : 'w-full h-full'
                }`}
            />

            {/* Scene-specific Overlays */}
            {activeScene === 'presentation' && (
              <div className="absolute bottom-8 right-[calc(1.5rem+8px)] z-30 px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold rounded uppercase shadow-lg">
                Chuyên gia
              </div>
            )}

            {activeScene === 'dual' && (
              <div className="absolute inset-0 flex bg-[#0D1424]">
                {/* Left Side (Host) */}
                <div className="flex-1 relative border-r-2 border-[#D4AF37]/20">
                  <div className="absolute bottom-6 left-6 z-30 px-3 py-1 bg-[#D4AF37] text-black text-[10px] font-bold rounded uppercase shadow-lg">
                    Chuyên gia
                  </div>
                </div>

                {/* Right Side (Guest) */}
                <div className="flex-1 bg-gradient-to-br from-[#1E2633] to-[#0D1424] flex items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="flex flex-col items-center gap-4 text-[#7E8CA8]">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#7E8CA8]/30 flex items-center justify-center">
                      <IconUsers className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-sm font-medium italic opacity-50">Đang chờ kết nối khách mời...</p>
                  </div>
                  <div className="absolute bottom-6 left-6 z-30 px-3 py-1 bg-[#3B82F6] text-white text-[10px] font-bold rounded uppercase shadow-lg">
                    Khách mời
                  </div>
                </div>
              </div>
            )}

            {/* Status Overlays */}
            <div className="absolute top-6 left-6 flex gap-3 z-30">
              {roomInfo?.state?.status === 'LIVE' && (
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full shadow-lg shadow-red-600/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">On Air</span>
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Rec</span>
                </div>
              )}
            </div>

            {/* Stats Overlay in corner */}
            <div className="absolute top-6 right-6 z-30">
              <div className="bg-[#0D1424]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] font-mono space-y-1 min-w-[140px] shadow-2xl">
                <div className="flex justify-between">
                  <span className="text-[#7E8CA8]">CPU:</span>
                  <span className="text-white">12.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7E8CA8]">Loss:</span>
                  <span className="text-green-500">{stats.packetLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7E8CA8]">FPS:</span>
                  <span className="text-white">60 fps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROL BAR */}
        <footer className="h-24 border-t border-[#1E2633] bg-[#0D1424] flex items-center justify-center px-12 gap-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex flex-col items-center justify-center gap-1 px-10 h-14 rounded-2xl transition-all duration-300 shadow-lg ${isRecording
                ? 'bg-[#FFD700] text-black shadow-[#FFD700]/20'
                : 'bg-[#1E2633] text-red-500 border border-white/5 hover:text-white'
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-800 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isRecording ? 'text-red-800' : 'text-red-500'}`}>
                {isRecording ? "Đang ghi hình" : "Bắt đầu ghi hình"}
              </span>
            </button>
          </div>
        </footer>
      </main>

      {/* RIGHT PANEL: Chat & Hand-Raised List */}
      <aside className="h-full border-l border-[#1E2633] bg-[#0D1424] flex flex-col overflow-hidden">
        <div className="flex border-b border-[#1E2633]">
          <button
            onClick={() => {
              setRightTab('chat');
              setHasNewMessage(false);
            }}
            className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${rightTab === 'chat' ? 'text-[#D4AF37]' : 'text-[#7E8CA8] hover:text-white'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IconMessage className="w-4 h-4" />
              Chat Box
              {hasNewMessage && rightTab !== 'chat' && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
            {rightTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"></div>}
          </button>
          <button
            onClick={() => setRightTab('hand')}
            className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${rightTab === 'hand' ? 'text-[#D4AF37]' : 'text-[#7E8CA8] hover:text-white'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IconHand className="w-4 h-4" />
              Giơ tay
              {waitingList.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {waitingList.length}
                </span>
              )}
            </div>
            {rightTab === 'hand' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"></div>}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {rightTab === 'chat' ? (
            <div className="h-full flex flex-col p-6">
              {/* Chat Controls Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1E2633]">
                <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider">Khung hội thoại</div>
                <Tooltip title={isChatLocked ? "Mở khóa chat" : "Tạm khóa chat khán giả"}>
                  <button
                    onClick={handleToggleLock}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isChatLocked ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-[#151D2C] text-[#7E8CA8] border border-[#1E2633] hover:text-white'
                      }`}
                  >
                    {isChatLocked ? <IconLock className="w-3.5 h-3.5" /> : <IconUnlock className="w-3.5 h-3.5" />}
                    {isChatLocked ? 'Đã khóa' : 'Mở chat'}
                  </button>
                </Tooltip>
              </div>

              {/* Pinned Message Area */}
              {pinnedMessage && (
                <div className="mb-6 bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-4 border-[#D4AF37] p-3 rounded-r-xl relative group animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-1">
                    <IconPin className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Tin nhắn đã ghim</span>
                    <button
                      onClick={() => setPinnedMessage(null)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
                    >
                      <IconX className="w-3 h-3 text-[#7E8CA8]" />
                    </button>
                  </div>
                  <div className="text-[11px] font-bold text-white mb-1">{pinnedMessage.senderName}</div>
                  <div className="text-xs text-gray-300 line-clamp-2 italic leading-relaxed">"{pinnedMessage.text}"</div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className="group">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className={`text-xs font-bold ${msg.role === 'host' ? 'text-[#D4AF37]' : 'text-[#3B82F6]'}`}>
                        {msg.senderName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#4F5E7B] opacity-0 group-hover:opacity-100 transition-opacity">12:30</span>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'pin',
                                label: pinnedMessage?.id === msg.id || pinnedMessage?.text === msg.text ? 'Bỏ ghim' : 'Ghim tin nhắn',
                                icon: <IconPin className="w-3.5 h-3.5" />,
                                onClick: () => handlePinMessage(msg),
                                className: "text-[#D4AF37] hover:bg-white/5 rounded-lg text-xs"
                              },
                              { type: 'divider', className: "bg-[#2A3441] my-1" },
                              {
                                key: 'mute',
                                label: 'Cấm chat',
                                onClick: () => handleChatAction('mute', msg),
                                className: "text-[#7E8CA8] hover:bg-white/5 rounded-lg text-xs"
                              },
                              {
                                key: 'block',
                                label: 'Chặn người dùng',
                                onClick: () => handleChatAction('block', msg),
                                className: "text-[#7E8CA8] hover:bg-white/5 rounded-lg text-xs"
                              },
                              {
                                key: 'kick',
                                label: 'Kick khỏi phòng',
                                onClick: () => handleChatAction('kick', msg),
                                className: "text-red-500 hover:bg-red-500/10 rounded-lg text-xs"
                              }
                            ],
                            className: "bg-[#1A2333] border border-[#2A3441] p-1 rounded-xl shadow-2xl min-w-[140px]"
                          }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <button className="text-[#4F5E7B] hover:text-white transition-colors p-1 opacity-0 group-hover:opacity-100">
                            <IconDots className="w-3.5 h-3.5" />
                          </button>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="bg-[#151D2C] p-3 rounded-xl border border-[#1E2633] text-sm text-gray-200 leading-relaxed shadow-sm">
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-6 pt-4 border-t border-[#1E2633]">
                <div className="relative">
                  <input
                    type="text"
                    disabled={isChatLocked}
                    placeholder={isChatLocked ? "Khung chat đang tạm khóa..." : "Gửi thông báo đến mọi người..."}
                    className={`w-full bg-[#151D2C] border border-[#1E2633] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-all ${isChatLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  />
                  <button
                    disabled={isChatLocked}
                    className={`absolute right-2 top-2 p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all ${isChatLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <IconRadio className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider">Danh sách chờ tương tác</div>
                <div className="text-[10px] text-[#7E8CA8] bg-white/5 px-2 py-1 rounded">Mới nhất</div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {waitingList.map((item) => (
                  <div key={item.id} className="bg-[#1A2333]/50 border border-[#1E2633] rounded-xl p-3 flex items-center gap-3 transition-all hover:border-[#D4AF37]/30 group">
                    <div className="relative">
                      <img src={item.avatar} className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/20 object-cover" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0D1424] rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate text-white leading-tight">{item.name}</div>
                      <div className="text-[10px] text-[#7E8CA8] flex items-center gap-1 mt-0.5">
                        <IconClock className="w-3 h-3 opacity-60" />
                        Đã chờ {item.waitTime}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setActiveScene('dual');
                          message.success(`Đã chấp nhận tương tác với ${item.name}`);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition-all border border-green-500/20"
                        title="Chấp thuận"
                      >
                        <IconCheck className="w-4 h-4" />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                        title="Từ chối"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1E2633;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2A3441;
        }

        .dark-modal .ant-modal-content {
          background-color: #0D1424 !important;
          border: 1px solid #1E2633 !important;
          border-radius: 20px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .dark-modal .ant-modal-confirm-title {
          color: white !important;
          font-size: 18px !important;
        }
        .dark-modal .ant-modal-confirm-content {
          color: #7E8CA8 !important;
        }
        .dark-modal .ant-btn-default {
          background: transparent !important;
          border-color: #1E2633 !important;
          color: #7E8CA8 !important;
          border-radius: 8px !important;
        }
        .dark-modal .ant-btn-primary {
          border-radius: 8px !important;
        }
      `}} />
    </div>
  );
}

const IconMic = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconMicOff = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconVideo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconVideoOff = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconMonitor = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IconStop = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" />
  </svg>
);
const IconSettings = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconUsers = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconMessage = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconHand = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
const IconLayout = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const IconActivity = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconSignal = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 20V4" />
  </svg>
);
const IconChart = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconRadio = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M7.76 7.76a6 6 0 0 0 0 8.49" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);
const IconLogOut = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconShield = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconX = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconClock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconDots = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const IconPin = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-2l-1.5-1.5V6a3.5 3.5 0 0 0-7 0v7.5L9 15v2z" />
  </svg>
);
const IconLock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUnlock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V5a5 5 0 0 1 9.9-1" />
  </svg>
);
const IconCheck = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
