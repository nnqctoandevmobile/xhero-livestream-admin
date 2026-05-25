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

export const DEFAULT_TAGS = [
  {
    value: 'fengshui',
    label: 'Phong Thủy'
  },
  {
    value: 'tailoc',
    label: 'Tài Lộc'
  },
  {
    value: 'daogiao',
    label: 'Đạo Giáo'
  },
  {
    value: 'battu',
    label: 'Bát Tự',
  },
  {
    value: 'bds',
    label: 'Bất Động Sản',
  },
  {
    value: 'thinhvuong ',
    label: 'Thịnh Vượng'
  },
  {
    value: 'anlac',
    label: 'An Lạc'
  },
  {
    value: 'suckhoe',
    label: 'Sức Khỏe'
  },
  {
    value: 'phongthuyxe',
    label: 'Phong Thủy Xe'
  },
  {
    value: 'hoctap',
    label: 'Học Tập'
  },
]