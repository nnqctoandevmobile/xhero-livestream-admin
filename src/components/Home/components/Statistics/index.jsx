import React, { useState, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { StatusBadgeLivestream } from '../components/StatusBadgeLivestream';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';

export default function Statistics() {
  const { rooms } = useOutletContext();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState({ lineData: [], barData: [] });

  const selectedRoomId = useMemo(() => {
    if (roomId) return roomId;
    if (rooms && rooms.length > 0) return rooms[0].id;
    return null;
  }, [roomId, rooms]);

  const handleRoomChange = (value) => {
    navigate(`/home/statistics/${value}`);
  };

  const currentRoom = useMemo(() => {
    if (!rooms || rooms.length === 0) return null;
    return rooms.find(r => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const summaryCards = useMemo(() => {
    if (!currentRoom) return [];
    const viewers = currentRoom.viewers || 0;
    return [
      {
        title: 'Peak Concurrent Viewers',
        value: viewers.toLocaleString(),
        desc: 'Số người xem cao nhất',
        icon: '👥'
      },
      {
        title: 'Retained Viewers',
        value: Math.floor(viewers * 0.85).toLocaleString(),
        desc: 'Xem ≥ 85% thời lượng',
        icon: '🎯'
      },
      {
        title: 'Bounced Viewers',
        value: Math.floor(viewers * 0.15).toLocaleString(),
        desc: 'Thoát dưới 3 phút',
        icon: '🚪'
      },
      {
        title: 'Average Watch Time',
        value: '18m 45s',
        desc: 'Thời gian xem TB',
        icon: '⏱️'
      },
    ];
  }, [currentRoom]);

  // Mock historical data generation for charts
  useEffect(() => {
    if (currentRoom) {
      const peakViewers = currentRoom.viewers || 1500;
      const lineData = [];
      const barData = [];
      let currentViewer = Math.floor(peakViewers * 0.2);
      for (let i = 0; i < 60; i++) {
        currentViewer += Math.floor((Math.random() - 0.4) * (peakViewers * 0.15));
        if (currentViewer > peakViewers) currentViewer = peakViewers;
        if (currentViewer < 0) currentViewer = 0;
        lineData.push(Math.floor(currentViewer));
        barData.push(Math.floor((currentViewer / peakViewers) * 50 * Math.random()));
      }
      setHistoryData({ lineData, barData });
    }
  }, [currentRoom?.id]);

  const chartData = useMemo(() => {
    return historyData.lineData.map((viewers, index) => ({
      time: `${index}m`,
      viewers,
      comments: historyData.barData[index] || 0
    }));
  }, [historyData]);

  const handlePrint = () => {
    window.print();
  };

  if (!currentRoom) {
    return (
      <div className="flex h-full items-center justify-center text-[#7E8CA8]">
        Chưa có dữ liệu thống kê. Vui lòng bắt đầu một phiên livestream.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#151D2C] border border-[#2A3441] p-3 rounded-lg shadow-xl">
          <p className="text-[#7E8CA8] text-xs mb-1 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-white text-sm font-bold">
                {entry.name === 'viewers' ? 'Người xem' : 'Bình luận'}: {entry.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 print:bg-white print:text-black">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0D1424] p-4 md:p-5 rounded-2xl border border-[#1E2633] print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white">Thống kê & Báo cáo</h2>
          <p className="text-[#7E8CA8] text-sm mt-1">Lựa chọn phiên để xem dữ liệu</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Select
            value={selectedRoomId}
            // optionLabelProp="display"
            onChange={handleRoomChange}
            options={rooms.map(r => {
              return ({
                value: r.id,
                label: (
                  <div className="flex flex-col leading-tight py-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#7E8CA8] truncate">{r.title}</span>
                      <StatusBadgeLivestream status={r.status} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-[#7E8CA8]">Host: {r.host}</span>
                      <span className="text-[9px] text-[#4F5E7B] font-mono italic">#{r.id}</span>
                    </div>
                  </div>
                )
              })
            })}
            className="w-full md:w-[320px] h-[42px]"
            dropdownStyle={{ background: '#151D2C', color: '#ffffff', minWidth: 'min(350px, 90vw)' }}
            listHeight={400}
          />
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="whitespace-nowrap">Tải PDF</span>
          </button>
        </div>
      </div>

      {/* Title for print */}
      <div className="hidden print:block mb-4">
        <h1 className="text-3xl font-bold mb-2">Báo cáo Thống kê: {currentRoom.title}</h1>
        <p className="text-gray-500">ID Phiên: {currentRoom.id} | Ngày xuất: {new Date().toLocaleDateString()}</p>
        <hr className="my-4 border-gray-300" />
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-[#0D1424] print:border-gray-300 print:text-black border border-[#1E2633] rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="z-10">
              <p className="text-[#7E8CA8] print:text-gray-600 text-xs font-medium uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-white print:text-black mt-2">{card.value}</h3>
              <p className="text-[#4F5E7B] text-[10px] mt-1 font-medium">{card.desc}</p>
            </div>
            <div className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-300">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        <div className="lg:col-span-3 bg-[#0D1424] print:border-gray-300 border border-[#1E2633] rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-white print:text-black font-semibold mb-8">Viewer theo thời gian (60 phút)</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2633" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#7E8CA8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={9}
                />
                <YAxis
                  stroke="#7E8CA8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="viewers"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViewers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0D1424] print:border-gray-300 border border-[#1E2633] rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-white print:text-black font-semibold mb-8">Mật độ Comment mỗi phút</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2633" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#7E8CA8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={9}
                />
                <YAxis
                  stroke="#7E8CA8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="comments"
                  fill="#D4AF37"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}