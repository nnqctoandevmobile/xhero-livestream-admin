import React from 'react';
import { Form } from 'antd';
import ConfigSection from '../components/ConfigSection';
import ConfigTab from '../components/ConfigTab';

export default function Encoding() {
  return (
    <ConfigTab
      title="Encoding profiles"
      description="Các tầng chất lượng tự động tạo khi phát sóng. Viewer chọn chất lượng phù hợp đường truyền. Tương ứng encoderSettingsList trong stream object."
    >
      <ConfigSection
        title="Ladder chất lượng (Adaptive Bitrate)"
        buttonTitle="+ Thêm tầng"
      >
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider border-b border-[#1E2633]">
                <th className="pb-3 w-20">Tên tầng</th>
                <th className="pb-3 w-32">Chiều cao (px)</th>
                <th className="pb-3 w-32">Video (kbps)</th>
                <th className="pb-3 w-32">Audio (kbps)</th>
                <th className="pb-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2633]/50 text-sm">
              <tr>
                <td className="py-3 text-white">Full HD</td>
                <td className="py-3">
                  <Form.Item name="encodingFullHDHeight" initialValue="1080" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingFullHDVideo" initialValue="4000" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingFullHDAudio" initialValue="192" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="p-1.5 border border-[#1E2633] rounded-md hover:bg-[#1E2633] text-[#7E8CA8]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white">HD</td>
                <td className="py-3">
                  <Form.Item name="encodingHDHeight" initialValue="720" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingHDVideo" initialValue="2000" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingHDAudio" initialValue="128" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="p-1.5 border border-[#1E2633] rounded-md hover:bg-[#1E2633] text-[#7E8CA8]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white">SD</td>
                <td className="py-3">
                  <Form.Item name="encodingSDHeight" initialValue="480" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingSDVideo" initialValue="800" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingSDAudio" initialValue="96" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="p-1.5 border border-[#1E2633] rounded-md hover:bg-[#1E2633] text-[#7E8CA8]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-white">Low</td>
                <td className="py-3">
                  <Form.Item name="encodingLowHeight" initialValue="360" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingLowVideo" initialValue="400" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <Form.Item name="encodingLowAudio" initialValue="64" noStyle>
                    <input
                      type="text"
                      className="w-24 bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-1.5 text-white outline-none"
                    />
                  </Form.Item>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="p-1.5 border border-[#1E2633] rounded-md hover:bg-[#1E2633] text-[#7E8CA8]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ConfigSection>

      <ConfigSection title="Ngưỡng cảnh báo chất lượng">
        <div className="p-4">
          <div className="bg-[#1E2633]/30 border border-[#1E2633] rounded-xl p-4 mb-6">
            <p className="text-xs text-[#7E8CA8]">
              Các ngưỡng này được dùng để hiện cảnh báo realtime cho Admin khi phiên đang live. Map từ các trường
              dropPacketCountInIngestion, packetLostRatio, jitterMs, rttMs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                PACKET LOST RATIO CẢNH BÁO (%)
              </label>
              <Form.Item name="warnPacketLostRatio" initialValue="5" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">packetLostRatio — &gt; 5% hiện warning trên dashboard</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                JITTER CẢNH BÁO (MS)
              </label>
              <Form.Item name="warnJitterMs" initialValue="100" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">jitterMs — &gt; 100ms hiện warning</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                RTT CẢNH BÁO (MS)
              </label>
              <Form.Item name="warnRttMs" initialValue="200" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">rttMs — Round-trip time, &gt; 200ms có thể giật</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">
                DROP FRAME LIMIT (FRAMES)
              </label>
              <Form.Item name="warnDropFrameLimit" initialValue="50" noStyle>
                <input
                  type="text"
                  className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </Form.Item>
              <p className="text-[10px] text-[#4F5E7B] mt-1">dropFrameCountInEncoding</p>
            </div>
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}