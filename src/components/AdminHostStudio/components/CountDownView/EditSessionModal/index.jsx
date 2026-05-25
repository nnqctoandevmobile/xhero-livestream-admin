import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, ConfigProvider, theme, message, Select, Image } from 'antd';
import dayjs from 'dayjs';
import vi_VN from 'antd/es/date-picker/locale/vi_VN';
import { AdminPanelService } from '../../../../../api';
import FileUploadSection from '../../../../Home/components/components/FileUploadSection';

const api = new AdminPanelService();
const TAGS_LIST = ["Phong Thuỷ", "An Lạc", "Tài Lộc", "Đạo Giáo", "Bát Tự", "Bất Động Sản", "Thịnh Vượng"];

export default function EditSessionModal({ open, onCancel, detailData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [hostList, setHostList] = useState([]);
  const [userList, setUserList] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    host: null,
    startTime: '',
    bannerFile: null,
    thumbnailFile: null,
    videoUrl: '',
    audioFile: null,
    tags: [],
    notifyTargetIds: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadingThumbnailFile, setUploadingThumbnailFile] = useState(false);
  const [uploadingBannerFile, setUploadingBannerFile] = useState(false);
  const [uploadingAudioFile, setUploadingAudioFile] = useState(false);

  useEffect(() => {
    if (open && detailData) {
      setFormData({
        title: detailData.info?.name || '',
        host: detailData.roles?.hostId || '',
        startTime: detailData.info?.startAt ? dayjs(detailData.info.startAt).toISOString() : '',
        videoUrl: detailData.inStreamSettings?.countdown?.video || '',
        tags: detailData.metadata?.tags || [],
      });
      // Existing URLs can be faked as files with URL property if needed by FileUploadSection
      if (detailData.inStreamSettings?.countdown?.background) {
        setBannerFile({ url: detailData.inStreamSettings.countdown.background });
      }
      if (detailData.info?.thumbnail) {
        setThumbnailFile({ url: detailData.info.thumbnail });
      }
      if (detailData.inStreamSettings?.countdown?.music) {
        setAudioFile({ url: detailData.inStreamSettings.countdown.music });
      }
      fetchHostList();
      fetchUserList();
    }
  }, [open, detailData]);

  const fetchHostList = async () => {
    try {
      const res = await api.actGetHostList({
        status: "active",
        typeConsulting: "dương trạch",
        skip: 0,
        limit: 1000,
      });
      const mappedData = res.data.data.map((item) => ({
        ...item,
        label: item.fullName,
        value: item._id,
      }));
      setHostList(mappedData);
    } catch (error) {
      console.error('Error fetching host list:', error);
    }
  };

  const fetchUserList = async (value = '') => {
    const params = { skip: 0, limit: 20, status: 'active', ...(value && { key: value }) };
    const res = await api.actGetUserList(params);
    const formatForSelect = res.data.data.map((i) => ({
      value: i?._id,
      label: i.fullName || i.username || '---',
      avatar: i?.avatar,
      fullName: i?.fullName,
      username: i?.username,
    }));
    setUserList(formatForSelect);
  };

  const handleSubmit = async () => {
    if (!formData.title) return message.error('Vui lòng nhập tên phiên');
    if (!formData.host || typeof formData.host !== 'object' || (!formData.host.value && !formData.host._id)) return message.error('Vui lòng chọn Host');

    setLoading(true);
    try {
      const payload = {
        info: {
          name: formData.title,
          startAt: formData.startTime,
          thumbnail: thumbnailFile?.url || '',
        },
        inStreamSettings: {
          countdown: {
            music: audioFile?.url || '',
            video: formData.videoUrl || '',
            background: bannerFile?.url || ''
          },
        },
        roles: {
          hostId: formData.host,
        },
        metadata: {
          tags: formData.tags
        }
      };

      await api.actUpdateLivestream(detailData._id, payload);
      message.success('Cập nhật phiên live thành công!');
      onSuccess();
    } catch (err) {
      message.error('Lỗi cập nhật phiên live');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa phiên Live"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading || uploadingAudioFile || uploadingBannerFile || uploadingThumbnailFile}
      width={800}
      className="dark-modal"
      okText="Lưu thay đổi"
      cancelText="Hủy"
      styles={{
        content: { backgroundColor: '#0D1424', color: 'white', border: '1px solid #1E2633' },
        header: { backgroundColor: '#0D1424', color: 'white', borderBottom: '1px solid #1E2633' },
        title: { color: 'white' }
      }}
    >
      <div className="space-y-6 mt-4">
        {/* Tên phiên */}
        <div>
          <label className="block text-sm text-[#7E8CA8] mb-1">Tên phiên <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Host */}
          <div>
            <label className="block text-sm text-[#7E8CA8] mb-1">Chọn Host <span className="text-red-500">*</span></label>
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, components: { Select: { controlHeight: 46 } } }}>
              <Select
                className="w-full"
                value={formData.host}
                onChange={(val) => setFormData(prev => ({ ...prev, host: val }))}
                options={hostList}
              />
            </ConfigProvider>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm text-[#7E8CA8] mb-1">Thời gian bắt đầu</label>
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, components: { DatePicker: { controlHeight: 46 } } }}>
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                value={formData.startTime ? dayjs(formData.startTime) : null}
                onChange={(date) => setFormData(prev => ({ ...prev, startTime: date ? date.toISOString() : '' }))}
                className="w-full"
                locale={vi_VN}
              />
            </ConfigProvider>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-[#7E8CA8] mb-3 uppercase tracking-wider">CHỦ ĐỀ - TAG</label>
          <div className="flex flex-wrap gap-2">
            {TAGS_LIST.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  tags: prev.tags?.includes(tag) ? prev.tags.filter(t => t !== tag) : [...(prev.tags || []), tag]
                }))}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${formData.tags?.includes(tag) ? 'bg-[#0f2e20] text-[#4ADE80] border-[#0f2e20]' : 'bg-transparent text-[#7E8CA8] border-[#2A3441]'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Files */}
        <div>
          <label className="block text-xs font-bold text-[#7E8CA8] mb-3 uppercase tracking-wider">BANNER / THUMBNAIL</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <div className="flex flex-col h-full">
              <label className="block text-sm text-[#7E8CA8] mb-1">Ảnh Thumbnail (16:9)</label>
              <FileUploadSection accept="image/*" uploadType="image" uploadedFile={thumbnailFile} setUploadedFile={setThumbnailFile} setUploadingFile={setUploadingThumbnailFile} />
            </div>
            <div className="flex flex-col h-full">
              <label className="block text-sm text-[#7E8CA8] mb-1">Ảnh Banner</label>
              <FileUploadSection accept="image/*" uploadType="image" uploadedFile={bannerFile} setUploadedFile={setBannerFile} setUploadingFile={setUploadingBannerFile} />
            </div>
            <div className="flex flex-col h-full">
              <label className="block text-sm text-[#7E8CA8] mb-1">Âm thanh/Nhạc nền</label>
              <FileUploadSection accept="audio/*" uploadType="audio" uploadedFile={audioFile} setUploadedFile={setAudioFile} setUploadingFile={setUploadingAudioFile} />
            </div>
          </div>
        </div>

        {/* Video Intro */}
        <div>
          <label className="block text-sm text-[#7E8CA8] mb-1">Video Intro (Tùy chọn)</label>
          <input
            type="text"
            value={formData.videoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
            placeholder="Nhập đường dẫn Youtube, Vimeo..."
            className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
          />
        </div>
      </div>
    </Modal>
  );
}
