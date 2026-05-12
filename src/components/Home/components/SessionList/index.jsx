'use client';

import { Badge, Button, Input, Select, Space, Table, Tag } from 'antd';

const badgeConfig = {
  LIVE: {
    text: 'LIVE',
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] animate-pulse',
  },
  ENDED: {
    text: 'Đã kết thúc',
    className: 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border border-[rgba(148,163,184,0.3)]',
  },
  SCHEDULED: {
    text: 'Sắp diễn ra',
    className: 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]',
  },
  OFFLINE: {
    text: 'Đã offline',
    className: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.3)]',
  }
};


export default function SessionList({ rooms, isLoading }) {

  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
    return 0;
  });


  const columns = [
    {
      title: 'Phiên Livestream',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      width: '100%',
      render: (_, room) => {
        const config = badgeConfig[room.status] || {
          text: room.status,
          className: 'bg-gray-100 text-gray-600',
        }

        return (
          <div className="flex items-start gap-3">

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="
              w-fit h-11 rounded-xl
              !px-2
              bg-[#111827]
              border border-[#1E2633]
              flex items-center justify-center
              text-[#D4AF37]
              text-sm font-bold
              shrink-0
            "
                >
                  #{room.id}
                </span>
                <span className="text-white font-semibold text-sm">
                  {room.title}
                </span>

                <div className={`flex items-center justify-center px-2 py-1 gap-[6px] rounded-xl ${config.className} text-sm/[140%] tracking-[2%] font-medium inline-block`}>
                  {config.text}
                </div>

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
        <Space size={10} wrap className="flex flex-col">

          <Button
            type="primary"
            className="
              !bg-[#D4AF37]
              !border-[#D4AF37]
              !text-black
              !font-semibold
              hover:!opacity-90
            "
          >
            Vào Studio
          </Button>

          <Button
            className="
              !bg-[#182235]
              !border-[#2A3547]
              !text-white
              hover:!border-[#D4AF37]
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
            "
          >
            Chỉnh sửa
          </Button>

        </Space>
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
            className="
              !w-[260px]
              [&_.ant-input]:!bg-[#111827]
            "
          />

          <Select
            defaultValue="all"
            className="!w-[180px]"
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'LIVE', value: 'LIVE' },
              { label: 'Offline', value: 'OFFLINE' },
              { label: 'Sắp diễn ra', value: 'SCHEDULED' },
              { label: 'Đã kết thúc', value: 'ENDED' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="!p-4">

        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedRooms}
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
          }}
          bordered
          className="xh-admin-table"
          scroll={{
            y: 600,
          }}
        />
      </div>
    </section>
  );
}