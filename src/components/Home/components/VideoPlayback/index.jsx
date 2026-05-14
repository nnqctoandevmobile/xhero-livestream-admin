import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message, Progress } from 'antd';
import dayjs from 'dayjs';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../../../core/firebase';
import { PLAYBACK_STATUS } from '../../../../core/constants';

const badgeConfig = {
  [PLAYBACK_STATUS.Ready]: {
    text: 'Sẵn sàng',
    className: 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
  },
  [PLAYBACK_STATUS.Processing]: {
    text: 'Đang xử lý',
    className: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.3)]',
  },
  [PLAYBACK_STATUS.Error]: {
    text: 'Lỗi xử lý',
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
  },
};

const initialMockData = [
  {
    "_id": "6a02eae8bf901adc9bcf6931",
    "info": {
      "name": "Livestream Giới thiệu sản phẩm mới",
      "thumbnailUrl": "https://picsum.photos/200/300",
    },
    "streamSettings": {
      "streamId": "SESSION_001",
      "hls": {
        "playbackUrl": "https://live.xheroapp.com/hls/SESSION_001.m3u8"
      }
    },
    "createdAt": "2026-05-13T08:00:00.000Z",
    "duration": "01:45:20",
    "playbackStatus": PLAYBACK_STATUS.Ready,
    "progress": 100,
  },
  {
    "_id": "6a02eae8bf901adc9bcf6932",
    "info": {
      "name": "Q&A Khóa học Livestream nâng cao",
      "thumbnailUrl": "https://picsum.photos/200/301",
    },
    "streamSettings": {
      "streamId": "SESSION_002",
      "hls": {
        "playbackUrl": ""
      }
    },
    "createdAt": "2026-05-13T10:30:00.000Z",
    "duration": "02:10:05",
    "playbackStatus": PLAYBACK_STATUS.Processing,
    "progress": 45,
  },
  {
    "_id": "6a02eae8bf901adc9bcf6933",
    "info": {
      "name": "Livestream Khai giảng K4",
      "thumbnailUrl": "",
    },
    "streamSettings": {
      "streamId": "SESSION_003",
      "hls": {
        "playbackUrl": ""
      }
    },
    "createdAt": "2026-05-12T19:00:00.000Z",
    "duration": "00:55:10",
    "playbackStatus": PLAYBACK_STATUS.Error,
    "progress": 0,
  }
];

