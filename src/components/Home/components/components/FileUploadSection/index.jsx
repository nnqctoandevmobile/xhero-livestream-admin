import React, { useRef, useState } from 'react';

export default function FileUploadSection({
  accept = "*/*",
  onChange,
  value,
  title = "Nhấp để tải lên",
  description = "Định dạng hỗ trợ: tuỳ theo loại tệp"
}) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 bg-blue-500/10' :
        value ? 'border-[#3B82F6] bg-[#151D2C]' : 'border-[#2A3441] bg-[#151D2C] hover:border-[#3B82F6] hover:bg-[#1A2333]'
        }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
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

      {value ? (
        <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className="text-sm font-medium text-white text-center break-all max-w-[80%]">{value.name || 'Tệp đã chọn'}</span>
          {value.size && (
            <span className="text-xs text-[#7E8CA8] mt-1">{(value.size / 1024 / 1024).toFixed(2)} MB</span>
          )}
          <button
            type="button"
            onClick={clearFile}
            className="mt-4 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
          >
            Gỡ tệp
          </button>
        </div>
      ) : (
        <>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-blue-500/20' : 'bg-[#1A2333]'}`}>
            <svg className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-[#3B82F6]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <p className="text-sm text-white font-medium mb-1"><span className="text-blue-500">{title}</span> hoặc kéo thả vào đây</p>
          <p className="text-xs text-[#7E8CA8]">{description}</p>
        </>
      )}
    </div>
  );
}
