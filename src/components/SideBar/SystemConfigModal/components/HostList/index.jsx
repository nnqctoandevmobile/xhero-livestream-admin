import { Select } from "antd";
import ConfigTab from "../components/ConfigTab";
import ConfigSection from "../components/ConfigSection";
import { useState } from "react";
import images from "../../../../../config/images";

export default function HostList() {
  const [hosts, setHosts] = useState([
    {
      name: 'Nguyễn Trọng Mạnh',
      phone: '84972175295',
      _id: 'host_001',
      status: 'active',
    },
    {
      name: 'Lê Thị Hương',
      phone: '84901234567',
      _id: 'host_002',
      status: 'active',
    },
    {
      name: 'Trần Văn Tuấn',
      phone: '84972175295',
      _id: 'host_003',
      status: 'inactive',
    },
  ])

  return (
    <ConfigTab
      title="Danh sách host"
      description="Chỉ những người được thêm vào đây mới xuất hiện trong dropdown khi Admin tạo phiên live. Flag isHostLivestream: true được gán từ đây.">

      <ConfigSection
        title={`Host đang hoạt động (${hosts.length})`}
        buttonTitle="+ Thêm host mới">
        {hosts.map((host) => {
          return (
            <div className={`flex items-center justify-between p-3 bg-[#0D1424] rounded-lg border border-[#1E2633] ${host.status === 'inactive' ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">{host.avatar || images.lmsLG}</div>
                <div>
                  <div className="text-sm font-bold text-white">{host.name}</div>
                  <div className="text-xs text-[#7E8CA8]">@{host.phone} • {host._id}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold ${host.status === 'active' ? 'text-[#10B981]' : 'text-[#7E8CA8]'}`}>{host.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng hoạt động'}</span>
                <div className="flex gap-2">
                  <button className="p-2 border border-[#1E2633] rounded-lg hover:bg-[#1E2633] transition-colors"><svg className="w-4 h-4 text-[#7E8CA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button className="p-2 border border-[#1E2633] rounded-lg hover:bg-[#1E2633] transition-colors"><svg className="w-4 h-4 text-[#7E8CA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          );
        })}
      </ConfigSection>

      <ConfigSection
        title="Thêm host từ user có sẵn">
        <div className="border border-[#1E2633] rounded-xl bg-[#151D2C] overflow-hidden">
          <div className="p-4 border-b border-[#1E2633]">
            <h3 className="font-bold text-white text-sm">Thêm host từ user có sẵn</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">TÌM USER</label>
                <input type="text" placeholder="Nhập tên, SDT, hoặc email" className="w-full bg-[#0D1424] border border-[#2A3441] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-2">VAI TRÒ MẶC ĐỊNH</label>
                <Select defaultValue="host" className="w-full custom-dark-select h-[42px]" options={[{ value: 'host', label: 'Host chính (host)' }]} />
              </div>
            </div>
            <button className="px-4 py-2 bg-[#1E2633] hover:bg-[#2A3441] text-white text-sm font-bold rounded-lg transition-colors border border-[#2A3441]">Gán quyền host</button>
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}