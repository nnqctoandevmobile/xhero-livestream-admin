import { SESSION_STATUS } from "../../../../../../core/constants";
import IconLayout from "../../../../../../icons/IconLayout";
import IconUsers from "../../../../../../icons/IconUsers";

export default function AdminHostMainVideo({ activeScene, remoteVideoRef, isRecording, detailData }) {
  return (
    <main className="flex-1 h-full flex flex-col items-center justify-center bg-[#090D14] p-3 md:p-6 overflow-hidden" >
      <div className="w-full max-w-5xl aspect-video bg-black relative rounded-xl md:rounded-2xl overflow-hidden border border-[#1E2633] shadow-2xl">
        {/* Background for Presentation Scene */}
        {activeScene === 'presentation' && (
          <div className="absolute inset-0 bg-[#0D1424] flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-3 text-white/5">
              <IconLayout className="w-20 h-20" />
              <h2 className="text-xs font-bold tracking-widest uppercase">Slide Content</h2>
            </div>
          </div>
        )}

        {/* The main video element (Host) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          className={`transition-all duration-700 shadow-2xl object-cover ${activeScene === 'presentation'
            ? 'absolute bottom-3 right-3 w-1/4 aspect-video rounded-xl border border-[#D4AF37] z-20'
            : activeScene === 'dual'
              ? 'absolute left-0 top-0 w-1/2 h-full z-20'
              : 'w-full h-full'
            }`}
        />

        {/* Scene-specific Overlays */}
        {activeScene === 'presentation' && (
          <div className="absolute bottom-4 right-[calc(0.75rem+4px)] z-30 px-1 py-0.5 bg-[#D4AF37] text-black text-[8px] font-bold rounded uppercase">
            Chuyên gia
          </div>
        )}

        {activeScene === 'dual' && (
          <div className="absolute inset-0 flex bg-[#0D1424]">
            {/* Left Side (Host) */}
            <div className="flex-1 relative border-r border-[#D4AF37]/20">
              {/* Handled by absolute remoteVideoRef */}
            </div>
            {/* Right Side (Guest) */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-[#3B82F6]">
                  <IconUsers className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-medium italic opacity-50">Đang chờ khách mời...</p>
              </div>
              <div className="absolute bottom-4 left-4 z-30 px-2 py-0.5 bg-[#3B82F6] text-white text-[8px] font-bold rounded uppercase">
                Khách mời
              </div>
            </div>
          </div>
        )}

        {/* Status Overlays */}
        <div className="absolute top-3 left-3 flex gap-2 z-30">
          {detailData?.info?.status === SESSION_STATUS.Live.value && (
            <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span className="text-[8px] font-bold uppercase">On Air</span>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span className="text-[8px] font-bold uppercase">Rec</span>
            </div>
          )}
        </div>
      </div>
    </main >
  )
}