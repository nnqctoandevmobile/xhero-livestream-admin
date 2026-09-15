'use client';

import { useIsMobile } from "../../hook/useMediaQuery";
import Logo from "../Header/component/Logo";

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
  },
  {
    text: 'Tạo phiên mới',
    value: 'newSession',
  },
  {
    text: 'Form tư vấn',
    value: 'consultingForms',
  },
  {
    text: 'Video playback',
    value: 'videoPlayback',
  },
  {
    text: 'Thống kê',
    value: 'statistics',
  },
  {
    text: 'Cấu hình chung',
    value: 'systemConfig',
  }
];

export default function SideBar({ tab, setTab, isOpen, onClose }) {
  const isMobile = useIsMobile();
  return (
    <aside className={`
      absolute md:relative top-0 bottom-0 z-[100] w-[220px] border-r border-[#1E2633] flex items-center flex-col shrink-0 bg-[#0D1424]
      transition-transform duration-300 ease-in-out
      ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    `}>
      <span className="!pt-6 text-xl font-bold md:text-3xl bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] bg-clip-text text-transparent">
        XHERO
      </span>
      <nav className="flex-1 py-5">
        {sidebarMenu.map((item) => {
          const active = tab === item.value;

          return (
            <button
              key={item.value}
              onClick={() => {
                onClose();
                setTab(item.value);
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
      </nav>
    </aside >
  );
}
