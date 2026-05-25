import React from 'react';
import { Select, Form } from 'antd';
import ConfigTab from '../components/ConfigTab';
import ConfigSection from '../components/ConfigSection';
import SwitchInput from '../components/SwitchInput';

export default function HLSPlayback() {
  return (
    <ConfigTab
      title="HLS và Playback"
      description="Cấu hình cách HLS segment được tạo và phân phối. Tương ứng hlsParameters và các trường liên quan trong stream object."
    >
      <ConfigSection title="HLS Parameters">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                SEGMENT TIME (GIÂY)
              </label>
              <Form.Item name="hlsTime" initialValue="2" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                hisTime — segment ngắn = độ trễ thấp hơn
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                LIST SIZE
              </label>
              <Form.Item name="hlsListSize" initialValue="5" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                hlsListSize — số segment giữ trong playlist
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                PLAYLIST TYPE
              </label>
              <Form.Item name="hlsPlayListType" initialValue="event" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[{ value: 'event', label: 'event' }]}
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                hlsPlayListType
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1E2633]/50">
            <SwitchInput
              name="playlistLoopEnabled"
              initialValue={false}
              title="Playlist loop (VOD)"
              description="playlistLoopEnabled — lặp lại VOD playlist khi hết"
            />
            <SwitchInput
              name="is360"
              initialValue={false}
              title="360 stream"
              description="is360 — bật nếu dùng camera 360 độ"
            />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="CDN và subfolder">
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
              CDN / ORIGIN ADDRESS
            </label>
            <Form.Item name="originAdress" initialValue="https://cdn.xhero.live" noStyle>
              <input
                type="text"
                className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </Form.Item>
            <p className="text-[10px] text-[#4F5E7B] mt-1">
              originAdress — địa chỉ phân phối HLS tới viewer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                SUBFOLDER LƯU STREAM
              </label>
              <Form.Item name="subFolder" initialValue="xhero-sessions" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                subFolder — thư mục trên server
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                SEEK TIME MẶC ĐỊNH (MS)
              </label>
              <Form.Item name="seekTimeInMs" initialValue={0} noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                seekTimeInMs — bắt đầu từ vị trí nào (ms)
              </p>
            </div>
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}
