export const ACCESS_TOKEN_KEY = 'auth/token';
export const ACCESS_TOKEN_ERP_KEY = 'auth/token-erp';
export const USER_INFO = 'USER_INFO';

export const SESSION_STATUS = {
  Created: { label: 'Đã tạo', value: 'created' },
  Live: { label: 'Đang phát sóng', value: 'live' },
  Ended: { label: 'Đã kết thúc', value: 'ended' },
  Cancelled: { label: 'Đã hủy', value: 'cancelled' },
  Waiting: { label: 'Đang chờ', value: 'waiting' },
  Error: { label: 'Phiên live bị lỗi', value: 'error' }
};

export const SESSION_PRIVACY = {
  Public: { label: 'Công khai', value: 'public' },
  Private: { label: 'Riêng tư', value: 'private' },
  Unlisted: { label: 'Không công khai', value: 'unlisted' }
};

export const PLAYBACK_STATUS = {
  Processing: 'Processing',
  Ready: 'Ready',
  Error: 'Error',
};