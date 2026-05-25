import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hook/useMediaQuery";
import Logo from "../Header/components/Logo";
import SystemConfigModal from "./SystemConfigModal";

// interface SidebarItem {
//   text: string;
//   value: string;
// }

// interface Props {
//   sidebarMenu: SidebarItem[];
//   tab: string;
//   setTab: (value: string) => void;
// }

const sidebarMenu = [
  {
    text: 'Danh sách phiên',
    value: 'sessionList',
    path: '/home',
  },
  {
    text: 'Tạo phiên mới',
    value: 'newSession',
    path: '/home/new',
  },
  {
    text: 'Form tư vấn',
    value: 'consultingForms',
    path: '/home/consulting',
  },
  {
    text: 'Video playback',
    value: 'videoPlayback',
    path: '/home/playback',
  },
  {
    text: 'Thống kê',
    value: 'statistics',
    path: '/home/statistics',
  }
];

const IconSettings = () => (
  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function SideBar({ isOpen, onClose }) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/home') return 'sessionList';
    if (path.startsWith('/home/new')) return 'newSession';
    if (path.startsWith('/home/consulting')) return 'consultingForms';
    if (path.startsWith('/home/playback')) return 'videoPlayback';
    if (path.startsWith('/home/statistics')) return 'statistics';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <>
      <aside className={`
        absolute md:relative top-0 bottom-0 z-[100] w-[220px] border-r border-[#1E2633] flex items-center flex-col shrink-0 bg-[#0D1424]
        transition-transform duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <span className="!pt-6 text-xl font-bold md:text-3xl bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] bg-clip-text text-transparent">
          XHERO
        </span>
        <nav className="w-full flex-1 py-5 flex flex-col justify-between">
          <div className="flex flex-col w-full">
            {sidebarMenu.map((item) => {
              const active = activeTab === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onClose();
                    navigate(item.path);
                  }}
                  className={`
                    w-full text-left !px-6 !py-3 text-sm transition-all
                    !border-l-4
                    ${active
                      ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.08)] border-[#D4AF37]'
                      : 'text-[#A6B5D6] !border-transparent hover:bg-white/5'
                    }
                  `}
                >
                  {item.text}
                </button>
              );
            })}
          </div>

          <div className="w-full !px-4 !pt-4 border-t border-[#1E2633]/50">
            <button
              onClick={() => {
                onClose();
                setIsConfigOpen(true);
              }}
              className="w-full flex items-center !px-4 !py-3 text-sm text-[#A6B5D6] hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <IconSettings />
              Cấu hình hệ thống
            </button>
          </div>
        </nav>
      </aside >

      <SystemConfigModal
        open={isConfigOpen}
        onCancel={() => setIsConfigOpen(false)}
      />
    </>
  );
}

