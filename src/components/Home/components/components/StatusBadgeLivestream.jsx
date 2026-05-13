import { SESSION_STATUS } from "../../../../core/constants";

const badgeConfig = {
  [SESSION_STATUS.Live]: {
    text: 'LIVE',
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] animate-pulse',
  },
  [SESSION_STATUS.Ended]: {
    text: 'Đã kết thúc',
    className: 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border border-[rgba(148,163,184,0.3)]',
  },
  [SESSION_STATUS.Scheduled]: {
    text: 'Sắp diễn ra',
    className: 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]',
  },
};

export default function StatusBadgeLivestream({ status }) {
  const config = badgeConfig[status] || {
    text: status,
    className: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className={`flex items-center justify-center px-2 py-0.5 gap-[6px] rounded-md ${config.className} text-xs font-semibold shrink-0`}>
      {config.text}
    </div>

  );
}