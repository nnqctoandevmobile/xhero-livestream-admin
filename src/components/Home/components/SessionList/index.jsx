'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Button, Input, Select, Space, Table, Tag } from 'antd';
import { SESSION_STATUS } from '../../../../core/constants';
import StatusBadgeLivestream from '../components/StatusBadgeLivestream';

const badgeConfig = {
  [SESSION_STATUS.Live]: {
    text: 'LIVE',
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] animate-pulse',
  },
  [SESSION_STATUS.Ended]: {
    text: 'Đã kết thúc',
    className: 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border border-[rgba(148,163,184,0.3)]',
  },
  [SESSION_STATUS.Scheduled]: {
    text: 'Sắp diễn ra',
    className: 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]',
  },
};


export default function SessionList({ rooms, isLoading, handleChangeTab }) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAndSortedRooms = useMemo(() => {
    let result = rooms || [];

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(r => 
        (r.title && r.title.toLowerCase().includes(lowerSearch)) ||
        (r.host && r.host.toLowerCase().includes(lowerSearch)) ||
        (r.id && r.id.toString().toLowerCase().includes(lowerSearch))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    return [...result].sort((a, b) => {
      if (a.status === SESSION_STATUS.Live && b.status !== SESSION_STATUS.Live) return -1;
      if (a.status !== SESSION_STATUS.Live && b.status === SESSION_STATUS.Live) return 1;
      return 0;
    });
  }, [rooms, searchText, statusFilter]);


  const columns = [
    {
      title: 'Phiên Livestream',
      dataIndex: 'title',
      key: 'title',
      render: (_, room) => {
        return (
          <div className="flex items-start gap-3">

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="
                    w-fit h-7 rounded-lg
                    !px-2
                    bg-[#111827]
                    border border-[#1E2633]
                    flex items-center justify-center
                    text-[#D4AF37]
                    text-xs font-bold
                    shrink-0
                  "
                >
                  #{room.id}
                </span>
                <span className="text-white font-semibold text-sm md:text-base line-clamp-1">
                  {room.title}
                </span>

                <StatusBadgeLivestream status={room.status} />
              </div>

              <div className="mt-2 text-[#94A3B8] text-xs flex flex-wrap gap-x-4 gap-y-1">
                <span>Host: {room.host}</span>
                <span>{room.dateStr} • {room.timeStr}</span>
              </div>
            </div>
          </div>
        );
      }
    },

    {
      title: 'Số người xem tại mốc đỉnh điểm',
      dataIndex: 'peakViewers',
      key: 'peakViewers',
      width: 180,
      align: 'center',
      render: (_, room) => (
        <span className="font-semibold text-white">
          {(room.peakViewers || room.viewers).toLocaleString()}
        </span>
      ),
    },

    {
      title: 'Trạng thái ghi hình',
      dataIndex: 'recording',
      key: 'recording',
      width: 180,
      align: 'center',
      render: (_, room) => (
        <div className="flex items-center gap-2">

          <Badge
            color={room.recording ? '#ef4444' : '#6b7280'}
          />

          <span className="text-sm text-[#CBD5E1]">
            {room.recording
              ? 'Đang ghi hình'
              : 'Không ghi hình'}
          </span>
        </div>
      ),
    },

    {
      title: 'Hành động',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, room) => (
        <div className="flex flex-col gap-2 w-full">

          <Button
            type="primary"
            className="
              !bg-[#D4AF37]
              !border-[#D4AF37]
              !text-black
              !font-semibold
              hover:!opacity-90
              w-full
            "
          >
            Vào Studio
          </Button>

          <Button
            onClick={() => handleChangeTab('statistics')}
            className="
              !bg-[#182235]
              !border-[#2A3547]
              !text-white
              hover:!border-[#D4AF37]
              w-full
            "
          >
            Thống kê
          </Button>

          <Button
            className="
              !bg-transparent
              !border-[#2A3547]
              !text-[#CBD5E1]
              hover:!border-[#D4AF37]
              hover:!text-white
              w-full
            "
          >
            Chỉnh sửa
          </Button>

        </div>
      ),
    },
  ];

  return (
    <section
      className="
        bg-[#0D1424]
        border border-[#1E2633]
        rounded-2xl
        overflow-hidden
      "
    >

      {/* Header */}
      <div
        className="
          !px-6 !py-5
          border-b border-[#1E2633]
          flex flex-col xl:flex-row
          xl:items-center
          xl:justify-between
          gap-4
        "
      >

        <div>
          <h3 className="text-lg font-semibold text-white">
            Danh sách phiên
          </h3>

          <p className="text-sm text-[#7E8CA8] mt-1">
            Quản lý livestream sessions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">

          <Input
            placeholder="Tìm kiếm phiên..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="
              !w-full md:!w-[260px]
              [&_.ant-input]:!bg-[#111827]
            "
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="!w-full md:!w-[180px]"
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'LIVE', value: SESSION_STATUS.Live },
              { label: 'Sắp diễn ra', value: SESSION_STATUS.Scheduled },
              { label: 'Đã kết thúc', value: SESSION_STATUS.Ended },
              { label: 'Nháp', value: SESSION_STATUS.Draft },
              { label: 'Đang trong phòng chờ', value: SESSION_STATUS.WaitingRoom },
              { label: 'Đang tạm dừng', value: SESSION_STATUS.Paused },
              { label: 'Có bản phát lại', value: SESSION_STATUS.ReplayAvailable },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="!p-4">

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredAndSortedRooms}
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
          }}
          bordered
          className="xh-admin-table"
          scroll={{
            x: 1200,
            y: 600,
          }}
        />
      </div>
    </section>
  );
}