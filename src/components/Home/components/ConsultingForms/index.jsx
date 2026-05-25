import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tooltip, Select, DatePicker, Typography, message, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import { AdminPanelService } from '../../../../api';

const { RangePicker } = DatePicker;
const { Paragraph } = Typography;

const adminPanelService = new AdminPanelService();

export default function ConsultingForms({ defaultSessionFilter }) {
  const [forms, setForms] = useState([]);

  // Filter States
  const [sessionFilter, setSessionFilter] = useState(defaultSessionFilter || 'all');

  useEffect(() => {
    if (defaultSessionFilter) {
      setSessionFilter(defaultSessionFilter);
    }
  }, [defaultSessionFilter]);
  const [dateRange, setDateRange] = useState(null);

  // Masking Config (Can be tied to auth logic later)
  const isMasked = true; // Hardcoded for now based on BA requirements

  useEffect(() => {
    const getForms = async () => {
      try {
        const response = await adminPanelService.actGetConsultingForms();
        if (response.success) {
          setForms(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    // getForms(); // Using mockData for demo
  }, []);

  const mockData = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      dob: '1990-05-12',
      address: 'Quận 1, TP. Hồ Chí Minh',
      submittedAt: '2026-05-13T09:15:00',
      question: 'Tôi muốn tư vấn về khóa học Livestream cơ bản cho người mới bắt đầu.',
      sessionName: 'Livestream Ra mắt sản phẩm',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      phone: '0987654321',
      dob: '1995-08-22',
      address: 'Cầu Giấy, Hà Nội',
      submittedAt: '2026-05-13T08:30:00',
      question: 'Chi phí cho khóa học nâng cao là bao nhiêu? Có hỗ trợ thiết bị không? Tôi muốn mua sỉ số lượng lớn và hợp tác mở đại lý thì chính sách ra sao?',
      sessionName: 'Q&A Khóa học nâng cao',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      phone: '0912345678',
      dob: '1998-11-05',
      address: 'Hải Châu, Đà Nẵng',
      submittedAt: '2026-05-12T20:45:00',
      question: 'Tôi muốn đăng ký làm idol độc quyền của công ty thì cần điều kiện gì?',
      sessionName: 'Tuyển dụng KOC',
    },
  ];

  // Compute filtered data
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      // 1. Session Filter
      if (sessionFilter !== 'all' && item.sessionName !== sessionFilter) {
        return false;
      }
      // 2. Date Range Filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = dayjs(item.submittedAt);
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        if (itemDate.isBefore(start) || itemDate.isAfter(end)) {
          return false;
        }
      }
      return true;
    });
  }, [dateRange, sessionFilter]); // mockData should ideally be a state dependency, but statically mapped here

  // Extract unique sessions for the filter dropdown
  const uniqueSessions = useMemo(() => {
    const sessions = new Set(mockData.map(item => item.sessionName));
    return ['all', ...Array.from(sessions)];
  }, []);

  const maskPhone = (phone) => {
    if (!phone) return '—';
    if (!isMasked) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (text, record, index) => <span className="text-[#A6B5D6]">{index + 1}</span>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      render: (text) => <span className="text-[#A6B5D6]">{maskPhone(text)}</span>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      width: 130,
      sorter: (a, b) => dayjs(a.dob).valueOf() - dayjs(b.dob).valueOf(),
      render: (text) => <span className="text-[#A6B5D6]">{dayjs(text).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
      render: (text) => (
        <Tooltip title={text} placement="topLeft" color="#151D2C">
          <div className="text-[#CBD5E1] truncate">{text || '—'}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Câu hỏi / Nhu cầu tư vấn',
      dataIndex: 'question',
      key: 'question',
      width: 300,
      render: (text) => (
        <Paragraph
          className="!text-[#CBD5E1] !mb-0"
          ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
        >
          {text || '—'}
        </Paragraph>
      ),
    },
    {
      title: 'Phiên live',
      dataIndex: 'sessionName',
      key: 'sessionName',
      width: 200,
      sorter: (a, b) => (a.sessionName || '').localeCompare(b.sessionName || ''),
      render: (text) => (
        <div className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded w-fit text-xs font-semibold">
          {text || '—'}
        </div>
      ),
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      sorter: (a, b) => dayjs(a.submittedAt).valueOf() - dayjs(b.submittedAt).valueOf(),
      render: (text) => <span className="text-[#A6B5D6]">{dayjs(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
  ];

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      message.warning('Không có dữ liệu để xuất!');
      return;
    }

    // Prepare CSV header
    const headers = ['STT', 'Họ và tên', 'Số điện thoại', 'Ngày sinh', 'Địa chỉ', 'Câu hỏi', 'Phiên live', 'Thời gian gửi'];

    // Process rows
    const rows = filteredData.map((row, index) => {
      return [
        index + 1,
        `"${row.name || ''}"`,
        `"${maskPhone(row.phone)}"`,
        `"${row.dob ? dayjs(row.dob).format('DD/MM/YYYY') : ''}"`,
        `"${row.address || ''}"`,
        `"${(row.question || '').replace(/"/g, '""')}"`, // escape quotes in question
        `"${row.sessionName || ''}"`,
        `"${row.submittedAt ? dayjs(row.submittedAt).format('DD/MM/YYYY HH:mm') : ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Add BOM for UTF-8 encoding support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FormTuVan_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Xuất file CSV thành công!');
  };

  return (
    <section className="bg-[#0D1424] border border-[#1E2633] rounded-2xl overflow-hidden flex flex-col">
      <div className="!px-6 !py-5 border-b border-[#1E2633] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">Form đăng ký tư vấn</h3>
          <p className="text-sm text-[#7E8CA8] mt-1">Quản lý các yêu cầu tư vấn từ khách hàng</p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              components: {
                Select: {
                  colorBgContainer: '#151D2C',
                  colorBorder: '#2A3441',
                }
              }
            }}
          >
            <Select
              value={sessionFilter}
              onChange={setSessionFilter}
              className="w-full sm:w-[200px]"
              options={uniqueSessions.map(s => ({
                label: s === 'all' ? 'Tất cả phiên live' : s,
                value: s
              }))}
              dropdownStyle={{ background: '#151D2C', color: '#fff' }}
            />
          </ConfigProvider>

          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              components: {
                DatePicker: {
                  colorBgContainer: '#151D2C',
                  colorBorder: '#2A3441',
                  colorPrimary: '#3B82F6',
                }
              }
            }}
          >
            <RangePicker
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              className="w-full sm:w-auto"
            />
          </ConfigProvider>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-[7px] bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="!p-4 flex-1">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          bordered
          className="xh-admin-table"
          scroll={{ x: 1400, y: 'calc(100vh - 280px)' }}
        />
      </div>
    </section>
  );
}