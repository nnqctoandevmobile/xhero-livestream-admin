import React, { useState, useEffect } from 'react';
import { message, Switch, Modal, Input, Select, Button, Tag, ConfigProvider, theme } from 'antd';
import { 
  UserOutlined, VideoCameraOutlined, BarChartOutlined, PlayCircleOutlined, 
  BellOutlined, CloudUploadOutlined, TeamOutlined, SaveOutlined, ReloadOutlined,
  PlusOutlined, DeleteOutlined, SearchOutlined, PoweroffOutlined
} from '@ant-design/icons';

const DEFAULT_CONFIG = {
  hosts: [
    { id: 'host1', name: 'Nguyễn Quốc Toàn', role: 'Host chính', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 'host2', name: 'Trần Minh Hoàng', role: 'Host phụ', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 'host3', name: 'Phan Cát Tường', role: 'Presenter', status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
  ],
  stream: {
    publishType: 'WebRTC',
    resolution: '1280x720',
    bitrate: 2000,
    audioBitrate: 128,
    mp4Enabled: true,
    webMEnabled: false,
    publicStream: true,
    autoStartStopEnabled: true,
    durations: ['60', '120', '180', '240'],
    durationsEnabled: { '45': false, '90': false, '150': false, 'custom': true },
    maxIdleTime: 120,
    expireDurationMS: 86400000,
    pendingPacketSize: 5000,
    subtracksLimit: 20
  },
  encoding: {
    levels: [
      { id: 'lvl1', name: 'Full HD', height: 1080, videoBitrate: 4000, audioBitrate: 192 },
      { id: 'lvl2', name: 'HD', height: 720, videoBitrate: 2000, audioBitrate: 128 },
      { id: 'lvl3', name: 'SD', height: 480, videoBitrate: 800, audioBitrate: 96 },
      { id: 'lvl4', name: 'Low', height: 360, videoBitrate: 400, audioBitrate: 64 }
    ],
    packetLostRatio: 5,
    jitterMs: 100,
    rttMs: 200,
    dropFrameCountInEncoding: 50
  },
  hls: {
    hlsTime: 2,
    hlsListSize: 5,
    hlsPlayListType: 'event',
    playlistLoopEnabled: false,
    is360: false,
    originAddress: 'https://cdn.xhero.live',
    subFolder: 'xhero-sessions',
    seekTimeInMs: 0
  },
  rules: {
    notifications: {
      t24h: true,
      t60m: true,
      t15m: true,
      t0: true
    },
    resources: {
      viewerLink: true,
      qrStudio: true,
      studioToken: true,
      rtmpBackup: true,
      deepLink: true
    },
    categories: [
      { id: 'cat1', name: 'Phong Thuỷ', active: true },
      { id: 'cat2', name: 'Tài Lộc', active: true },
      { id: 'cat3', name: 'Đạo Giáo', active: true },
      { id: 'cat4', name: 'Bát Tự', active: true },
      { id: 'cat5', name: 'Bất Động Sản', active: true },
      { id: 'cat6', name: 'Thịnh Vượng', active: true },
      { id: 'cat7', name: 'An Lạc', active: true }
    ]
  },
  webhooks: {
    listenerHookURL: 'https://api.xhero.live/webhooks/ams-events',
    endpoints: [
      { id: 'ep1', url: 'rtmp://a.rtmp.youtube.com/live2/key123', type: 'YouTube', active: true },
      { id: 'ep2', url: 'rtmps://live-api-s.facebook.com:443/rtmp/fb123', type: 'Facebook', active: false }
    ]
  },
  limits: {
    webRTCViewerLimit: 200,
    hlsViewerLimit: 5000,
    dashViewerLimit: 0,
    zombi: true,
    anyoneWatching: true
  }
};

const MOCK_SYSTEM_USERS = [
  { id: 'u1', name: 'Lê Hoài Nam', email: 'nam.le@xhero.live', phone: '0901234567', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { id: 'u2', name: 'Phạm Quỳnh Anh', email: 'quynhanh@xhero.live', phone: '0988776655', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
  { id: 'u3', name: 'Ngô Kiến Huy', email: 'huy.ngo@xhero.live', phone: '0911223344', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
  { id: 'u4', name: 'Đặng Thu Thảo', email: 'thao.dang@xhero.live', phone: '0977665544', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100' },
  { id: 'u5', name: 'Hoàng Thùy Linh', email: 'linh.hoang@xhero.live', phone: '0966554433', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' }
];

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState('hosts');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  
  // Tab 1: Hosts search & assignments states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('Host chính');
  const [selectedUserForHost, setSelectedUserForHost] = useState(null);
  
  // Tab 3: Encoding level edit state
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelHeight, setNewLevelHeight] = useState(480);
  const [newLevelVideoBitrate, setNewLevelVideoBitrate] = useState(1000);
  const [newLevelAudioBitrate, setNewLevelAudioBitrate] = useState(128);

  // Tab 5: Categories tag state
  const [newTagName, setNewTagName] = useState('');

  // Tab 6: Restream endpoint state
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newEndpointType, setNewEndpointType] = useState('YouTube');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('xhero_live_system_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse system config from local storage', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('xhero_live_system_config', JSON.stringify(config));
    message.success({
      content: 'Lưu cấu hình hệ thống thành công!',
      style: { marginTop: '20px' }
    });
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Reset Cấu hình',
      content: 'Bạn có chắc chắn muốn khôi phục toàn bộ thiết lập về mặc định không? Các thay đổi chưa lưu sẽ bị mất.',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      okButtonProps: { style: { backgroundColor: '#AA8022', color: 'white', border: 'none' } },
      onOk: () => {
        setConfig(DEFAULT_CONFIG);
        localStorage.setItem('xhero_live_system_config', JSON.stringify(DEFAULT_CONFIG));
        message.info('Cấu hình đã được khôi phục về mặc định.');
      }
    });
  };

  // State utility updates
  const updateConfigField = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateSubConfigField = (section, subsection, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // Tab Navigation Menu Items
  const menuItems = [
    { id: 'hosts', text: 'Danh sách Host', icon: <TeamOutlined /> },
    { id: 'stream', text: 'Stream Config', icon: <VideoCameraOutlined /> },
    { id: 'encoding', text: 'Encoding Profiles', icon: <BarChartOutlined /> },
    { id: 'hls', text: 'HLS / Playback', icon: <PlayCircleOutlined /> },
    { id: 'rules', text: 'Session Rules', icon: <BellOutlined /> },
    { id: 'webhooks', text: 'Webhook & Re-stream', icon: <CloudUploadOutlined /> },
    { id: 'limits', text: 'Viewer Limits', icon: <UserOutlined /> }
  ];

  // Tab 1 Handler: Search & Toggle Hosts
  const toggleHostActive = (hostId) => {
    setConfig(prev => {
      const updatedHosts = prev.hosts.map(h => {
        if (h.id === hostId) {
          const nextStatus = h.status === 'Active' ? 'Inactive' : 'Active';
          message.info(`Đã ${nextStatus === 'Active' ? 'kích hoạt' : 'vô hiệu hoá'} Host: ${h.name}`);
          return { ...h, status: nextStatus };
        }
        return h;
      });
      return { ...prev, hosts: updatedHosts };
    });
  };

  const assignHost = () => {
    if (!selectedUserForHost) {
      message.error('Vui lòng chọn một người dùng trước.');
      return;
    }
    
    // Check if user already exists
    const exists = config.hosts.find(h => h.id === selectedUserForHost.id);
    if (exists) {
      message.warning(`${selectedUserForHost.name} đã tồn tại trong danh sách Host.`);
      return;
    }

    const newHost = {
      id: selectedUserForHost.id,
      name: selectedUserForHost.name,
      role: selectedRole,
      status: 'Active',
      avatar: selectedUserForHost.avatar
    };

    setConfig(prev => ({
      ...prev,
      hosts: [...prev.hosts, newHost]
    }));

    message.success(`Đã cấp quyền Host thành công cho: ${selectedUserForHost.name}`);
    setSelectedUserForHost(null);
    setUserSearchQuery('');
  };

  const filteredUsers = MOCK_SYSTEM_USERS.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phone.includes(userSearchQuery)
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="relative pb-28">
        <section className="bg-[#0D1424] border border-[#1E2633] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[580px]">
          
          {/* Internal Sidebar Menu */}
          <aside className="w-full md:w-[220px] bg-[#090F1B] border-r border-[#1E2633] shrink-0 p-4 flex flex-col justify-start">
            <h3 className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest mb-6 px-3">
              MỤC CẤU HÌNH
            </h3>
            <nav className="space-y-1.5 flex-1">
              {menuItems.map(item => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border ${
                      active 
                        ? 'bg-[rgba(212,175,55,0.08)] border-[#D4AF37]/50 text-[#D4AF37] shadow-[inset_0_0_8px_rgba(212,175,55,0.05)]' 
                        : 'bg-transparent border-transparent text-[#7E8CA8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Configuration Body Content */}
          <main className="flex-1 p-6 md:p-8 bg-[#0D1424]">
            
            {/* Group 1: Danh sách Host */}
            {activeTab === 'hosts' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Danh sách Host Livestream</h4>
                  <p className="text-sm text-[#7E8CA8]">Quản lý người được cấp quyền lên sóng. Chỉ Hosts ở trạng thái Active mới hiển thị khi tạo phiên live.</p>
                </div>
                
                {/* Host Card List */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {config.hosts.map(host => {
                    const isActive = host.status === 'Active';
                    return (
                      <div 
                        key={host.id} 
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isActive 
                            ? 'bg-[#151D2C] border-[#2A3441] hover:border-[#D4AF37]/30' 
                            : 'bg-[#111622]/60 border-dashed border-[#1E2633] opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img 
                            src={host.avatar} 
                            alt={host.name} 
                            className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/20 shadow-lg"
                          />
                          <div>
                            <h5 className="text-white font-medium text-sm">{host.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded bg-black/40 text-[#A6B5D6] font-medium">{host.role}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                                {isActive ? '● Active' : '● Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleHostActive(host.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isActive 
                                ? 'bg-red-950/20 text-red-400 border-red-900/50 hover:bg-red-900/30' 
                                : 'bg-green-950/20 text-green-400 border-green-900/50 hover:bg-green-900/30'
                            }`}
                          >
                            {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Host Section */}
                <div className="border-t border-[#1E2633] pt-6 mt-8 space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm">Gán quyền Host cho User mới</h5>
                  <div className="bg-[#111827] border border-[#1E2633] p-5 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Search Input */}
                      <div className="relative">
                        <label className="block text-sm text-[#7E8CA8] mb-1.5">Tìm kiếm User</label>
                        <Input 
                          prefix={<SearchOutlined className="text-gray-400" />}
                          placeholder="Tìm theo Tên, SĐT, Email..."
                          value={userSearchQuery}
                          onChange={(e) => {
                            setUserSearchQuery(e.target.value);
                            setSelectedUserForHost(null);
                          }}
                          className="bg-[#151D2C] border-[#2A3441] text-white hover:border-[#D4AF37]/50 focus:border-[#D4AF37] h-[42px]"
                        />
                        
                        {/* Search Dropdown Results */}
                        {userSearchQuery && !selectedUserForHost && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-[#151D2C] border border-[#2A3441] rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map(user => (
                                <div
                                  key={user.id}
                                  onClick={() => {
                                    setSelectedUserForHost(user);
                                    setUserSearchQuery(user.name);
                                  }}
                                  className="flex items-center gap-3 p-2.5 hover:bg-[#1C2637] cursor-pointer transition-colors"
                                >
                                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                                  <div className="text-xs">
                                    <div className="text-white font-medium">{user.name}</div>
                                    <div className="text-[#7E8CA8]">{user.phone} | {user.email}</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-[#7E8CA8]">Không tìm thấy người dùng phù hợp</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dropdown Role */}
                      <div>
                        <label className="block text-sm text-[#7E8CA8] mb-1.5">Vai trò Livestream</label>
                        <Select 
                          value={selectedRole}
                          onChange={setSelectedRole}
                          className="w-full"
                          style={{ height: '42px' }}
                          dropdownStyle={{ backgroundColor: '#151D2C' }}
                          options={[
                            { value: 'Host chính', label: 'Host chính' },
                            { value: 'Host phụ', label: 'Host phụ' },
                            { value: 'Presenter', label: 'Presenter' }
                          ]}
                        />
                      </div>
                    </div>

                    {selectedUserForHost && (
                      <div className="flex items-center gap-3 p-3 bg-[#1C2637]/50 border border-[#D4AF37]/20 rounded-lg">
                        <img src={selectedUserForHost.avatar} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="text-white text-sm font-medium">Đã chọn: {selectedUserForHost.name}</div>
                          <div className="text-xs text-[#7E8CA8]">{selectedUserForHost.email}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        type="primary"
                        onClick={assignHost}
                        icon={<PlusOutlined />}
                        className="bg-[#AA8022] hover:bg-[#D4AF37] border-none font-semibold text-white h-[40px] px-6 rounded-lg transition-colors"
                      >
                        Gán quyền Host
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group 2: Stream Config */}
            {activeTab === 'stream' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Cấu hình luồng phát mặc định</h4>
                  <p className="text-sm text-[#7E8CA8]">Các thông số mặc định tự động áp dụng khi tạo phiên livestream mới.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111827] border border-[#1E2633] p-6 rounded-xl">
                  
                  {/* Basic settings */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Thông số Video/Audio</h5>
                    
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Publish Type (Phương thức phát)</label>
                      <Select 
                        value={config.stream.publishType}
                        onChange={(val) => updateConfigField('stream', 'publishType', val)}
                        className="w-full"
                        options={[
                          { value: 'WebRTC', label: 'WebRTC (Độ trễ < 0.5s)' },
                          { value: 'RTMP', label: 'RTMP (Độ trễ trung bình)' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Độ phân giải</label>
                      <Select 
                        value={config.stream.resolution}
                        onChange={(val) => updateConfigField('stream', 'resolution', val)}
                        className="w-full"
                        options={[
                          { value: '1920x1080', label: 'Full HD (1920 × 1080)' },
                          { value: '1280x720', label: 'HD (1280 × 720)' },
                          { value: '854x480', label: 'SD (854 × 480)' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Video Bitrate (kbps)</label>
                        <Input 
                          type="number"
                          value={config.stream.bitrate}
                          onChange={(e) => updateConfigField('stream', 'bitrate', parseInt(e.target.value) || 2000)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Audio Bitrate (kbps)</label>
                        <Input 
                          type="number"
                          value={config.stream.audioBitrate}
                          onChange={(e) => updateConfigField('stream', 'audioBitrate', parseInt(e.target.value) || 128)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle settings */}
                  <div className="space-y-5">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Tùy chọn ghi hình & Quyền hạn</h5>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Lưu MP4 sau phiên</div>
                        <div className="text-xs text-[#7E8CA8]">Tự động ghi hình thành file .mp4</div>
                      </div>
                      <Switch 
                        checked={config.stream.mp4Enabled} 
                        onChange={(checked) => updateConfigField('stream', 'mp4Enabled', checked)} 
                        className="bg-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Lưu WebM</div>
                        <div className="text-xs text-[#7E8CA8]">Định dạng phụ cho các trình duyệt cũ</div>
                      </div>
                      <Switch 
                        checked={config.stream.webMEnabled} 
                        onChange={(checked) => updateConfigField('stream', 'webMEnabled', checked)} 
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Cho phép xem Public</div>
                        <div className="text-xs text-[#7E8CA8]">Học viên không cần đăng nhập vẫn xem được</div>
                      </div>
                      <Switch 
                        checked={config.stream.publicStream} 
                        onChange={(checked) => updateConfigField('stream', 'publicStream', checked)} 
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Auto Start/Stop</div>
                        <div className="text-xs text-[#7E8CA8]">Tự động chạy/tắt theo lịch cấu hình</div>
                      </div>
                      <Switch 
                        checked={config.stream.autoStartStopEnabled} 
                        onChange={(checked) => updateConfigField('stream', 'autoStartStopEnabled', checked)} 
                      />
                    </div>
                  </div>
                </div>

                {/* Session durations & Protection details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111827] border border-[#1E2633] p-6 rounded-xl">
                  
                  {/* Session duration options */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Mốc thời lượng phiên học</h5>
                    <p className="text-xs text-[#7E8CA8] mb-2">Chọn các mốc xuất hiện trong dropdown thời lượng khi thiết lập sự kiện mới:</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {['60', '120', '180', '240'].map(min => (
                        <label key={min} className="flex items-center gap-2 text-white">
                          <input type="checkbox" checked={config.stream.durations.includes(min)} disabled className="accent-blue-500 w-4 h-4" />
                          <span>{min} Phút (Mặc định)</span>
                        </label>
                      ))}
                      
                      {['45', '90', '150'].map(min => (
                        <label key={min} className="flex items-center gap-2 text-[#A6B5D6] cursor-pointer hover:text-white transition-colors">
                          <input 
                            type="checkbox" 
                            checked={config.stream.durationsEnabled[min]} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setConfig(prev => ({
                                ...prev,
                                stream: {
                                  ...prev.stream,
                                  durationsEnabled: {
                                    ...prev.stream.durationsEnabled,
                                    [min]: checked
                                  },
                                  durations: checked 
                                    ? [...prev.stream.durations, min] 
                                    : prev.stream.durations.filter(d => d !== min)
                                }
                              }));
                            }} 
                            className="accent-[#D4AF37] w-4 h-4" 
                          />
                          <span>{min} Phút</span>
                        </label>
                      ))}

                      <label className="flex items-center gap-2 text-[#A6B5D6] cursor-pointer hover:text-white transition-colors">
                        <input 
                          type="checkbox" 
                          checked={config.stream.durationsEnabled.custom} 
                          onChange={(e) => updateSubConfigField('stream', 'durationsEnabled', 'custom', e.target.checked)} 
                          className="accent-[#D4AF37] w-4 h-4" 
                        />
                        <span>Tùy chỉnh thời lượng</span>
                      </label>
                    </div>
                  </div>

                  {/* Safety parameters */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Bảo vệ luồng (Stream Protection)</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Max Idle Time (giây)</label>
                        <Input 
                          type="number"
                          value={config.stream.maxIdleTime}
                          onChange={(e) => updateConfigField('stream', 'maxIdleTime', parseInt(e.target.value) || 120)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Hạn Stream key (ms)</label>
                        <Input 
                          type="number"
                          value={config.stream.expireDurationMS}
                          onChange={(e) => updateConfigField('stream', 'expireDurationMS', parseInt(e.target.value) || 86400000)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Buffer hàng đợi gói tin</label>
                        <Input 
                          type="number"
                          value={config.stream.pendingPacketSize}
                          onChange={(e) => updateConfigField('stream', 'pendingPacketSize', parseInt(e.target.value) || 5000)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Giới hạn Subtrack</label>
                        <Input 
                          type="number"
                          value={config.stream.subtracksLimit}
                          onChange={(e) => updateConfigField('stream', 'subtracksLimit', parseInt(e.target.value) || 20)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group 3: Encoding Profiles */}
            {activeTab === 'encoding' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Encoding Profiles (Adaptive Bitrate Ladder)</h4>
                  <p className="text-sm text-[#7E8CA8]">Hệ thống tự động transcode và phân luồng chất lượng tương thích theo tốc độ mạng khán giả.</p>
                </div>

                <div className="bg-[#111827] border border-[#1E2633] p-5 rounded-xl space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm">Các tầng phân giải (ABR Ladder)</h5>
                  
                  {/* Table ladder custom input */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#2A3441] text-[#7E8CA8] text-xs">
                          <th className="pb-3 pt-1 pl-2">Tên tầng</th>
                          <th className="pb-3 pt-1">Chiều cao (px)</th>
                          <th className="pb-3 pt-1">Video Bitrate (kbps)</th>
                          <th className="pb-3 pt-1">Audio Bitrate (kbps)</th>
                          <th className="pb-3 pt-1 w-12 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.encoding.levels.map((level, idx) => (
                          <tr key={level.id} className="border-b border-[#1E2633] text-white">
                            <td className="py-2.5 pl-2">
                              <input 
                                type="text"
                                value={level.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setConfig(prev => ({
                                    ...prev,
                                    encoding: {
                                      ...prev.encoding,
                                      levels: prev.encoding.levels.map((l, i) => i === idx ? { ...l, name: val } : l)
                                    }
                                  }));
                                }}
                                className="bg-transparent border-none focus:bg-[#151D2C] focus:ring-1 focus:ring-[#D4AF37] rounded px-2 py-1 outline-none text-white text-sm w-32"
                              />
                            </td>
                            <td className="py-2.5">
                              <input 
                                type="number"
                                value={level.height}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setConfig(prev => ({
                                    ...prev,
                                    encoding: {
                                      ...prev.encoding,
                                      levels: prev.encoding.levels.map((l, i) => i === idx ? { ...l, height: val } : l)
                                    }
                                  }));
                                }}
                                className="bg-transparent border-none focus:bg-[#151D2C] focus:ring-1 focus:ring-[#D4AF37] rounded px-2 py-1 outline-none text-white text-sm w-24"
                              />
                            </td>
                            <td className="py-2.5">
                              <input 
                                type="number"
                                value={level.videoBitrate}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setConfig(prev => ({
                                    ...prev,
                                    encoding: {
                                      ...prev.encoding,
                                      levels: prev.encoding.levels.map((l, i) => i === idx ? { ...l, videoBitrate: val } : l)
                                    }
                                  }));
                                }}
                                className="bg-transparent border-none focus:bg-[#151D2C] focus:ring-1 focus:ring-[#D4AF37] rounded px-2 py-1 outline-none text-white text-sm w-28"
                              />
                            </td>
                            <td className="py-2.5">
                              <input 
                                type="number"
                                value={level.audioBitrate}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setConfig(prev => ({
                                    ...prev,
                                    encoding: {
                                      ...prev.encoding,
                                      levels: prev.encoding.levels.map((l, i) => i === idx ? { ...l, audioBitrate: val } : l)
                                    }
                                  }));
                                }}
                                className="bg-transparent border-none focus:bg-[#151D2C] focus:ring-1 focus:ring-[#D4AF37] rounded px-2 py-1 outline-none text-white text-sm w-28"
                              />
                            </td>
                            <td className="py-2.5 text-center">
                              <button 
                                onClick={() => {
                                  setConfig(prev => ({
                                    ...prev,
                                    encoding: {
                                      ...prev.encoding,
                                      levels: prev.encoding.levels.filter((_, i) => i !== idx)
                                    }
                                  }));
                                  message.info(`Đã loại bỏ tầng encoding: ${level.name}`);
                                }}
                                className="text-red-400 hover:text-red-500 transition-colors p-1"
                              >
                                <DeleteOutlined />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add level profile */}
                  <div className="bg-[#151D2C] p-3 rounded-lg border border-[#2A3441] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Tên profile mới</label>
                      <Input 
                        placeholder="Ví dụ: Ultra HD"
                        value={newLevelName}
                        onChange={(e) => setNewLevelName(e.target.value)}
                        className="h-[36px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Chiều cao (px)</label>
                      <Input 
                        type="number"
                        value={newLevelHeight}
                        onChange={(e) => setNewLevelHeight(parseInt(e.target.value) || 0)}
                        className="h-[36px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Video Bitrate (kbps)</label>
                      <Input 
                        type="number"
                        value={newLevelVideoBitrate}
                        onChange={(e) => setNewLevelVideoBitrate(parseInt(e.target.value) || 0)}
                        className="h-[36px]"
                      />
                    </div>
                    <div>
                      <Button
                        type="dashed"
                        onClick={() => {
                          if (!newLevelName.trim()) {
                            message.error('Vui lòng điền tên profile');
                            return;
                          }
                          const newLvl = {
                            id: 'lvl-' + Date.now(),
                            name: newLevelName,
                            height: newLevelHeight,
                            videoBitrate: newLevelVideoBitrate,
                            audioBitrate: newLevelAudioBitrate
                          };
                          setConfig(prev => ({
                            ...prev,
                            encoding: {
                              ...prev.encoding,
                              levels: [...prev.encoding.levels, newLvl]
                            }
                          }));
                          message.success(`Đã thêm profile transcode: ${newLevelName}`);
                          setNewLevelName('');
                        }}
                        icon={<PlusOutlined />}
                        className="w-full text-[#D4AF37] border-[#D4AF37]/50 hover:border-[#D4AF37] h-[36px]"
                      >
                        Thêm tầng transcode
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quality Alert thresholds */}
                <div className="bg-[#111827] border border-[#1E2633] p-5 rounded-xl space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Ngưỡng cảnh báo kỹ thuật thời gian thực (Realtime Quality Alerts)</h5>
                  <p className="text-xs text-[#7E8CA8]">Hệ thống sẽ gửi thông báo khẩn cấp trong Host Studio nếu đường truyền phát vượt quá các chỉ số an toàn:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Packet lost ratio (%)</label>
                      <Input 
                        type="number" 
                        prefix=">" 
                        value={config.encoding.packetLostRatio}
                        onChange={(e) => updateConfigField('encoding', 'packetLostRatio', parseInt(e.target.value) || 5)}
                        className="bg-[#151D2C] border-[#2A3441]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Độ trễ Jitter (ms)</label>
                      <Input 
                        type="number" 
                        prefix=">" 
                        value={config.encoding.jitterMs}
                        onChange={(e) => updateConfigField('encoding', 'jitterMs', parseInt(e.target.value) || 100)}
                        className="bg-[#151D2C] border-[#2A3441]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Round-trip time RTT (ms)</label>
                      <Input 
                        type="number" 
                        prefix=">" 
                        value={config.encoding.rttMs}
                        onChange={(e) => updateConfigField('encoding', 'rttMs', parseInt(e.target.value) || 200)}
                        className="bg-[#151D2C] border-[#2A3441]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Mất khung hình (Drop frame)</label>
                      <Input 
                        type="number" 
                        prefix=">" 
                        value={config.encoding.dropFrameCountInEncoding}
                        onChange={(e) => updateConfigField('encoding', 'dropFrameCountInEncoding', parseInt(e.target.value) || 50)}
                        className="bg-[#151D2C] border-[#2A3441]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group 4: HLS / Playback */}
            {activeTab === 'hls' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Cấu hình HLS & Playback (VOD)</h4>
                  <p className="text-sm text-[#7E8CA8]">Cơ chế đóng gói tệp tin stream HLS và phân phối file video phát lại cho người xem.</p>
                </div>

                <div className="bg-[#111827] border border-[#1E2633] p-6 rounded-xl space-y-6">
                  
                  {/* HLS Settings */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Thông số HLS (HLS Parameters)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Segment Time (giây)</label>
                        <Select 
                          value={config.hls.hlsTime}
                          onChange={(val) => updateConfigField('hls', 'hlsTime', val)}
                          className="w-full"
                          options={[
                            { value: 1, label: '1 giây (Độ trễ tối thiểu)' },
                            { value: 2, label: '2 giây (Được khuyên dùng)' },
                            { value: 5, label: '5 giây (Khuyên dùng cho băng thông kém)' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">List size (Số segment lưu trữ)</label>
                        <Input 
                          type="number"
                          value={config.hls.hlsListSize}
                          onChange={(e) => updateConfigField('hls', 'hlsListSize', parseInt(e.target.value) || 5)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Playlist type</label>
                        <Select 
                          value={config.hls.hlsPlayListType}
                          onChange={(val) => updateConfigField('hls', 'hlsPlayListType', val)}
                          className="w-full"
                          options={[
                            { value: 'event', label: 'Event (Chỉ phát tiếp tục)' },
                            { value: 'live', label: 'Live (Phát xoay vòng)' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-xs font-medium">Lặp lại HLS Playlist</div>
                        </div>
                        <Switch 
                          checked={config.hls.playlistLoopEnabled} 
                          onChange={(checked) => updateConfigField('hls', 'playlistLoopEnabled', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-xs font-medium">Hỗ trợ Camera 360°</div>
                        </div>
                        <Switch 
                          checked={config.hls.is360} 
                          onChange={(checked) => updateConfigField('hls', 'is360', checked)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distribution settings */}
                  <div className="space-y-4 pt-4 border-t border-[#1E2633]">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Hạ tầng phân phối & Vị trí Lưu trữ</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">CDN / Origin Address (Địa chỉ máy chủ phân phối)</label>
                        <Input 
                          type="url"
                          value={config.hls.originAddress}
                          onChange={(e) => updateConfigField('hls', 'originAddress', e.target.value)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#7E8CA8] mb-1">Subfolder lưu trữ</label>
                        <Input 
                          value={config.hls.subFolder}
                          onChange={(e) => updateConfigField('hls', 'subFolder', e.target.value)}
                          className="bg-[#151D2C] border-[#2A3441]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-[#7E8CA8] mb-1">Vị trí bắt đầu phát mặc định khi tua (Seek time - ms)</label>
                        <Input 
                          type="number"
                          value={config.hls.seekTimeInMs}
                          onChange={(e) => updateConfigField('hls', 'seekTimeInMs', parseInt(e.target.value) || 0)}
                          className="bg-[#151D2C] border-[#2A3441] w-48"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group 5: Session Rules */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Quy tắc phiên phát sóng (Session Rules)</h4>
                  <p className="text-sm text-[#7E8CA8]">Cài đặt các mốc nhắc hẹn tự động, tài nguyên sinh ngẫu nhiên, và quản trị danh mục chủ đề.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111827] border border-[#1E2633] p-6 rounded-xl">
                  
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Nhắc hẹn Host tự động</h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">T - 24 giờ trước live</div>
                        <Switch 
                          checked={config.rules.notifications.t24h} 
                          onChange={(checked) => updateSubConfigField('rules', 'notifications', 't24h', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">T - 60 phút trước live</div>
                        <Switch 
                          checked={config.rules.notifications.t60m} 
                          onChange={(checked) => updateSubConfigField('rules', 'notifications', 't60m', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">T - 15 phút trước live</div>
                        <Switch 
                          checked={config.rules.notifications.t15m} 
                          onChange={(checked) => updateSubConfigField('rules', 'notifications', 't15m', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">T - 0 (Thời điểm bắt đầu)</div>
                        <Switch 
                          checked={config.rules.notifications.t0} 
                          onChange={(checked) => updateSubConfigField('rules', 'notifications', 't0', checked)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto generated resources */}
                  <div className="space-y-4">
                    <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Tài nguyên tự động sinh khi lưu</h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">Đường dẫn xem Public cho học viên</div>
                        <Switch 
                          checked={config.rules.resources.viewerLink} 
                          onChange={(checked) => updateSubConfigField('rules', 'resources', 'viewerLink', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">Mã QR Code truy cập trực tiếp Studio</div>
                        <Switch 
                          checked={config.rules.resources.qrStudio} 
                          onChange={(checked) => updateSubConfigField('rules', 'resources', 'qrStudio', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">Đường dẫn Studio bảo mật kèm Token</div>
                        <Switch 
                          checked={config.rules.resources.studioToken} 
                          onChange={(checked) => updateSubConfigField('rules', 'resources', 'studioToken', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">Khóa truyền luồng RTMP dự phòng</div>
                        <Switch 
                          checked={config.rules.resources.rtmpBackup} 
                          onChange={(checked) => updateSubConfigField('rules', 'resources', 'rtmpBackup', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#A6B5D6]">Deep-link mở app trên Mobile</div>
                        <Switch 
                          checked={config.rules.resources.deepLink} 
                          onChange={(checked) => updateSubConfigField('rules', 'resources', 'deepLink', checked)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories & tags */}
                <div className="bg-[#111827] border border-[#1E2633] p-6 rounded-xl space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Danh mục tag / Chủ đề phòng học</h5>
                  <p className="text-xs text-[#7E8CA8]">Thêm và kích hoạt các nhãn chủ đề khi tạo sự kiện mới:</p>
                  
                  <div className="flex flex-wrap gap-2.5 py-2">
                    {config.rules.categories.map(cat => (
                      <Tag 
                        key={cat.id}
                        color={cat.active ? 'gold' : 'default'}
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              categories: prev.rules.categories.map(c => c.id === cat.id ? { ...c, active: !c.active } : c)
                            }
                          }));
                          message.info(`Đã ${cat.active ? 'vô hiệu hóa' : 'kích hoạt'} chủ đề: ${cat.name}`);
                        }}
                        className={`cursor-pointer !px-3.5 !py-1 text-sm rounded-lg font-medium transition-all ${
                          cat.active 
                            ? 'border-[#D4AF37] text-yellow-300 bg-[#D4AF37]/10' 
                            : 'border-transparent text-gray-500 bg-white/5 opacity-55'
                        }`}
                      >
                        {cat.name} {cat.active ? '' : '(Ẩn)'}
                      </Tag>
                    ))}
                  </div>

                  {/* Add tag */}
                  <div className="flex items-center gap-2 max-w-sm">
                    <Input 
                      placeholder="Nhập tên chủ đề mới..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="bg-[#151D2C] border-[#2A3441] h-[36px]"
                    />
                    <Button 
                      type="dashed"
                      onClick={() => {
                        if (!newTagName.trim()) {
                          message.error('Vui lòng điền tên chủ đề.');
                          return;
                        }
                        const newCat = {
                          id: 'cat-' + Date.now(),
                          name: newTagName,
                          active: true
                        };
                        setConfig(prev => ({
                          ...prev,
                          rules: {
                            ...prev.rules,
                            categories: [...prev.rules.categories, newCat]
                          }
                        }));
                        message.success(`Đã thêm chủ đề: ${newTagName}`);
                        setNewTagName('');
                      }}
                      icon={<PlusOutlined />}
                      className="text-[#D4AF37] border-[#D4AF37]/50 hover:border-[#D4AF37] h-[36px]"
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Group 6: Webhook / Re-stream */}
            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Tích hợp Webhook & Re-stream (Đồng phát sóng)</h4>
                  <p className="text-sm text-[#7E8CA8]">Đồng bộ hóa tín hiệu trạng thái máy chủ media, và chuyển luồng phát đồng thời qua các nền tảng mạng xã hội khác.</p>
                </div>

                {/* Webhook listener */}
                <div className="bg-[#111827] border border-[#1E2633] p-6 rounded-xl space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Listener Hook URL</h5>
                  <p className="text-xs text-[#7E8CA8]">Endpoint API tiếp nhận POST callback sự kiện (streamStarted, streamFinished...) từ Ant Media Server:</p>
                  
                  <div className="flex items-center gap-3">
                    <Input 
                      type="url"
                      value={config.webhooks.listenerHookURL}
                      onChange={(e) => updateConfigField('webhooks', 'listenerHookURL', e.target.value)}
                      className="bg-[#151D2C] border-[#2A3441] flex-1 h-[40px]"
                    />
                    <Button
                      onClick={() => {
                        message.loading('Đang gửi tín hiệu thử nghiệm...');
                        setTimeout(() => {
                          message.success('WebHook Response: 200 OK. Đã kiểm tra Listener Hook thành công.');
                        }, 800);
                      }}
                      className="border-[#D4AF37] hover:border-[#D4AF37] text-white hover:text-[#D4AF37] bg-transparent h-[40px] px-4"
                    >
                      Gửi Test Event
                    </Button>
                  </div>
                </div>

                {/* Restream Endpoints */}
                <div className="bg-[#111827] border border-[#1E2633] p-6 rounded-xl space-y-4">
                  <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Danh sách Re-stream Endpoints (Đồng phát đồng thời)</h5>
                  
                  <div className="space-y-3">
                    {config.webhooks.endpoints.map(ep => (
                      <div key={ep.id} className="flex items-center justify-between p-3.5 bg-[#151D2C] rounded-lg border border-[#2A3441]">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-black/40 text-yellow-500 font-bold uppercase">{ep.type}</span>
                            <span className="text-xs text-gray-500 truncate block max-w-sm">{ep.url}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Switch 
                            checked={ep.active}
                            onChange={(checked) => {
                              setConfig(prev => ({
                                ...prev,
                                webhooks: {
                                  ...prev.webhooks,
                                  endpoints: prev.webhooks.endpoints.map(e => e.id === ep.id ? { ...e, active: checked } : e)
                                }
                              }));
                              message.info(`Đã ${checked ? 'bật' : 'tắt'} re-stream ${ep.type}`);
                            }}
                          />
                          <button
                            onClick={() => {
                              setConfig(prev => ({
                                ...prev,
                                webhooks: {
                                  ...prev.webhooks,
                                  endpoints: prev.webhooks.endpoints.filter(e => e.id !== ep.id)
                                }
                              }));
                              message.info(`Đã xoá endpoint: ${ep.type}`);
                            }}
                            className="text-red-400 hover:text-red-500 transition-colors p-1"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Endpoint */}
                  <div className="bg-[#151D2C] p-3 rounded-lg border border-[#2A3441] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-[#7E8CA8] mb-1">Địa chỉ rtmp:// hoặc rtmps:// đích</label>
                      <Input 
                        placeholder="rtmp://live.twitch.tv/app/stream_key"
                        value={newEndpointUrl}
                        onChange={(e) => setNewEndpointUrl(e.target.value)}
                        className="h-[36px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7E8CA8] mb-1">Nền tảng</label>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={newEndpointType}
                          onChange={setNewEndpointType}
                          className="flex-1"
                          options={[
                            { value: 'YouTube', label: 'YouTube' },
                            { value: 'Facebook', label: 'Facebook' },
                            { value: 'TikTok', label: 'TikTok' },
                            { value: 'Twitch', label: 'Twitch' },
                            { value: 'Custom RTMP', label: 'Custom RTMP' }
                          ]}
                        />
                        <Button
                          type="dashed"
                          onClick={() => {
                            if (!newEndpointUrl.trim()) {
                              message.error('Vui lòng điền URL đích');
                              return;
                            }
                            const newEp = {
                              id: 'ep-' + Date.now(),
                              url: newEndpointUrl,
                              type: newEndpointType,
                              active: true
                            };
                            setConfig(prev => ({
                              ...prev,
                              webhooks: {
                                ...prev.webhooks,
                                endpoints: [...prev.webhooks.endpoints, newEp]
                              }
                            }));
                            message.success(`Đã thêm endpoint re-stream: ${newEndpointType}`);
                            setNewEndpointUrl('');
                          }}
                          icon={<PlusOutlined />}
                          className="text-[#D4AF37] border-[#D4AF37]/50 hover:border-[#D4AF37]"
                        >
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group 7: Viewer Limits */}
            {activeTab === 'limits' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-lg font-semibold mb-1">Viewer Limits (Giới hạn truy cập)</h4>
                  <p className="text-sm text-[#7E8CA8]">Thiết lập giới hạn lưu lượng người xem đồng thời theo từng giao thức đường truyền khác nhau. Nhập 0 = Không giới hạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111827] border border-[#1E2633] p-6 rounded-xl">
                  
                  <div>
                    <label className="block text-xs text-[#7E8CA8] mb-1.5">Giới hạn xem qua WebRTC (Độ trễ thấp)</label>
                    <Input 
                      type="number"
                      value={config.limits.webRTCViewerLimit}
                      onChange={(e) => updateConfigField('limits', 'webRTCViewerLimit', parseInt(e.target.value) || 0)}
                      className="bg-[#151D2C] border-[#2A3441] h-[40px] text-[#D4AF37] font-semibold"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Nên giới hạn ~200 người để đảm bảo tối ưu băng thông.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-[#7E8CA8] mb-1.5">Giới hạn xem qua HLS (Khả năng mở rộng)</label>
                    <Input 
                      type="number"
                      value={config.limits.hlsViewerLimit}
                      onChange={(e) => updateConfigField('limits', 'hlsViewerLimit', parseInt(e.target.value) || 0)}
                      className="bg-[#151D2C] border-[#2A3441] h-[40px] text-[#D4AF37] font-semibold"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Dành cho quy mô học viên cực lớn (Sử dụng CDN).</p>
                  </div>

                  <div>
                    <label className="block text-xs text-[#7E8CA8] mb-1.5">Giới hạn xem qua DASH Protocol</label>
                    <Input 
                      type="number"
                      value={config.limits.dashViewerLimit}
                      onChange={(e) => updateConfigField('limits', 'dashViewerLimit', parseInt(e.target.value) || 0)}
                      className="bg-[#151D2C] border-[#2A3441] h-[40px] text-[#D4AF37] font-semibold"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Giao thức phụ. Mặc định 0 = Không giới hạn.</p>
                  </div>
                </div>

                {/* Additional tracking states */}
                <div className="bg-[#111827] border border-[#1E2633] p-6 rounded-xl space-y-5">
                  <h5 className="text-[#D4AF37] font-semibold text-sm border-b border-[#1E2633] pb-2">Quy trình rà soát Viewer tự động</h5>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">Zombie Mode (Tự ngắt phòng rỗng)</div>
                      <div className="text-xs text-[#7E8CA8]">Tự động đóng phòng và kết thúc livestream sau 10 phút nếu không có học viên nào theo dõi</div>
                    </div>
                    <Switch 
                      checked={config.limits.zombi} 
                      onChange={(checked) => updateConfigField('limits', 'zombi', checked)} 
                      className="bg-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">Anyone Watching (Rà soát CCU thực tế)</div>
                      <div className="text-xs text-[#7E8CA8]">Thực hiện ping rà soát các phiên kết nối ảo (zombie sessions) mỗi 15 giây</div>
                    </div>
                    <Switch 
                      checked={config.limits.anyoneWatching} 
                      onChange={(checked) => updateConfigField('limits', 'anyoneWatching', checked)} 
                      className="bg-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
            
          </main>
        </section>

        {/* Fixed Action Footer Bar */}
        <div className="fixed bottom-0 left-0 lg:left-[220px] right-0 bg-[#0D1424] border-t border-[#1E2633] p-4 flex justify-end z-40">
          <div className="flex items-center gap-3 w-full px-6">
            <div className="flex-1"></div>
            
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm text-[#7E8CA8] border border-transparent hover:text-white hover:bg-[#151D2C] transition-all flex items-center gap-2"
            >
              <ReloadOutlined className="text-xs" />
              Reset về mặc định
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-2.5 rounded-lg font-bold text-sm text-black bg-gradient-to-r from-[#D4AF37] via-[#FFF5C3] to-[#AA8022] hover:opacity-95 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/15"
            >
              <SaveOutlined />
              Lưu cấu hình
            </button>
          </div>
        </div>

      </div>
    </ConfigProvider>
  );
}
