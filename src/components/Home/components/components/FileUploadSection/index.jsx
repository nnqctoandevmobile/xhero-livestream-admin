import React, { useRef, useState } from 'react';
import { message, Progress } from 'antd';
import { UploadService } from '../../../../../api';

const uploadService = new UploadService();
const CHUNK_SIZE = 5 * 1024 * 1024;

export default function FileUploadSection({
  accept = '*/*',
  uploadType = '',
  uploadedFile,
  setUploadedFile,
  setUploadingFile,
  onChange,
  className = '',
}) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  let title = '';
  let description = '';
  if (uploadType === 'image') {
    title = 'Nhấp để tải ảnh lên';
    description = 'Định dạng hỗ trợ: JPG, PNG, GIF';
  } else if (uploadType === 'audio') {
    title = 'Nhấp để tải tệp âm thanh lên';
    description = 'Định dạng hỗ trợ: MP3, WAV, OGG';
  }

  const uploadFileInChunks = async (file, onProgress) => {
    const initRes = await uploadService.actInitMultipartUpload({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      group: 'consuluting-profile',
    });
    const { uploadId, key } = initRes.data;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const parts = [];
    for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const res = await uploadService.actUploadMultipartPart(
        {
          uploadId,
          key,
          partNumber,
        },
        chunk
      );
      if (!res?.data?.ETag) {
        throw new Error(`Upload part ${partNumber} failed`);
      }
      parts.push({
        PartNumber: partNumber,
        ETag: res.data.ETag.replace(/"/g, ''),
      });
      const percent = Math.round((partNumber / totalChunks) * 100);
      onProgress(percent);
    }
    parts.sort((a, b) => a.PartNumber - b.PartNumber);
    const completeRes = await uploadService.actCompleteMultipartUpload({
      uploadId,
      key,
      parts,
    });
    return completeRes.data.url;
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const previewUrl =
      file.type?.startsWith('image/') ||
        file.type?.startsWith('audio/')
        ? URL.createObjectURL(file)
        : null;
    setUploadingFile?.(true);
    setUploadProgress(0);
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      uploading: true,
      uploadProgress: 0,
      file,
    });

    try {
      const url = await uploadFileInChunks(file, (percent) => {
        setUploadProgress(percent);
        setUploadedFile((prev) => ({
          ...prev,
          uploadProgress: percent,
        }));
      });
      setUploadedFile((prev) => ({
        ...prev,
        url,
        uploading: false,
        uploadProgress: 100,
      }));
      onChange?.({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        url,
        file,
      });
      message.success('Upload thành công');
    } catch (err) {
      console.error(err);
      setUploadedFile(null);
      onChange?.(null);
      message.error('Upload thất bại');
    } finally {
      setUploadingFile?.(false);
    }
  };

  const handleChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (uploadedFile?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedFile.previewUrl);
    }
    setUploadedFile(null);
    onChange?.(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    message.success('Đã xóa file');
  };
  return (
    <div
      className={`relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragActive
        ? 'border-blue-500 bg-blue-500/10'
        : uploadedFile
          ? 'border-[#3B82F6] bg-[#151D2C]'
          : 'border-[#2A3441] bg-[#151D2C] hover:border-[#3B82F6] hover:bg-[#1A2333]'
        } ${className}`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        ref={fileInputRef}
      />

      {uploadedFile ? (
        <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <span className="text-sm font-medium text-white text-center break-all max-w-[80%]">
            {uploadedFile.name || 'Tệp đã chọn'}
          </span>

          {uploadedFile.size && (
            <span className="text-xs text-[#7E8CA8] mt-1">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          )}

          {uploadedFile.uploading && (
            <div className="w-full mt-4">
              <Progress percent={uploadProgress} size="small" />
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
            className="mt-4 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
          >
            Gỡ tệp
          </button>
        </div>
      ) : (
        <>
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-blue-500/20' : 'bg-[#1A2333]'
              }`}
          >
            <svg
              className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-[#3B82F6]'
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="text-sm text-white font-medium mb-1">
            <span className="text-blue-500">{title}</span> hoặc kéo thả vào đây
          </p>

          <p className="text-xs text-[#7E8CA8]">{description}</p>
        </>
      )}
    </div>
  );
}