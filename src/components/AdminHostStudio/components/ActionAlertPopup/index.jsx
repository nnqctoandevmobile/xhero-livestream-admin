'use client';

import React from 'react';

export const ActionAlertPopup = ({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  actionText = 'ĐỒNG Ý'
}) => {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <>
      <style>{`
        @keyframes modalPopIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          bg-black/70 backdrop-blur-xl
          animate-in fade-in duration-200
        "
      >
        <div
          className={`
            w-[90%] max-w-[400px]
            rounded-[20px]
            p-8
            text-center
            border
            shadow-2xl
            animate-[modalPopIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]
            bg-[linear-gradient(160deg,#222222_0%,#0f0f0f_100%)]

            ${isError
              ? 'border-red-500/30 shadow-[0_25px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(255,77,77,0.1)]'
              : 'border-[#d4af37]/30 shadow-[0_25px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.05)]'
            }
          `}
        >

          {/* Icon */}
          <div
            className={`
              w-[70px] h-[70px]
              rounded-full
              border-2
              flex items-center justify-center
              mx-auto mb-5

              ${isError
                ? 'bg-red-500/10 border-red-500 shadow-[inset_0_0_15px_rgba(255,77,77,0.2)]'
                : 'bg-[#d4af37]/10 border-[#d4af37] shadow-[inset_0_0_15px_rgba(212,175,55,0.2)]'
              }
            `}
          >
            {isError ? (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff4d4d"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          {title && (
            <h3
              className={`
                text-[20px]
                font-extrabold
                mb-3
                tracking-[1px]
                uppercase

                ${isError
                  ? 'text-red-500'
                  : 'bg-[linear-gradient(90deg,#fcf6ba_0%,#d4af37_40%,#fcf6ba_60%,#aa771c_100%)] bg-clip-text text-transparent'
                }
              `}
            >
              {title}
            </h3>
          )}

          {/* Message */}
          <p
            className="
              text-white/80
              text-[15px]
              leading-[1.6]
              mb-[30px]
              font-normal
            "
          >
            {message}
          </p>

          {/* Button */}
          <button
            onClick={onClose}
            className={`
              w-full
              rounded-xl
              py-[14px]
              px-4
              text-[14px]
              font-extrabold
              tracking-[1.5px]
              transition-all
              duration-200
              hover:-translate-y-[2px]

              ${isError
                ? `
                  bg-red-500
                  text-white
                  shadow-[0_10px_20px_rgba(255,77,77,0.2)]
                `
                : `
                  bg-[linear-gradient(90deg,#d4af37,#f3e5ab)]
                  text-black
                  shadow-[0_10px_20px_rgba(212,175,55,0.2)]
                `
              }
            `}
          >
            {actionText}
          </button>
        </div>
      </div>
    </>
  );
};