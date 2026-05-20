'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Badge, Button, Input, Select, Table } from 'antd';
import { SESSION_STATUS, SESSION_PRIVACY } from '../../../../core/constants';
import { StatusBadgeLivestream, PrivacyBadgeLivestream } from '../components/StatusBadgeLivestream';
import { useNavigate } from 'react-router-dom';
import { AdminPanelService } from '../../../../api';
import RenderPages from '../components/RenderPages';

const api = new AdminPanelService();

const formatDate = (dateStr) => {
  if (!dateStr) return 'Chưa xác định';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

export default function SessionList({ isLoading, setTab, setSelectedRoomId }) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [recordingFilter, setRecordingFilter] = useState('all');
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  // Pagination & Server Side Filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  // Debounced search text state to prevent flooding backend API requests
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchData = async () => {
    try {
      setLocalLoading(true);
      const skip = (page - 1) * limit;

      const payload = {
        limit,
        skip,
      };

      if (debouncedSearchText) {
        payload.name = debouncedSearchText;
      }
      if (statusFilter && statusFilter !== 'all') {
        payload.status = statusFilter;
      }
      if (privacyFilter && privacyFilter !== 'all') {
        payload.privacy = privacyFilter;
      }
      // if (recordingFilter !== 'all') {
      //   payload.enabledRecording = recordingFilter === 'true';
      // }

      const res = await api.actGetLivestreamSessions(payload);
      console.log('actGetLivestreamSessions API response:', res);

      if (res) {
        const roomData = Array.isArray(res)
          ? res
          : (res.data && Array.isArray(res.data.data)
              ? res.data.data
              : (res.data && Array.isArray(res.data) ? res.data : []));

        const total = res.data?.totalItems || res.data?.total || roomData.length;

        setRooms(roomData);
        setTotalCount(total);
      }
    } catch (err) {
      console.error('Failed to get livestream sessions:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, statusFilter, privacyFilter, recordingFilter, debouncedSearchText]);

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePrivacyFilterChange = (val) => {
    setPrivacyFilter(val);
    setPage(1);
  };

  const handleRecordingFilterChange = (val) => {
    setRecordingFilter(val);
    setPage(1);
  };

  // Locally sort rooms to show live rooms first for better UX
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aStatus = a.info?.status;
      const bStatus = b.info?.status;
      if (aStatus === SESSION_STATUS.Live.value && bStatus !== SESSION_STATUS.Live.value) return -1;
      if (aStatus !== SESSION_STATUS.Live.value && bStatus === SESSION_STATUS.Live.value) return 1;
      return 0;
    });
  }, [rooms]);

  const handleChangeTab = (roomId) => {
    setSelectedRoomId(roomId);
    setTab('statistics');
  };

  const handleJoinStudio = (roomId, room) => {
    setSelectedRoomId(roomId);
    navigate(`/admin-host-studio/${roomId}`, { state: { roomInfo: room } });
  };

  const columns = [
    {
      title: 'Phiên Livestream',
      dataIndex: 'title',
      key: 'title',
      render: (_, room) => {
        const streamId = room.streamSettings?.streamId || room._id || room.id;
        const name = room.info?.name || 'Phiên live chưa đặt tên';
        const status = room.info?.status || 'created';
        const privacy = room.info?.privacy || 'public';
        const host = room.roles?.hostId || 'XHERO Host';
        const startAtStr = formatDate(room.info?.startAt);

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
                  #{streamId}
                </span>
                <span className="text-white font-semibold text-sm md:text-base line-clamp-1">
                  {name}
                </span>

                <StatusBadgeLivestream status={status} />
                <PrivacyBadgeLivestream privacy={privacy} />
              </div>

              <div className="mt-2 text-[#94A3B8] text-xs flex flex-wrap gap-x-4 gap-y-1">
                <span>Host: {host}</span>
                <span>Bắt đầu: {startAtStr}</span>
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
      render: (_, room) => {
        const viewers = room.peakViewers || room.viewers || 0;
        return (
          <span className="font-semibold text-white">
            {viewers.toLocaleString()}
          </span>
        );
      }
    },

    {
      title: 'Trạng thái ghi hình',
      dataIndex: 'recording',
      key: 'recording',
      width: 180,
      align: 'center',
      render: (_, room) => {
        const isRecording = room.recording?.enabled === true;
        return (
          <div className="flex items-center gap-2">
            <Badge
              color={isRecording ? '#ef4444' : '#6b7280'}
            />
            <span className="text-sm text-[#CBD5E1]">
              {isRecording ? 'Đang ghi hình' : 'Không ghi hình'}
            </span>
          </div>
        );
      }
    },

    {
      title: 'Hành động',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, room) => {
        const streamId = room.streamSettings?.streamId || room._id || room.id;
        return (
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => handleJoinStudio(streamId, room)}
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
              onClick={() => handleChangeTab(streamId)}
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
        );
      }
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
            onChange={handleStatusFilterChange}
            className="!w-full md:!w-[180px]"
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: SESSION_STATUS.Live.label, value: SESSION_STATUS.Live.value },
              { label: SESSION_STATUS.Created.label, value: SESSION_STATUS.Created.value },
              { label: SESSION_STATUS.Ended.label, value: SESSION_STATUS.Ended.value },
              { label: SESSION_STATUS.Cancelled.label, value: SESSION_STATUS.Cancelled.value },
            ]}
          />

          <Select
            value={privacyFilter}
            onChange={handlePrivacyFilterChange}
            className="!w-full md:!w-[180px]"
            options={[
              { label: 'Tất cả quyền riêng tư', value: 'all' },
              { label: `${SESSION_PRIVACY.Public.label} (Public)`, value: SESSION_PRIVACY.Public.value },
              { label: `${SESSION_PRIVACY.Private.label} (Private)`, value: SESSION_PRIVACY.Private.value },
              { label: `${SESSION_PRIVACY.Unlisted.label} (Unlisted)`, value: SESSION_PRIVACY.Unlisted.value },
            ]}
          />

          {/* <Select
            value={recordingFilter}
            onChange={handleRecordingFilterChange}
            className="!w-full md:!w-[180px]"
            options={[
              { label: 'Tất cả ghi hình', value: 'all' },
              { label: 'Có bản ghi', value: 'true' },
              { label: 'Không có bản ghi', value: 'false' },
            ]}
          /> */}
        </div>
      </div>

      {/* Table */}
      <div className="!p-4">
        <Table
          rowKey={(record) => record.streamSettings?.streamId || record._id || record.id}
          columns={columns}
          dataSource={sortedRooms}
          loading={isLoading || localLoading}
          pagination={false}
          bordered
          className="xh-admin-table"
          scroll={{
            x: 1200,
            y: 600,
          }}
        />
      </div>

      {/* Pagination Footer */}
      <div className="sticky bottom-0 border-t border-[#1E2633] shadow-[0px_-1px_4px_0px_rgba(0,0,0,0.1)]">
        <RenderPages
          page={page}
          limit={limit}
          totalCount={totalCount}
          tototlItems={rooms.length}
          onChange={(newPage, newLimit) => {
            if (newLimit !== limit) {
              setLimit(newLimit);
              setPage(1);
            } else {
              setPage(newPage);
            }
          }}
        />
      </div>
    </section>
  );
}