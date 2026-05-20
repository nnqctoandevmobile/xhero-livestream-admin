import { SESSION_STATUS, SESSION_PRIVACY } from "../../../../core/constants";

const badgeConfig = {
  [SESSION_STATUS.Live.value]: {
    text: SESSION_STATUS.Live.label,
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] animate-pulse',
  },
  [SESSION_STATUS.Ended.value]: {
    text: SESSION_STATUS.Ended.label,
    className: 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border border-[rgba(148,163,184,0.3)]',
  },
  [SESSION_STATUS.Created.value]: {
    text: SESSION_STATUS.Created.label,
    className: 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]',
  },
  [SESSION_STATUS.Cancelled.value]: {
    text: SESSION_STATUS.Cancelled.label,
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
  },
  'waiting': {
    text: 'Đang chờ',
    className: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.3)]',
  },
  'error': {
    text: 'Phiên live bị lỗi',
    className: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
  },
};

function StatusBadgeLivestream({ status }) {
  const config = badgeConfig[status] || {
    text: status,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className={`flex items-center justify-center px-2 py-0.5 gap-[6px] rounded-md ${config.className} text-xs font-semibold shrink-0`}>
      {config.text}
    </div>
  );
}

const privacyBadgeConfig = {
  [SESSION_PRIVACY.Public.value]: {
    text: SESSION_PRIVACY.Public.label,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  [SESSION_PRIVACY.Private.value]: {
    text: SESSION_PRIVACY.Private.label,
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  },
  [SESSION_PRIVACY.Unlisted.value]: {
    text: SESSION_PRIVACY.Unlisted.label,
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
};

function PrivacyBadgeLivestream({ privacy }) {
  const config = privacyBadgeConfig[privacy] || {
    text: privacy,
    className: 'bg-gray-100/10 text-gray-400 border-gray-500/20'
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${config.className}`}>
      {config.text}
    </span>
  );
}

export { PrivacyBadgeLivestream, StatusBadgeLivestream };