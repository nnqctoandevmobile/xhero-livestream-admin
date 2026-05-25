import React from 'react';
import { Select, Form } from 'antd';
import ConfigTab from '../components/ConfigTab';
import ConfigSection from '../components/ConfigSection';
import SwitchInput from '../components/SwitchInput';

const DURATION_OPTIONS = [
  { label: '45 phút', value: '45m' },
  { label: '60 phút', value: '60m' },
  { label: '90 phút', value: '90m' },
  { label: '120 phút', value: '120m' },
  { label: '150 phút', value: '150m' },
  { label: '180 phút', value: '180m' },
  { label: 'Tùy chỉnh', value: 'custom' },
];

function DurationSelector({ value = [], onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATION_OPTIONS.map((opt) => {
        const isActive = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              const newValue = isActive
                ? value.filter((v) => v !== opt.value)
                : [...value, opt.value];
              if (onChange) {
                onChange(newValue);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isActive
                ? 'bg-[#0f2e20] text-[#10B981] border-[#10B981]'
                : 'bg-[#1E2633] text-[#7E8CA8] border-[#2A3441] hover:border-white hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function StreamConfig() {
  return (
    <ConfigTab
      title="Cấu hình stream"
      description="Cấu hình mặc định áp dụng cho tất cả phiên live mới. Có thể ghi đè khi tạo từng phiên."
    >
      <div className="bg-[#1E2633]/30 border border-[#1E2633] rounded-xl p-4 mb-6">
        <p className="text-xs text-[#7E8CA8]">
          Các giá trị này map trực tiếp vào publishType, mp4Enabled, bitrate, width, height của Ant Media stream object.
        </p>
      </div>

      <ConfigSection title="Phương thức phát sóng">
        <div className="p-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                PUBLISH TYPE MẶC ĐỊNH
              </label>
              <Form.Item name="publishType" initialValue="webrtc" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[{ value: 'webrtc', label: 'WebRTC (thấp trễ, khuyến nghị)' }]}
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">Tương ứng với publishType trong stream object</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                ĐỘ PHÂN GIẢI MẶC ĐỊNH
              </label>
              <Form.Item name="resolution" initialValue="720p" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[{ value: '720p', label: '1280 x 720 (HD)' }]}
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">width x height</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                BITRATE VIDEO (KBPS)
              </label>
              <Form.Item name="bitrateVideo" initialValue="2000" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[{ value: '2000', label: '2000' }]}
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">bitrate — nên chọn 2000+ cho HD</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                BITRATE AUDIO (KBPS)
              </label>
              <Form.Item name="bitrateAudio" initialValue="128" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[{ value: '128', label: '128' }]}
                />
              </Form.Item>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1E2633]">
            <SwitchInput
              name="mp4Enabled"
              initialValue={true}
              title="Lưu file MP4 sau phiên"
              description="mp4Enabled — lưu bản ghi để xem lại (VOD)"
            />
            <SwitchInput
              name="webmEnabled"
              initialValue={false}
              title="Lưu file WebM"
              description="webmEnabled — định dạng phụ cho browser cũ"
            />
            <SwitchInput
              name="publicStream"
              initialValue={true}
              title="Cho phép xem public"
              description="publicStream — tắt nếu chỉ hội viên có quyền xem"
            />
            <SwitchInput
              name="autoStartStopEnabled"
              initialValue={true}
              title="Auto start / stop theo lịch"
              description="autoStartStopEnabled — tự động bật/tắt theo plannedStartDate và plannedEndDate"
            />
          </div>
        </div>
      </ConfigSection>

      <div className="border border-[#1E2633] rounded-xl bg-[#151D2C] overflow-hidden mb-6">
        <div className="p-4 border-b border-[#1E2633]">
          <h3 className="font-bold text-white text-sm">Thời lượng phiên (options)</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-3">
              ADMIN CHỌN NHANH KHI TẠO PHIÊN — TƯƠNG ỨNG PLANNEDENDDATE - PLANNEDSTARTDATE
            </label>
            <Form.Item name="sessionDurations" initialValue={['45m', '60m', '90m', '120m', '150m']} noStyle>
              <DurationSelector />
            </Form.Item>
            <p className="text-[10px] text-[#4F5E7B] mt-3">
              Chỉ hiển thị các option được chọn ở đây trong dropdown tạo phiên
            </p>
          </div>
        </div>
      </div>

      <div className="border border-[#1E2633] rounded-xl bg-[#151D2C] overflow-hidden">
        <div className="p-4 border-b border-[#1E2633]">
          <h3 className="font-bold text-white text-sm">Timeout và bảo vệ stream</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                MAX IDLE TIME (GIÂY)
              </label>
              <Form.Item name="maxIdleTime" initialValue="120" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                maxIdleTime — tự động kết thúc nếu host ngắt kết nối quá X giây
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                STREAM KEY HẾT HẠN SAU (MS)
              </label>
              <Form.Item name="expireDurationMS" initialValue="86400000" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                expireDurationMS — 86400000 = 24h
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                PENDING PACKET BUFFER
              </label>
              <Form.Item name="pendingPacketSize" initialValue="5000" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                pendingPacketSize — giảm nếu lag, tăng nếu mất khung
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                SUBTRACK LIMIT
              </label>
              <Form.Item name="subtracksLimit" initialValue="20" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                subtracksLimit — số lượng cam tối đa (multi-track)
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConfigTab>
  );
}