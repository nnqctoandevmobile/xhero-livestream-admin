import React, { useState, useEffect, useRef } from 'react';
import { DatePicker, ConfigProvider, theme, Button, message, Switch } from 'antd';
import dayjs from 'dayjs';
import vi_VN from 'antd/es/date-picker/locale/vi_VN';
import images from '../../../../config/images';
import FileUploadSection from '../components/FileUploadSection';
import { AdminPanelService } from '../../../../api';
import { useUI } from '../../../../hook/useUI';
import { rtdb } from '../../../../core/firebase';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hook/useAuth';

const api = new AdminPanelService()

const getEmbedUrl = (url) => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const getAntMediaApiUrl = () => {
  const server = import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER;
  const port = import.meta.env.NEXT_PUBLIC_ANT_MEDIA_PORT;
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';

  if (port === '443' || port === '80' || !port) {
    return `${protocol}//${server}/LiveApp`;
  }
  return `${protocol}//${server}:${port}/LiveApp`;
};

export default function NewSession({ setTab }) {
  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    startTime: '',
    bannerFile: null,
    bannerFit: 'cover',
    videoUrl: '',
    audioFile: null,
    description: '',
    isNotify: false,
    notifyTitle: '',
    notifyContent: '',
    notifyTarget: 'all',
    notifyTargetIds: '',
    notifyTime: '',
    notifyImageFile: null,
    streamIdInput: '',
    hasPassword: false,
    roomPassword: '',
    privacy: 'public',
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [uploadingBannerFile, setUploadingBannerFile] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadingAudioFile, setUploadingAudioFile] = useState(false);
  const [notifyImageFile, setNotifyImageFile] = useState(null);
  const [uploadingNotifyImageFile, setUploadingNotifyImageFile] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const { user } = useAuth();
  const { loading, setLoading } = useUI();
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const adminPanelService = new AdminPanelService();

  useEffect(() => {
    return () => {
      if (formData.bannerFile?.url) URL.revokeObjectURL(formData.bannerFile.url);
      if (formData.audioFile?.url) URL.revokeObjectURL(formData.audioFile.url);
      if (formData.notifyImageFile?.url) URL.revokeObjectURL(formData.notifyImageFile.url);
    };
  }, [formData.bannerFile?.url, formData.audioFile?.url, formData.notifyImageFile?.url]);

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'title' && !value.trim()) error = 'Vui lòng nhập tên phiên';
    if (name === 'hostName' && !value.trim()) error = 'Vui lòng nhập tên host';
    if (name === 'startTime' && !value) error = 'Vui lòng chọn thời gian bắt đầu';
    if (name === 'notifyTitle' && !value) error = 'Vui lòng nhập tiêu đề thông báo';
    if (name === 'notifyContent' && !value) error = 'Vui lòng nhập nội dung thông báo';
    if (name === 'streamIdInput' && !value.trim()) error = 'Vui lòng nhập Stream ID';
    if (name === 'roomPassword' && formData.hasPassword && !value.trim()) error = 'Vui lòng nhập mật mã phòng';

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidTitle = validateField('title', formData.title);
    const isValidHost = validateField('hostName', formData.hostName);
    const isValidTime = validateField('startTime', formData.startTime);
    const isValidNotifyTitle = validateField('notifyTitle', formData.notifyTitle);
    const isValidNotifyContent = validateField('notifyContent', formData.notifyContent);
    const isValidRoomId = validateField('streamIdInput', formData.streamIdInput);
    const isValidPassword = formData.hasPassword ? validateField('roomPassword', formData.roomPassword) : true;
    let _id = undefined;

    if (!isValidTitle) {
      message.error('Vui lòng điền tên phiên livestream');
      return;
    }
    if (!isValidHost) {
      message.error('Vui lòng điền tên host');
      return;
    }
    if (!isValidTime) {
      message.error('Vui lòng chọn thời gian bắt đầu');
      return;
    }
    if (!isValidRoomId) {
      message.error('Vui lòng nhập Stream ID');
      return;
    }
    if (!isValidPassword) {
      message.error('Vui lòng nhập mật mã phòng');
      return;
    }
    if (formData.isNotify && (!isValidNotifyTitle || !isValidNotifyContent)) {
      message.error('Vui lòng điền tiêu đề và nội dung thông báo');
      return;
    }
    // 1. Sync room title to Ant Media Server via REST API
    // try {
    //   const apiUrl = getAntMediaApiUrl();
    //   await fetch(`${apiUrl}/rest/v2/broadcasts/${formData.streamIdInput}`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ name: formData.title })
    //   });
    //   console.log('Successfully synced room title to Ant Media Server:', formData.title);
    // } catch (apiErr) {
    //   console.warn('Failed to sync room title to Ant Media Server:', apiErr);
    // }

    try {
      setLoading(true);
      const baseLink = import.meta.env.NEXT_PUBLIC_LIVESTREAM_URL;
      const hostUrl = `${baseLink}/host/${formData.streamIdInput}`;
      const joinUrl = `${baseLink}/live/${formData.streamIdInput}`;
      const startAtStr = formData.startTime ? dayjs(formData.startTime).format('YYYY-MM-DD HH:mm') : null;

      const payload = {
        authenticateSettings: {
          username: null,
          password: null
        },
        info: {
          name: formData.title || undefined,
          description: formData.description || '',
          thumbnailUrl: {
            mobile: formData.bannerFile?.url || '',
            tablet: formData.bannerFile?.url || ''
          },
          banners: {
            mobile: formData.bannerFile?.url ? [formData.bannerFile.url] : [],
            tablet: formData.bannerFile?.url ? [formData.bannerFile.url] : []
          },
          privacy: formData.privacy,
          startAt: startAtStr
        },
        streamSettings: {
          streamId: formData.streamIdInput || '',
          // rtmp: {
          // serverUrl: `rtmp://${import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER || window.location.hostname}/LiveApp`,
          // streamKey: formData.streamIdInput || ''
          // },
          webrtc: {
            publishUrl: hostUrl,
            playUrl: joinUrl
          },
          // hls: {
          // playbackUrl: `https://${import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER || window.location.hostname}/LiveApp/streams/${formData.streamIdInput}.m3u8`
          // }
        },
        accessSettings: {
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`,
          accessPassword: formData.hasPassword ? formData.roomPassword : null
        },
        inStreamSettings: {
          countdown: {
            music: formData.audioFile?.url || '',
            video: formData.videoUrl || '',
            background: formData.bannerFile?.url || ''
          },
        },
        roles: {
          hostId: user.id,
          broadcasters: [user.id],
          moderators: [user.id],
        },
        metadata: {}
      };

      const res = await api.actCreateNewLivestream(payload);
      if (res && (res.success === false || res.status === false)) {
        if (res.message === 'Stream id is already being used. Please change stream id or keep it empty') message.error('Stream ID đã được sử dụng. Vui lòng chọn ID khác hoặc để trống.');
        else message.error(res.message);
        setLoading(false);
        return;
      }
      _id = res._id;
      setLoading(false);
      message.success('Đã khởi tạo phiên livestream thành công!');
    } catch (err) {
      console.warn(err);
      setLoading(false);
      return;
    }

    // 3. Handle Notification (Optional background task)
    if (formData.isNotify) {
      try {
        let payloadNotify = {
          title: formData.notifyTitle,
          text: formData.notifyContent,
          image: formData.notifyImageFile?.url || '',
        };
        if (formData.notifyTarget === 'all') {
          await adminPanelService.actPostNotification(payloadNotify);
        }
      } catch (error) {
        console.error('Error sending notification:', error);
        message.warning('Phiên live đã tạo nhưng không thể gửi thông báo.');
      }
    }

    let dateStr = 'Chưa xác định';
    let timeStr = '00:00:00';

    if (formData.startTime) {
      try {
        const date = dayjs(formData.startTime);

        if (date.isValid()) {
          dateStr = date.format('DD/MM/YYYY');
          timeStr = date.format('HH:mm:ss');
        }
      } catch (e) {
        console.error('Error parsing startTime in navigation:', e);
      }
    }

    setLoading(false);
    navigate('/admin-host-studio/' + _id);
  };

  return (
    <div className="relative pb-24">
      <section className="bg-[#0D1424] border border-[#1E2633] rounded-2xl overflow-hidden mb-6">
        <div className="!px-6 !py-5 border-b border-[#1E2633]">
          <h3 className="text-lg font-semibold text-white">
            Tạo phiên mới
          </h3>
          <p className="text-sm text-[#7E8CA8] mt-1">
            Thiết lập cấu hình và tạo phòng livestream mới
          </p>
        </div>

        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-full border-r border-[#1E2633] p-6">
            <form id="new-session-form" onSubmit={handleSubmit} className="space-y-8">

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Cột trái (60%) - Form */}
                <div className="w-full lg:w-[60%]">
                  {/* Nhóm 1: Thông tin cơ bản */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-base border-b border-[#1E2633] pb-2">
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#7E8CA8] mb-1">
                          Tên phiên livestream <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Ví dụ: Livestream Ra mắt sản phẩm"
                          className={`w-full bg-[#151D2C] border ${errors.title ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                        />
                        {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
                      </div>
                      <div>
                        <label className="block text-sm text-[#7E8CA8] mb-1">
                          Stream ID (Ant Media) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="streamIdInput"
                          value={formData.streamIdInput}
                          onChange={handleChange}
                          placeholder="Ví dụ: room_123"
                          className={`w-full bg-[#151D2C] border ${errors.streamIdInput ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                        />
                        {errors.streamIdInput && <span className="text-red-500 text-xs mt-1 block">{errors.streamIdInput}</span>}
                      </div>

                      <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2633] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white text-sm font-medium">Bảo mật phòng</h5>
                            <p className="text-xs text-[#7E8CA8]">Yêu cầu mật mã để tham gia phiên live</p>
                          </div>
                          <Switch
                            checked={formData.hasPassword}
                            onChange={(checked) => {
                              setFormData(prev => ({ ...prev, hasPassword: checked }));
                              if (!checked) setErrors(prev => ({ ...prev, roomPassword: '' }));
                            }}
                          />
                        </div>

                        {formData.hasPassword && (
                          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm text-[#7E8CA8] mb-1">
                              Mật mã tham gia <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="roomPassword"
                              value={formData.roomPassword}
                              onChange={handleChange}
                              placeholder="Nhập mật mã ví dụ: 123456"
                              className={`w-full bg-[#151D2C] border ${errors.roomPassword ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                            />
                            {errors.roomPassword && <span className="text-red-500 text-xs mt-1 block">{errors.roomPassword}</span>}
                          </div>
                        )}
                      </div>

                      <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2633] space-y-4">
                        <div>
                          <h5 className="text-white text-sm font-medium">Quyền riêng tư (Privacy)</h5>
                          <p className="text-xs text-[#7E8CA8]">Thiết lập quyền truy cập cho phiên livestream</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { value: 'public', label: 'Công khai (Public)', desc: 'Mọi người đều có thể tìm thấy và xem được' },
                            { value: 'private', label: 'Riêng tư (Private)', desc: 'Chỉ những người có link hoặc quyền mới được xem' },
                            { value: 'unlisted', label: 'Không hiển thị (Unlisted)', desc: 'Chỉ người có link mới xem được (ẩn khỏi danh sách)' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, privacy: opt.value }))}
                              className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between ${formData.privacy === opt.value
                                ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                                : 'border-[#2A3441] bg-[#151D2C] hover:border-[#CBD5E1]/30'
                                }`}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.privacy === opt.value ? 'border-[#D4AF37]' : 'border-[#4F5E7B]'
                                    }`}>
                                    {formData.privacy === opt.value && (
                                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></div>
                                    )}
                                  </div>
                                  <span className={`text-xs font-bold transition-colors ${formData.privacy === opt.value ? 'text-white' : 'text-[#7E8CA8]'
                                    }`}>
                                    {opt.label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#4F5E7B] leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#7E8CA8] mb-1">
                            Tên Host <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="hostName"
                            value={formData.hostName}
                            onChange={handleChange}
                            placeholder="Nhập tên người chủ trì"
                            className={`w-full bg-[#151D2C] border ${errors.hostName ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                          />
                          {errors.hostName && <span className="text-red-500 text-xs mt-1 block">{errors.hostName}</span>}
                        </div>
                        <div>
                          <label className="block text-sm text-[#7E8CA8] mb-1">
                            Thời gian bắt đầu <span className="text-red-500">*</span>
                          </label>
                          <ConfigProvider
                            theme={{
                              algorithm: theme.darkAlgorithm,
                              components: {
                                DatePicker: {
                                  colorBgContainer: '#151D2C',
                                  colorBorder: errors.startTime ? '#ef4444' : '#2A3441',
                                  colorPrimary: '#3B82F6',
                                  controlHeight: 46,
                                  borderRadius: 8,
                                }
                              }
                            }}
                          >
                            <DatePicker
                              showTime
                              format="DD/MM/YYYY HH:mm"
                              placeholder="Chọn thời gian bắt đầu"
                              value={formData.startTime ? dayjs(formData.startTime) : null}
                              onChange={(date) => {
                                const val = date ? date.toISOString() : '';
                                setFormData(prev => ({ ...prev, startTime: val }));
                                validateField('startTime', val);
                              }}
                              style={{ width: '100%' }}
                              locale={vi_VN}
                            />
                          </ConfigProvider>
                          {errors.startTime && <span className="text-red-500 text-xs mt-1 block">{errors.startTime}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Nhóm 2: Nội dung truyền thông */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-base border-b border-[#1E2633] pb-2">
                      Nội dung truyền thông
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        <div className="flex flex-col h-full">
                          <label className="block text-sm text-[#7E8CA8] mb-1">
                            Ảnh Banner
                          </label>
                          <FileUploadSection
                            accept="image/*"
                            uploadType="image"
                            uploadedFile={bannerFile}
                            setUploadedFile={setBannerFile}
                            setUploadingFile={setUploadingBannerFile}
                            onChange={(file) => {
                              setFormData((prev) => ({ ...prev, bannerFile: file }));
                              setBannerFile(file);
                            }}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex flex-col h-full">
                          <label className="block text-sm text-[#7E8CA8] mb-1">
                            Âm thanh/Nhạc nền
                          </label>
                          <FileUploadSection
                            accept="audio/*"
                            uploadType="audio"
                            uploadedFile={audioFile}
                            setUploadedFile={setAudioFile}
                            setUploadingFile={setUploadingAudioFile}
                            onChange={(file) => {
                              setFormData((prev) => ({ ...prev, audioFile: file }));
                              setAudioFile(file);
                            }}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-[#7E8CA8] mb-1">
                          Link Video (Intro/Promo)
                        </label>
                        <input
                          type="url"
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleChange}
                          placeholder="Nhập đường dẫn video (Youtube, Vimeo...)"
                          className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#7E8CA8] mb-1">
                          Mô tả ngắn gọn
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Nhập mô tả về nội dung phiên livestream..."
                          className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-2.5 text-white outline-none transition-colors resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Cột phải (40%) - Preview */}
                <div className="w-full lg:w-[40%] flex flex-col mt-8 lg:mt-0">
                  <h4 className="text-white font-medium text-base border-b border-[#1E2633] pb-2 mb-6">
                    Preview màn hình chờ
                  </h4>
                  <div
                    className="w-full aspect-video rounded-xl overflow-hidden relative border border-[#1E2633] shadow-2xl flex flex-col items-center p-4 lg:p-6 mx-auto"
                    style={{
                      backgroundImage: formData.bannerFile?.previewUrl ? `url(${formData.bannerFile.previewUrl})` : 'none',
                      backgroundSize: formData.bannerFit || 'cover',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: '#0D1424'
                    }}
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-[#090D14]/80 backdrop-blur-[2px]"></div>
                    {/* Audio Player Logic */}
                    {formData.audioFile?.previewUrl && (
                      <>
                        <audio ref={audioRef} src={formData.audioFile?.previewUrl} loop />
                        <button
                          type="button"
                          onClick={toggleAudio}
                          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full transition-all border border-white/10 shadow-lg"
                          title={isPlayingAudio ? "Tắt âm thanh" : "Bật âm thanh"}
                        >
                          {isPlayingAudio ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center w-full h-full justify-start pt-6 scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-center">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF5C3] to-[#D4AF37] uppercase line-clamp-2">
                          {formData.title || 'XHERO LIVESTREAM'}
                        </h2>
                        <p className="text-[#A6B5D6] text-[10px] tracking-widest mt-1 uppercase">
                          Phiên live sẽ bắt đầu vào <span className="text-[#D4AF37] font-semibold">{formData.startTime ? dayjs(formData.startTime).format('HH:mm - DD/MM/YYYY') : '20:30 - TỐI NAY'}</span>
                        </p>
                      </div>
                      {/* Countdown Mock */}
                      <div className="flex items-center gap-2 mb-8">
                        <div className="flex gap-1">
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">1</div>
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">1</div>
                        </div>
                        <span className="text-[#D4AF37] text-2xl font-bold mb-1 mx-1">:</span>
                        <div className="flex gap-1">
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">4</div>
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">3</div>
                        </div>
                        <span className="text-[#D4AF37] text-2xl font-bold mb-1 mx-1">:</span>
                        <div className="flex gap-1">
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">1</div>
                          <div className="bg-[#151D2C] border border-white/5 w-12 h-16 rounded flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-lg shadow-black/50">8</div>
                        </div>
                      </div>
                      {/* Form Skeleton */}
                      <div className="w-full max-w-sm border-t border-white/10 pt-5">
                        <h3 className="text-[#D4AF37] text-xs font-bold text-center uppercase tracking-wider mb-4">
                          Đăng ký tư vấn trực tiếp
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="h-8 bg-white/5 rounded border border-white/10 px-3 flex items-center">
                            <div className="h-2 bg-white/20 rounded w-16"></div>
                          </div>
                          <div className="h-8 bg-white/5 rounded border border-white/10 px-3 flex items-center">
                            <div className="h-2 bg-white/20 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-white/5 rounded border border-white/10 mb-2 px-3 flex items-center">
                          <div className="h-2 bg-white/20 rounded w-24"></div>
                        </div>
                        <div className="h-16 bg-white/5 rounded border border-white/10 mb-4 p-3">
                          <div className="h-2 bg-white/20 rounded w-32"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-9 bg-gradient-to-r from-[#D4AF37] to-[#AA8022] rounded flex-1 flex items-center justify-center">
                            <div className="h-2.5 bg-black/40 rounded w-32"></div>
                          </div>
                          <div className="h-9 bg-white/5 border border-white/10 rounded w-1/3 flex items-center justify-center">
                            <div className="h-2.5 bg-white/40 rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Floating Video Preview Inside Box */}
                    {formData.videoUrl && (
                      <div
                        className={`absolute z-[70] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVideoExpanded
                          ? 'inset-0 bg-black rounded-xl'
                          : 'bottom-4 right-4 w-32 sm:w-40 md:w-48 aspect-video bg-[#151D2C] rounded-lg overflow-hidden shadow-2xl border border-white/20 group cursor-pointer hover:ring-2 hover:ring-[#3B82F6]/50'
                          }`}
                        onClick={() => {
                          if (!isVideoExpanded) setIsVideoExpanded(true);
                        }}
                      >
                        {/* Header / Controls */}
                        <div className={`flex justify-end items-center ${isVideoExpanded ? 'absolute top-3 right-3 z-10' : 'absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10'}`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsVideoExpanded(!isVideoExpanded);
                            }}
                            className="bg-black/50 hover:bg-black/80 text-white p-1 md:p-1.5 rounded-md md:rounded-lg backdrop-blur-sm transition-colors border border-white/10"
                          >
                            {isVideoExpanded ? (
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Video Player */}
                        <div className={`w-full h-full relative overflow-hidden pointer-events-auto bg-[#151D2C] flex items-center justify-center ${isVideoExpanded ? 'rounded-xl' : 'rounded-lg'}`}>
                          {(() => {
                            const embedUrl = getEmbedUrl(formData.videoUrl);
                            const isMp4 = embedUrl.toLowerCase().endsWith('.mp4');
                            if (isMp4) {
                              return <video src={embedUrl} controls className="w-full h-full object-cover bg-black" />;
                            } else {
                              return <iframe src={embedUrl} className="w-full h-full pointer-events-auto" allowFullScreen allow="autoplay; encrypted-media" />;
                            }
                          })()}
                        </div>
                        {/* Overlay to prevent iframe absorbing clicks when minimized */}
                        {!isVideoExpanded && (
                          <div className="absolute inset-0 bg-transparent z-[5]"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs text-[#7E8CA8] mt-4 max-w-sm mx-auto leading-relaxed">
                    * Ảnh banner sẽ được sử dụng làm hình nền cho màn hình đếm ngược trước khi livestream bắt đầu.
                  </p>
                </div>
              </div>
              {/* Nhóm 3: Cài đặt thông báo & Preview */}
              <div className="flex flex-col lg:flex-row gap-4 mt-8">
                {/* Cột trái (60%) - Cài đặt */}
                <div className="w-full lg:w-[60%] space-y-4">
                  <h4 className="text-white font-medium text-base border-b border-[#1E2633] pb-2">
                    Cài đặt thông báo
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="isNotify"
                          checked={formData.isNotify}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isNotify ? 'bg-blue-600' : 'bg-[#2A3441]'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isNotify ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm text-white">Gửi thông báo Push đến người dùng</span>
                    </label>

                    {formData.isNotify && (
                      <div className="animate-fade-in transition-all w-full space-y-5 bg-[#111827] p-5 rounded-xl border border-[#1E2633]">
                        {/* Tiêu đề & Hẹn giờ */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[#7E8CA8] mb-1">
                              Tiêu đề thông báo<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="notifyTitle"
                              value={formData.notifyTitle}
                              onChange={handleChange}
                              placeholder="Ví dụ: Livestream sắp bắt đầu!"
                              className={`w-full bg-[#151D2C] border ${errors.notifyTitle ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors`}
                            />
                            {errors.notifyTitle && <span className="text-red-500 text-xs mt-1 block">{errors.notifyTitle}</span>}
                          </div>
                          <div>
                            <label className="block text-sm text-[#7E8CA8] mb-1">
                              Hẹn giờ Push <span className="text-[#64748B] text-xs">(Bỏ trống để gửi ngay)</span>
                            </label>
                            <ConfigProvider
                              theme={{
                                algorithm: theme.darkAlgorithm,
                                components: {
                                  DatePicker: {
                                    colorBgContainer: '#151D2C',
                                    colorBorder: '#2A3441',
                                    colorPrimary: '#3B82F6',
                                    controlHeight: 46,
                                    borderRadius: 8,
                                  }
                                }
                              }}
                            >
                              <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn thời gian gửi"
                                value={formData.notifyTime ? dayjs(formData.notifyTime) : null}
                                onChange={(date) => {
                                  const val = date ? date.toISOString() : '';
                                  setFormData(prev => ({ ...prev, notifyTime: val }));
                                }}
                                style={{ width: '100%' }}
                              />
                            </ConfigProvider>
                          </div>
                        </div>

                        {/* Nội dung */}
                        <div>
                          <label className="block text-sm text-[#7E8CA8] mb-1">
                            Nội dung thông báo<span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="notifyContent"
                            value={formData.notifyContent}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Nhập nội dung ngắn gọn..."
                            className={`w-full bg-[#151D2C] border ${errors.notifyContent ? 'border-red-500' : 'border-[#2A3441] focus:border-[#3B82F6]'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors resize-none`}
                          ></textarea>
                          {errors.notifyContent && <span className="text-red-500 text-xs mt-1 block">{errors.notifyContent}</span>}
                        </div>

                        {/* Đối tượng & Ảnh đính kèm */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[#7E8CA8] mb-1">
                              Đối tượng nhận
                            </label>
                            <select
                              name="notifyTarget"
                              value={formData.notifyTarget}
                              onChange={handleChange}
                              className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-[11px] text-white outline-none transition-colors appearance-none cursor-pointer"
                            >
                              <option value="all">Tất cả người dùng</option>
                              <option value="specific">Khách hàng cụ thể</option>
                            </select>

                            {formData.notifyTarget === 'specific' && (
                              <div className="mt-3 animate-fade-in">
                                <input
                                  type="text"
                                  name="notifyTargetIds"
                                  value={formData.notifyTargetIds}
                                  onChange={handleChange}
                                  placeholder="Nhập ID/Email (cách nhau dấu phẩy)"
                                  className="w-full bg-[#151D2C] border border-[#2A3441] focus:border-[#3B82F6] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-[#7E8CA8] mb-1">
                              Ảnh đính kèm
                            </label>
                            <FileUploadSection
                              accept="image/*"
                              uploadType="image"
                              uploadedFile={notifyImageFile}
                              setUploadedFile={setNotifyImageFile}
                              setUploadingFile={setUploadingNotifyImageFile}
                              onChange={(file) => {
                                setFormData((prev) => ({ ...prev, notifyImageFile: file }));
                                setNotifyImageFile(file);
                              }}
                            // onChange={handleNotifyImageUpload}
                            // title="Nhấp để tải ảnh lên"
                            // description="PNG, JPG, GIF lên đến 5MB"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột phải (40%) - Preview hiển thị */}
                <div className="w-full lg:w-[40%] flex flex-col">
                  <h4 className="text-white font-medium text-base border-b border-[#1E2633] pb-2 mb-6">
                    Preview thông báo
                  </h4>
                  {formData.isNotify ? (
                    <div className="flex-1 flex flex-col items-center">
                      {/* Mockup Notification */}
                      <div className="items-center justify-between gap-2 bg-[#151D2C] rounded-2xl p-3 shadow-lg border border-white/5 relative overflow-hidden flex w-full max-w-sm">
                        <img
                          src={images.logoXHeroApp}
                          alt="Logo XHero"
                          className="w-12 h-12 object-contain"
                        />
                        <div className="flex gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-semibold text-sm truncate">{formData.notifyTitle || 'Tiêu đề thông báo'}</h5>
                            <p className="text-[#A6B5D6] text-xs mt-1 line-clamp-2 leading-relaxed">{formData.notifyContent || 'Nội dung thông báo sẽ hiển thị ở đây.'}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2 mb-2">
                            <span className="text-white/40 text-[10px] ml-auto">Bây giờ</span>
                            {formData.notifyImageFile?.url && (
                              <div className="w-8 h-8 rounded-lg bg-[#0B111D] shrink-0 overflow-hidden border border-white/10 shadow-inner">
                                <img src={formData.notifyImageFile?.url} alt="preview" className="w-full h-full object-cover object-center" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#1E2633] rounded-xl p-6 text-[#7E8CA8] text-sm text-center">
                      Bật "Gửi thông báo Push" để xem trước
                    </div>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[220px] right-0 bg-[#0D1424] border-t border-[#1E2633] p-4 flex justify-end z-40">
        <div className="flex items-center gap-3 w-full px-6">
          <div className="flex-1"></div>
          <button
            onClick={() => setTab("sessionList")}
            type="button"
            className="px-6 py-2.5 rounded-lg font-medium text-[#7E8CA8] hover:text-white hover:bg-[#151D2C] transition-colors"
          >
            Hủy bỏ
          </button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || uploadingAudioFile || uploadingBannerFile || uploadingNotifyImageFile}
            // disabled={loading || uploadingAudioFile || uploadingBannerFile || uploadingNotifyImageFile}
            form="new-session-form"
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            Lưu & Tạo phiên
          </Button>
        </div>
      </div>
    </div>
  );
}