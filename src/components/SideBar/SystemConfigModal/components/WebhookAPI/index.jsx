import React from 'react';
import { Select, Form } from 'antd';
import ConfigTab from '../components/ConfigTab';
import ConfigSection from '../components/ConfigSection';

export default function WebhookAPI() {
  return (
    <ConfigTab
      title="Webhook và API"
      description="Cấu hình endpoint nhận sự kiện từ Ant Media Server khi có thay đổi trạng thái stream. Tương ứng listenerHookURL và endPointList."
    >
      <ConfigSection title="Listener Hook URL">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
              HOOK URL (LISTENERHOOKURL)
            </label>
            <Form.Item name="listenerHookURL" initialValue="https://api.xhero.live/webhooks/ant-media" noStyle>
              <input
                type="text"
                className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </Form.Item>
            <p className="text-[10px] text-[#4F5E7B] mt-1">
              Ant Media gọi POST tới đây mỗi khi stream bắt đầu, kết thúc, hoặc có lỗi
            </p>
          </div>

          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4">
            <p className="text-xs text-[#7E8CA8] leading-relaxed">
              Các event được gửi: <span className="text-white font-semibold">streamStarted</span> (chuyển trạng thái phòng &rarr; LIVE trên Firebase), <span className="text-white font-semibold">streamFinished</span> (kích hoạt VOD processing), <span className="text-white font-semibold">publishStarted</span>, <span className="text-white font-semibold">publishFinished</span>, <span className="text-white font-semibold">firstKeyFrameReceived</span>.
            </p>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Endpoint list (re-stream)"
        buttonTitle="+ Thêm endpoint"
      >
        <div className="space-y-4">
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4">
            <p className="text-xs text-[#7E8CA8] leading-relaxed">
              Re-stream đồng thời tới YouTube, Facebook, hoặc bất kỳ RTMP endpoint nào. Tương ứng <span className="text-white font-semibold">endPointList</span>.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
              ENDPOINT URL
            </label>
            <Form.Item name="endpointURL" noStyle>
              <input
                type="text"
                placeholder="rtmp://a.rtmp.youtube.com/live2/..."
                className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                LOẠI
              </label>
              <Form.Item name="endpointType" initialValue="youtube" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'custom', label: 'Custom RTMP' },
                  ]}
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                TRẠNG THÁI
              </label>
              <Form.Item name="endpointStatus" initialValue="active" noStyle>
                <Select
                  className="w-full custom-dark-select h-[42px]"
                  options={[
                    { value: 'active', label: 'active' },
                    { value: 'inactive', label: 'inactive' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}
