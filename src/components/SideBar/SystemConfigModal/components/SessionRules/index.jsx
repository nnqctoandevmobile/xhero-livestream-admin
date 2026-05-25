import React, { useState } from 'react';
import { DEFAULT_TAGS } from '../../../../../core/constants';
import ConfigSection from '../components/ConfigSection';
import ConfigTab from '../components/ConfigTab';
import SwitchInput from '../components/SwitchInput';

export default function SessionRules() {
  // Categories list (kept in local state to manage active tags list)
  const [categories, setCategories] = useState(DEFAULT_TAGS);

  // Input state for adding new category
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleToggleCategory = (index) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, active: !cat.active } : cat))
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories((prev) => [
        ...prev,
        { label: newCategoryName, value: newCategoryName.trim(), active: true },
      ]);
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  return (
    <ConfigTab
      title="Quy tắc phiên"
      description="Các quy tắc áp dụng cho mỗi phiên live — thời gian, danh mục, QR và link sinh tự động."
    >
      <ConfigSection title="Notification mặc định cho host">
        <div className="bg-[#1E2633]/30 border border-[#1E2633] rounded-xl p-4">
          <p className="text-xs text-[#7E8CA8]">
            Admin có thể bật/tắt từng mốc thông báo. Các mốc này được tính từ plannedStartDate.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <SwitchInput
            name="notification24h"
            initialValue={true}
            title="Thông báo 24 giờ trước"
            description="Bạn có phiên live vào ngày mai..."
          />
          <SwitchInput
            name="notification60m"
            initialValue={true}
            title="Thông báo 60 phút trước"
            description="Phiên live bắt đầu sau 1 giờ..."
          />
          <SwitchInput
            name="notification15m"
            initialValue={true}
            title="Thông báo 15 phút trước"
            description="Vào Studio để chuẩn bị..."
          />
          <SwitchInput
            name="notificationOnTime"
            initialValue={true}
            title="Thông báo đúng giờ"
            description="Bắt đầu live ngay!"
          />
        </div>
      </ConfigSection>

      <ConfigSection title="Tài nguyên sinh tự động khi tạo phiên">
        <SwitchInput
          name="resourceQRCode"
          initialValue={true}
          title="Sinh QR vào Studio cho host"
          description="QR có token riêng, hết hạn sau khi phiên kết thúc"
        />
        <SwitchInput
          name="resourcePublicLink"
          initialValue={true}
          title="Sinh link viewer public"
          description="xhero.live/live/{{sessionId}} — hiển thị trên trang Lịch Học"
        />
        <SwitchInput
          name="resourceRTMPKey"
          initialValue={true}
          title="Sinh RTMP backup key"
          description="Stream key reset sau mỗi phiên, gửi kèm notification"
        />
        <SwitchInput
          name="resourceDeepLink"
          initialValue={true}
          title="Sinh deep-link app"
          description="xhero://studio/{{sessionId}} — mở thẳng Studio trên mobile"
        />
      </ConfigSection>

      <ConfigSection title="Danh mục mặc định">
        <div>
          <label className="block text-[10px] font-bold text-[#7E8CA8] uppercase tracking-wider mb-3">
            TƯƠNG ỨNG CATEGORY TRONG STREAM OBJECT
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat, index) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleToggleCategory(index)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  cat.active
                    ? 'bg-[#0f2e20] text-[#10B981] border-[#10B981] hover:bg-[#10B981]/20'
                    : 'bg-transparent text-[#7E8CA8] border-[#2A3441] hover:border-[#7E8CA8] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {isAdding ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!newCategoryName.trim()) {
                        setIsAdding(false);
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  className="px-3 py-1.5 bg-[#0D1424] border border-[#10B981] rounded-full text-xs text-white outline-none w-28"
                  placeholder="Tên danh mục..."
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2.5 py-1.5 bg-[#10B981] text-white hover:bg-[#059669] rounded-full text-xs font-bold transition-colors"
                >
                  Thêm
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 bg-transparent text-[#7E8CA8] border border-dashed border-[#2A3441] hover:border-white hover:text-white rounded-full text-xs font-bold transition-all"
              >
                + Thêm mới
              </button>
            )}
          </div>
        </div>
      </ConfigSection>
    </ConfigTab>
  );
}
