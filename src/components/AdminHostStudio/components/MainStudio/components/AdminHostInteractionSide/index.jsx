import { useEffect, useRef, useState } from "react";
import IconMessage from "../../../../../../icons/IconMessage";
import IconHand from "../../../../../../icons/IconHand";
import IconLock from "../../../../../../icons/IconLock";
import IconUnlock from "../../../../../../icons/IconUnlock";
import IconX from "../../../../../../icons/IconX";
import { Dropdown, message, Tooltip } from "antd";
import IconClock from "../../../../../../icons/IconClock";
import IconRadio from "../../../../../../icons/IconRadio";
import IconCheck from "../../../../../../icons/IconCheck";
import { rtdb } from "../../../../../../core/firebase";
import { onChildAdded, onValue, ref } from "firebase/database";
import IconPin from "../../../../../../icons/IconPin";
import IconDots from "../../../../../../icons/IconDots";

export default function AdminHostInteractionSide({ streamId }) {
  const [rightTab, setRightTab] = useState('chat');
  const [reactions, setReactions] = useState([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [waitingList, setWaitingList] = useState([
    { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', waitTime: '2 phút', status: 'pending' },
    { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', waitTime: '5 phút', status: 'pending' },
    { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3', waitTime: '10 phút', status: 'pending' },
  ]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const isChatVisibleRef = useRef(true);

  // Keep reference updated for callbacks
  useEffect(() => {
    isChatVisibleRef.current = isChatVisible;
  }, [isChatVisible]);

  useEffect(() => {
    if (!streamId) return;
    const chatRef = ref(rtdb, `rooms/${streamId}/chat`);

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
  }, [streamId]);

  return (
    <aside className="h-full border-l border-[#1E2633] bg-[#0D1424] flex flex-col overflow-hidden" >
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
                  // onClick={handleToggleLock}
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
    </aside >

  );
}   