import React, { useEffect, useState } from 'react';
import { Modal, Switch, Select, Form } from 'antd';
import { AdminPanelService } from '../../../api';
import HostList from './components/HostList';
import StreamConfig from './components/StreamConfig';
import Encoding from './components/Encoding';
import SessionRules from './components/SessionRules';
import HLSPlayback from './components/HLSPlayback';
import WebhookAPI from './components/WebhookAPI';
import ViewerLimit from './components/ViewerLimit';
import { useForm } from 'antd/es/form/Form';
import { useIsMobile } from '../../../hook/useMediaQuery';

const adminPanelService = new AdminPanelService();

const TABS = [
  { id: 'host', label: 'Danh sách host' },
  { id: 'stream', label: 'Stream config' },
  { id: 'encoding', label: 'Encoding' },
  { id: 'hls', label: 'HLS / Playback' },
  { id: 'rules', label: 'Session rules' },
  { id: 'webhook', label: 'Webhook / API' },
  { id: 'limits', label: 'Viewer limits' },
];

const DEFAULT_SYSTEM_CONFIG = {
  // Stream Config
  publishType: 'webrtc',
  resolution: '720p',
  bitrateVideo: '2000',
  bitrateAudio: '128',
  mp4Enabled: true,
  webmEnabled: false,
  publicStream: true,
  autoStartStopEnabled: true,
  maxIdleTime: '120',
  expireDurationMS: '86400000',
  pendingPacketSize: '5000',
  subtracksLimit: '20',
  sessionDurations: ['45m', '60m', '90m', '120m', '150m'],

  // Encoding
  encodingFullHDHeight: '1080',
  encodingFullHDVideo: '4000',
  encodingFullHDAudio: '192',
  encodingHDHeight: '720',
  encodingHDVideo: '2000',
  encodingHDAudio: '128',
  encodingSDHeight: '480',
  encodingSDVideo: '800',
  encodingSDAudio: '96',
  encodingLowHeight: '360',
  encodingLowVideo: '400',
  encodingLowAudio: '64',
  warnPacketLostRatio: '5',
  warnJitterMs: '100',
  warnRttMs: '200',
  warnDropFrameLimit: '50',

  // Session Rules
  notification24h: true,
  notification60m: true,
  notification15m: true,
  notificationOnTime: true,
  resourceQRCode: true,
  resourcePublicLink: true,
  resourceRTMPKey: true,
  resourceDeepLink: true,

  // HLS / Playback
  hlsTime: '2',
  hlsListSize: '5',
  hlsPlayListType: 'event',
  playlistLoopEnabled: false,
  is360: false,
  originAdress: 'https://cdn.xhero.live',
  subFolder: 'xhero-sessions',
  seekTimeInMs: 0,

  // Webhook / API
  listenerHookURL: 'https://api.xhero.live/webhooks/ant-media',
  endpointURL: '',
  endpointType: 'youtube',
  endpointStatus: 'active',

  // Viewer Limits
  webRTCViewerLimit: '200',
  hlsViewerLimit: '5000',
  dashViewerLimit: '0',
  zombieModeEnabled: true,
  anyoneWatchingEnabled: true,
};

export default function SystemConfigModal({ open, onCancel }) {
  const [activeTab, setActiveTab] = useState('stream');
  const [hostList, setHostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const isMobile = useIsMobile();

  const fetchHostList = async () => {
    try {
      const res = await adminPanelService.actGetHostList({
        status: "active",
        typeConsulting: "dương trạch",
        skip: 0,
        limit: 1000,
      });
      const mappedData = (res?.data?.leaderExpert || []).map(item => ({
        ...item,
        label: item.fullName,
        value: item._id,
      }));
      setHostList(mappedData);
    } catch (error) {
      console.error('Error fetching host list:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostList();
  }, []);

  const handleSubmitForm = () => {
    console.log(form.getFieldsValue());
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'host':
        return (
          <HostList />
        );
      case 'stream':
        return (
          <StreamConfig />
        );
      case 'encoding':
        return (
          <Encoding />
        );
      case 'rules':
        return (
          <SessionRules />
        );
      case 'hls':
        return (
          <HLSPlayback />
        );
      case 'webhook':
        return (
          <WebhookAPI />
        );
      case 'limits':
        return (
          <ViewerLimit />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="dark-modal p-0"
      closable={false}
      centered
      style={isMobile ? { top: 16, maxWidth: '95vw', margin: '0 auto' } : {}}
      styles={{
        content: { backgroundColor: '#090D14', padding: 0, overflow: 'hidden', border: '1px solid #1E2633', borderRadius: '16px' }
      }}
    >
      <div className="flex flex-col md:flex-row h-[90vh] md:h-[80vh] min-h-[500px] md:min-h-[600px]">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-[260px] bg-[#0D1424] border-b md:border-b-0 md:border-r border-[#1E2633] flex flex-col md:flex-col shrink-0">
          <div className="hidden md:block p-5 border-b border-[#1E2633]">
            <h2 className="text-xs font-bold text-[#7E8CA8] uppercase tracking-[3px]">SYSTEM CONFIG</h2>
          </div>
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto py-2 md:py-3 custom-scrollbar shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center justify-center md:justify-start gap-3 px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all border-b-2 md:border-b-0 md:border-r-2 ${activeTab === tab.id
                  ? 'text-white bg-[#1E2633]/50 border-[#10B981]'
                  : 'text-[#7E8CA8] border-transparent hover:text-white hover:bg-[#151D2C]'
                  }`}
              >
                {/* <span className="w-4 h-4 opacity-70">{tab.icon}</span> */}
                {tab.label}
              </button>
            ))}
            {isMobile && <button type="button" onClick={onCancel} className="sticky ml-3 top-4 right-4 text-[#7E8CA8] hover:text-white !w-9 h-9 shrink-0 flex items-center justify-center !bg-[#151D2C] hover:bg-[#1E2633] border border-[#1E2633] rounded-lg transition-colors z-[10]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>}

          </div>
        </div>

        {/* Right Content */}
        <Form
          form={form}
          layout="vertical"
          initialValues={DEFAULT_SYSTEM_CONFIG}
          className="flex-1 flex flex-col bg-[#090D14] overflow-hidden"
          onFinish={handleSubmitForm}
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {renderContent()}
          </div>

          {/* Footer actions pinned to bottom of content area */}
          <div className="p-4 md:p-6 border-t border-[#1E2633] bg-[#090D14] flex gap-3 md:gap-4 mt-auto">
            <button
              type="submit"
              className="px-4 md:px-5 py-2.5 bg-transparent border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 text-sm font-bold rounded-lg transition-colors"
            >
              Lưu cấu hình
            </button>
            <button
              type="button"
              onClick={() => form.resetFields()}
              className="px-4 md:px-5 py-2.5 bg-transparent border border-[#1E2633] text-[#7E8CA8] hover:bg-[#1E2633] hover:text-white text-sm font-bold rounded-lg transition-colors"
            >
              Reset về mặc định
            </button>
          </div>
        </Form>

        {!isMobile && <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-[#7E8CA8] hover:text-white w-9 h-9 flex items-center justify-center !bg-[#151D2C] hover:bg-[#1E2633] border border-[#1E2633] rounded-lg transition-colors z-[10]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>}
      </div>

      <style>{`
        .custom-dark-select .ant-select-selector {
          background-color: #0D1424 !important;
          border-color: #2A3441 !important;
          color: white !important;
          border-radius: 8px !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-dark-select .ant-select-arrow {
          color: #7E8CA8 !important;
        }
      `}</style>
    </Modal>
  );
}