export default function VideoPlayback() {
  const [data, setData] = useState(initialMockData);

  // Firebase RTDB Listener
  useEffect(() => {
    const roomsRef = ref(rtdb, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const rtdbData = snapshot.val();
      if (!rtdbData) return;

      const parsedRtdbData = Object.entries(rtdbData).map(([id, node]) => {
        const state = node.state || {};
        // Only include ended sessions for playback usually, or those with playback URLs
        const isEnded = state.isLive === false;
        
        return {
          "_id": id,
          "info": {
            "name": state.roomTitle || 'Phiên live không tên',
            "thumbnailUrl": state.thumbnailUrl || "", // Mock thumbnail if missing
          },
          "streamSettings": {
            "streamId": id,
            "hls": {
              "playbackUrl": state.playbackUrl || "" 
            }
          },
          "createdAt": state.dateStr && state.timeStr ? new Date(`${state.dateStr} ${state.timeStr}`).toISOString() : new Date().toISOString(),
          "duration": state.duration || "00:00:00",
          "playbackStatus": state.playbackStatus || (state.playbackUrl ? PLAYBACK_STATUS.Ready : PLAYBACK_STATUS.Processing),
          "progress": state.uploadProgress || 100,
        };
      });

      // Filter to avoid duplicates if mock data overlaps with RTDB IDs
      setData(prev => {
        const mockIds = initialMockData.map(m => m._id);
        const filteredRtdb = parsedRtdbData.filter(r => !mockIds.includes(r._id));
        return [...initialMockData, ...filteredRtdb];
      });
    });

    return () => unsubscribe();
  }, []);

  // Auto-update progress for 'processing' items (Demo logic)
  useEffect(() => {
    const timer = setInterval(() => {
      setData(prevData => {
        let hasChanges = false;
        const newData = prevData.map(item => {
          if (item.playbackStatus === PLAYBACK_STATUS.Processing) {
            hasChanges = true;
            const newProgress = Math.min(item.progress + Math.floor(Math.random() * 5) + 1, 100);
            const isFinished = newProgress === 100;
            return {
              ...item,
              progress: newProgress,
              playbackStatus: isFinished ? PLAYBACK_STATUS.Ready : PLAYBACK_STATUS.Processing,
              streamSettings: {
                ...item.streamSettings,
                hls: {
                  playbackUrl: isFinished ? `https://live.xheroapp.com/hls/${item.streamSettings.streamId}.m3u8` : ''
                }
              }
            };
          }
          return item;
        });
        return hasChanges ? newData : prevData;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const columns = [
    {
      title: 'Phiên Livestream',
      dataIndex: 'info',
      key: 'info',
      render: (info, record) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 bg-[#111827] rounded overflow-hidden shrink-0 border border-[#1E2633] flex items-center justify-center relative group">
            {info?.thumbnailUrl ? (
              <img src={info.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#A6B5D6] text-[10px] uppercase">No Img</span>
            )}
            {/* Play overlay icon for visual effect */}
            {record.playbackStatus === PLAYBACK_STATUS.Ready && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm line-clamp-1" title={info?.name || record.streamSettings?.streamId}>
              {info?.name || record.streamSettings?.streamId || 'Không có tên'}
            </div>
            <div className="text-[#7E8CA8] text-xs truncate mt-0.5">
              ID: {record.streamSettings?.streamId}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ngày Live',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <div className="text-white font-medium">{date ? dayjs(date).format('DD/MM/YYYY') : '—'}</div>
          <div className="text-[#7E8CA8] text-xs mt-0.5">{date ? dayjs(date).format('HH:mm') : ''}</div>
        </div>
      )
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => <span className="text-[#A6B5D6] font-mono">{duration || '—'}</span>
    },
    {
      title: 'Trạng thái Upload',
      dataIndex: 'playbackStatus',
      key: 'playbackStatus',
      width: 180,
      render: (status, record) => {
        const config = badgeConfig[status] || { text: {status}, className: 'bg-white/10 text-[#A6B5D6] border border-white/20' };

        return (
          <div className="flex items-center gap-2">
            {status === PLAYBACK_STATUS.Processing && (
              <Progress type="circle" percent={record.progress} size={16} showInfo={false} strokeColor="#3B82F6" strokeWidth={14} className="shrink-0" />
            )}
            <div className={`px-2 py-[3px] rounded text-xs font-semibold whitespace-nowrap w-fit ${config.className}`}>
              {status === PLAYBACK_STATUS.Processing ? `${config.text} ${record.progress}%` : config.text}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 160,
      render: (_, record) => {
        const isReady = record.playbackStatus === PLAYBACK_STATUS.Ready;
        const url = record.streamSettings?.hls?.playbackUrl;

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title={isReady ? "Sao chép link" : "Chưa có link"} placement="top" color="#151D2C">
              <button
                disabled={!isReady}
                onClick={() => {
                  if (url) {
                    navigator.clipboard.writeText(url);
                    message.success('Đã sao chép URL!');
                  }
                }}
                className={`p-[7px] rounded-lg transition-colors ${isReady ? 'text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/20' : 'text-[#7E8CA8] bg-white/5 cursor-not-allowed border border-white/5'}`}
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </Tooltip>

            <Tooltip title={isReady ? "Xem trước" : "Đang xử lý/Lỗi"} placement="top" color="#151D2C">
              <button
                disabled={!isReady}
                className={`flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-sm font-medium transition-all ${isReady ? 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Phát
              </button>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  return (
    <section className="bg-[#0D1424] border border-[#1E2633] rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="!px-6 !py-5 border-b border-[#1E2633] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">Video playback</h3>
          <p className="text-sm text-[#7E8CA8] mt-1">Quản lý các video sau phiên Livestream</p>
        </div>
      </div>

      <div className="!p-4 flex-1">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          bordered
          className="xh-admin-table"
          scroll={{ x: 1200, y: 'calc(100vh - 280px)' }}
        />
      </div>
    </section>
  );
}