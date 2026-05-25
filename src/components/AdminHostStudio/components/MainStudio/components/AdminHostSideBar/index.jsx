import { Button, Modal } from "antd";
import { SESSION_STATUS } from "../../../../../../core/constants";
import { SCENES } from "../../../../../../core/scenes";
import IconLogOut from "../../../../../../icons/IconLogOut";
import IconShield from "../../../../../../icons/IconShield";
import IconStop from "../../../../../../icons/IconStop";
import IconX from "../../../../../../icons/IconX";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminPanelService } from "../../../../../../api";
// import SystemConfigModal from "../SystemConfigModal";
import EditSessionModal from "../../../CountDownView/EditSessionModal";

const api = new AdminPanelService();

export default function AdminHostSideBar({ detailData, activeScene, setActiveScene, isPlaying, isMobile }) {
  const navigate = useNavigate();
  const { _id: roomId } = useParams();
  const [showStopModal, setShowStopModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);

  // useEffect(() => {
  //   let interval;
  //   if (isPlaying) {
  //     interval = setInterval(() => {
  //       setLiveSeconds(prev => prev + 1);
  //     }, 1000);
  //   }
  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [isPlaying]);

  const handleStopSession = () => {
    setShowStopModal(true);
  };

  const handleCancelSession = async () => {
    setShowCancelModal(true);
  }

  const handleStopLivestream = async () => {
    try {
      const res = await api.actStopLivestream(roomId);
      if (res) {
        setShowStopModal(false);
        navigate('/home');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleCancelLivestream = async () => {
    try {
      const res = await api.actStopLivestream(roomId);
      const res2 = await api.actDeleteLivestream(roomId);
      if (res && res2) {
        setShowCancelModal(false);
        navigate('/home');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderSidebarContent = () => {
    if (isMobile) {
      return (
        <div className="p-4 space-y-5 overflow-y-auto h-full custom-scrollbar">
          {/* Chế độ hiển thị (Scenes) - Thanh lướt ngang */}
          <div>
            <div className="text-[10px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-2.5">
              Chế độ hiển thị (Scenes)
            </div>
            <div className="flex overflow-x-auto gap-3 pb-3 custom-scrollbar whitespace-nowrap scroll-smooth">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 shrink-0 min-w-[160px] transition-all duration-300 cursor-pointer ${activeScene === scene.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-4 ring-[#D4AF37]/10'
                    : 'border-[#1E2633] bg-[#151D2C] hover:border-[#3B82F6]/50'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${activeScene === scene.id ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#7E8CA8] bg-[#0D1424]'}`}>
                    {scene.icon}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-bold ${activeScene === scene.id ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {scene.name}
                    </div>
                    <div className="text-[9px] text-[#4F5E7B] mt-0.5 line-clamp-1">{scene.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin phiên */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-2">
              Thông tin phiên
            </div>
            <div className="bg-[#151D2C] p-4 rounded-xl border border-[#1E2633]">
              <h2 className="text-sm font-semibold text-white truncate">{detailData?.info?.name || 'Đang tải...'}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs text-red-500 font-bold uppercase tracking-tighter">{detailData?.info?.status}</span>
                <span className="text-[11px] text-[#7E8CA8] ml-auto">{detailData?.info?.startAt}</span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleStopSession}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/5 group cursor-pointer"
            >
              <IconStop className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Kết thúc phiên
            </button>

            <button
              onClick={handleCancelSession}
              disabled={detailData?.info?.status === SESSION_STATUS.Cancelled.value}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600 disabled:bg-[#151D2C] disabled:text-[#4F5E7B] disabled:border-transparent text-white border border-red-600/40 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-600/5 group cursor-pointer"
            >
              <IconX className="w-4 h-4 group-hover:scale-110 transition-transform text-red-500 group-hover:text-white" />
              Hủy phiên live
            </button>
          </div>
        </div>
      );
    }

    return (
      <aside className="h-full border-r border-[#1E2633] bg-[#0D1424] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#1E2633]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 shrink-0">
              <IconShield className="text-black w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#D4AF37] truncate">XHERO STUDIO</h1>
              <p className="text-[10px] text-[#7E8CA8] uppercase tracking-widest font-semibold truncate">Admin Dashboard</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="w-10 h-10 bg-[#151D2C] hover:bg-[#1E2633] border border-[#1E2633] rounded-xl flex items-center justify-center text-[#7E8CA8] hover:text-[#D4AF37] transition-all shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-3">Thông tin phiên</div>
            <div className="bg-[#151D2C] p-3 rounded-xl border border-[#1E2633]">
              <h2 className="text-sm font-semibold text-white">{detailData?.info?.name || 'Đang tải...'}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs text-red-500 font-bold uppercase tracking-tighter">{detailData?.info?.status}</span>
                <span className="text-[11px] text-[#7E8CA8] ml-auto">{detailData?.info?.startAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-[#4F5E7B] uppercase tracking-wider mb-4">Chế độ hiển thị (Scenes)</div>
          <div className="space-y-4">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setActiveScene(scene.id)}
                className={`w-full group relative transition-all duration-300 rounded-xl overflow-hidden border-2 ${activeScene === scene.id
                  ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/10'
                  : 'border-[#1E2633] hover:border-[#3B82F6]/50 bg-[#151D2C]'
                  }`}
              >
                <div className={`aspect-video w-full flex items-center justify-center transition-colors ${activeScene === scene.id ? 'bg-[#D4AF37]/10' : 'bg-[#0D1424]'
                  }`}>
                  {scene.icon}
                </div>
                <div className={`p-3 text-left relative ${activeScene === scene.id ? 'bg-[#D4AF37]/5' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-bold ${activeScene === scene.id ? 'text-[#D4AF37]' : 'text-[#7E8CA8]'}`}>
                      {scene.name}
                    </div>
                    {activeScene === scene.id && (
                      <span className="bg-[#D4AF37] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                        Đang phát
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#4F5E7B] mt-1 line-clamp-1">{scene.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[#1E2633] mt-auto">
          <button
            onClick={handleStopSession}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/5 group cursor-pointer"
          >
            <IconStop className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Kết thúc phiên
          </button>

          <button
            onClick={handleCancelSession}
            disabled={detailData?.info?.status === SESSION_STATUS.Cancelled.value}
            className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600 disabled:bg-[#151D2C] disabled:text-[#4F5E7B] disabled:border-transparent text-white border border-red-600/40 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-600/5 group cursor-pointer"
          >
            <IconX className="w-4 h-4 group-hover:scale-110 transition-transform text-red-500 group-hover:text-white" />
            Hủy phiên live
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full mt-3 flex items-center gap-3 px-4 py-3 text-[11px] font-medium text-[#4F5E7B] hover:text-white transition-all uppercase tracking-wider"
          >
            <IconLogOut className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>
      </aside>
    );
  };

  return (
    <>
      {renderSidebarContent()}

      <Modal
        title={<span className="text-white font-bold">Kết thúc phiên livestream?</span>}
        open={showStopModal}
        onCancel={() => setShowStopModal(false)}
        footer={null}
        centered
        className="dark-modal"
        width={480}
      >
        <span className="text-gray-400">
          Tất cả khán giả sẽ bị ngắt kết nối và phiên live sẽ dừng lại ngay lập tức.
        </span>
        <div className="flex justify-end gap-3 mt-8">
          <Button
            onClick={() => setShowStopModal(false)}
            className="
              !bg-[#151D2C]
              !border-[#1E2633]
              !text-[#CBD5E1]
              hover:!bg-[#1E2633]
              hover:!border-[#D4AF37]
              hover:!text-white
              !rounded-xl
              !h-10
              !px-5
              !font-semibold
            "
          >
            Đóng
          </Button>

          <Button
            onClick={handleStopLivestream}
            type="primary"
            danger
            className="
              !bg-[#EF4444]
              !border-[#EF4444]
              !text-white
              hover:!bg-[#DC2626]
              hover:!border-[#DC2626]
              !rounded-xl
              !h-10
              !px-5
              !font-semibold
              shadow-lg shadow-red-500/20
            "
          >
            Kết thúc ngay
          </Button>
        </div>
      </Modal>

      <Modal
        title={<span className="text-white font-bold">Hủy phiên livestream?</span>}
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        footer={null}
        centered
        className="dark-modal"
        width={480}
      >
        <span className="text-gray-400">
          Phiên live sẽ bị hủy, xoá và không thể khôi phục.
        </span>
        <div className="flex justify-end gap-3 mt-8">
          <Button
            onClick={() => setShowCancelModal(false)}
            className="
              !bg-[#151D2C]
              !border-[#1E2633]
              !text-[#CBD5E1]
              hover:!bg-[#1E2633]
              hover:!border-[#D4AF37]
              hover:!text-white
              !rounded-xl
              !h-10
              !px-5
              !font-semibold
            "
          >
            Đóng
          </Button>

          <Button
            onClick={handleCancelLivestream}
            type="primary"
            danger
            className="
              !bg-[#EF4444]
              !border-[#EF4444]
              !text-white
              hover:!bg-[#DC2626]
              hover:!border-[#DC2626]
              !rounded-xl
              !h-10
              !px-5
              !font-semibold
              shadow-lg shadow-red-500/20
            "
          >
            Hủy phiên ngay
          </Button>
        </div>
      </Modal>

      <EditSessionModal
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
      />
    </>
  );
}