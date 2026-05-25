import React from 'react';
import { Form } from 'antd';
import ConfigTab from '../components/ConfigTab';
import ConfigSection from '../components/ConfigSection';
import SwitchInput from '../components/SwitchInput';

export default function ViewerLimit() {
  return (
    <ConfigTab
      title="Viewer limits"
      description="Giới hạn số người xem đồng thời theo từng giao thức. 0 = không giới hạn. Tương ứng webRTCViewerLimit, hlsViewerLimit, dashViewerLimit."
    >
      {/* Current Limits Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#151D2C] border border-[#1E2633] rounded-xl p-4">
          <div className="text-xs text-[#7E8CA8] mb-1 font-semibold">WebRTC limit hiện tại</div>
          <div className="text-2xl font-bold text-white">200</div>
        </div>
        <div className="bg-[#151D2C] border border-[#1E2633] rounded-xl p-4">
          <div className="text-xs text-[#7E8CA8] mb-1 font-semibold">HLS limit hiện tại</div>
          <div className="text-2xl font-bold text-white">5,000</div>
        </div>
        <div className="bg-[#151D2C] border border-[#1E2633] rounded-xl p-4">
          <div className="text-xs text-[#7E8CA8] mb-1 font-semibold">DASH limit hiện tại</div>
          <div className="text-2xl font-bold text-white">Không giới hạn</div>
        </div>
      </div>

      <ConfigSection title="Chỉnh sửa giới hạn">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                WEBRTC VIEWER LIMIT
              </label>
              <Form.Item name="webRTCViewerLimit" initialValue="200" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                webRTCViewerLimit — viewer xem qua WebRTC (độ trễ thấp)
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                HLS VIEWER LIMIT
              </label>
              <Form.Item name="hlsViewerLimit" initialValue="5000" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                hlsViewerLimit — viewer xem qua HLS (scalable)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                DASH VIEWER LIMIT
              </label>
              <Form.Item name="dashViewerLimit" initialValue="0" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                dashViewerLimit — 0 = không giới hạn
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                WEBRTC VIEWER COUNT HIỆN TẠI
              </label>
              <input
                type="text"
                defaultValue="0"
                readOnly
                disabled
                className="w-full bg-[#0D1424] border border-[#1E2633] rounded-lg px-3 py-2.5 text-sm text-[#7E8CA8] opacity-60 outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-[#4F5E7B] mt-1">
                webRTCViewerCount — đọc từ stream realtime, không chỉnh sửa
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1E2633]/50">
            <SwitchInput
              name="zombieModeEnabled"
              initialValue={true}
              title="Zombie mode (stream không có viewer)"
              description="zombi — tự động kết thúc stream nếu không có ai xem sau X phút"
            />
            <SwitchInput
              name="anyoneWatchingEnabled"
              initialValue={true}
              title='Theo dõi "anyone watching"'
              description="anyoneWatching — check xem có viewer nào đang xem không"
            />
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}
