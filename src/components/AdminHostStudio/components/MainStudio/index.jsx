import { AdminPanelService } from "../../../../api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAntMedia } from '../../../../core/useAntMedia';
import AdminHostSideBar from "./components/AdminHostSideBar";
import { SESSION_STATUS } from "../../../../core/constants";
import IconLayout from "../../../../icons/IconLayout";
import IconUsers from "../../../../icons/IconUsers";
import AdminHostMainVideo from "./components/AdminHostMainVideo";
import AdminHostInteractionSide from "./components/AdminHostInteractionSide";
import { useIsMobile } from "../../../../hook/useMediaQuery";
import IconLogOut from "../../../../icons/IconLogOut";

const api = new AdminPanelService();

export default function MainStudio() {
  const [detailData, setDetailData] = useState(null);
  const { _id: roomId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeScene, setActiveScene] = useState('focus'); // focus, presentation, dual
  const [isRecording, setIsRecording] = useState(false);
  const [mobileTab, setMobileTab] = useState('controls'); // controls, interaction

  const getDetailLivestream = async () => {
    try {
      const res = await api.actGetDetailLivestream(roomId);
      setDetailData(res.data.mainData);
    } catch (error) {
      console.error('Error fetching detail livestream:', error);
    }
  };

  const { remoteVideoRef, isPlaying, loading: mediaLoading, startPlaying, stopPlaying } = useAntMedia({
    serverUrl: import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER,
    streamId: detailData?.streamSettings?.streamId,
    mode: 'play',
    enabled: !!detailData?.streamSettings?.streamId,
  });


  useEffect(() => {
    getDetailLivestream();
  }, [roomId]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-[#090D14] text-white overflow-hidden font-sans">
        {/* TOP COMPACT STATUS BAR */}
        <header className="h-14 border-b border-[#1E2633] bg-[#0D1424] flex items-center justify-between px-4 shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              {detailData?.info?.status || 'OFFLINE'}
            </span>
          </div>
          <button onClick={() => navigate('/home')} className="text-[#7E8CA8] hover:text-white p-1">
            <IconLogOut className="w-4 h-4" />
          </button>
        </header>

        {/* aspect-locked video preview */}
        <div className="w-full aspect-video bg-black relative border-b border-[#1E2633] shrink-0">
          <AdminHostMainVideo activeScene={activeScene} remoteVideoRef={remoteVideoRef} isRecording={isRecording} detailData={detailData} />
        </div>

        {/* TAB SELECTOR */}
        <div className="flex bg-[#0D1424] border-b border-[#1E2633] shrink-0">
          <button
            onClick={() => setMobileTab('controls')}
            className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all relative ${mobileTab === 'controls' ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}
          >
            Điều khiển
            {mobileTab === 'controls' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"></div>}
          </button>
          <button
            onClick={() => setMobileTab('interaction')}
            className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all relative ${mobileTab === 'interaction' ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}
          >
            Tương tác
            {mobileTab === 'interaction' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"></div>}
          </button>
        </div>

        {/* TAB CONTENT PANEL */}
        <div className="flex-1 overflow-y-auto bg-[#090D14] custom-scrollbar">
          {mobileTab === 'controls' ? (
            <AdminHostSideBar detailData={detailData} activeScene={activeScene} setActiveScene={setActiveScene} isMobile={isMobile} />
          ) : (
            <AdminHostInteractionSide streamId={detailData?.streamSettings?.streamId} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] h-screen bg-[#090D14] text-white overflow-hidden font-sans">
      <AdminHostSideBar detailData={detailData} activeScene={activeScene} setActiveScene={setActiveScene} isMobile={isMobile} />
      <AdminHostMainVideo activeScene={activeScene} remoteVideoRef={remoteVideoRef} isRecording={isRecording} detailData={detailData} />
      <AdminHostInteractionSide streamId={detailData?.streamSettings?.streamId} />
    </div>
  );
}
