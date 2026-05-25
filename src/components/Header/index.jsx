'use client';

import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import images from '../../config/images';
import { useAuth } from '../../hook/useAuth';
import Logo from './components/Logo';
import { useIsMobile } from '../../hook/useMediaQuery';
import { useState } from 'react';
import SideBar from '../SideBar';

export default function Header({ setIsDrawerOpen, isDrawerOpen }) {
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const isMobile = useIsMobile();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  }

  const handleLogout = () => {
    signout();
    navigate("/sign-in");
  };

  const items = [
    {
      key: 'profile',
      label: (
        <button
          onClick={() => navigate('/admin')}
          className="w-full text-left px-4 py-2">
          Hồ sơ
        </button>
      ),
    },
    {
      key: 'logout',
      label: (
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-400"
        >
          Đăng xuất
        </button>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-[100] h-30 md:h-20 flex items-center bg-[var(--bg-glass)] backdrop-blur-xl border-t-2 border-t-[var(--accent-gold)] border-b border-b-[var(--border-gold)] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between w-full">
        <Logo handleCloseDrawer={closeDrawer} />
        <div className='flex items-center justify-between md:justify-end w-full'>
          {isMobile &&
            <button className="mobile-menu-btn text-[var(--text-primary)]" onClick={toggleDrawer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isDrawerOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          }
          <div className="flex items-center gap-5">
            <button className="text-[var(--text-primary)] desktop-search-btn" title="Tìm kiếm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <div className="relative cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="18"
                height="18"
                viewBox="0 0 512 512"
                xmlSpace="preserve"
              >
                <g>
                  <path
                    d="M453.332 229.332c-8.832 0-16-7.168-16-16 0-61.27-23.848-118.848-67.156-162.176-6.25-6.25-6.25-16.383 0-22.633s16.383-6.25 22.636 0c49.344 49.364 76.52 115.008 76.52 184.809 0 8.832-7.168 16-16 16zM16 229.332c-8.832 0-16-7.168-16-16 0-69.8 27.18-135.445 76.543-184.789 6.25-6.25 16.387-6.25 22.637 0s6.25 16.387 0 22.637C55.852 94.484 32 152.062 32 213.332c0 8.832-7.168 16-16 16zM234.668 512c-44.117 0-80-35.883-80-80 0-8.832 7.168-16 16-16s16 7.168 16 16c0 26.477 21.523 48 48 48 26.473 0 48-21.523 48-48 0-8.832 7.168-16 16-16s16 7.168 16 16c0 44.117-35.883 80-80 80zm0 0"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M410.668 448h-352c-20.59 0-37.336-16.746-37.336-37.332a37.305 37.305 0 0 1 13.059-28.375c32.445-27.414 50.941-67.262 50.941-109.48v-59.481C85.332 130.988 152.32 64 234.668 64 317.012 64 384 130.988 384 213.332v59.48c0 42.22 18.496 82.067 50.73 109.333 8.512 7.253 13.27 17.597 13.27 28.523C448 431.254 431.254 448 410.668 448zm-176-352c-64.707 0-117.336 52.629-117.336 117.332v59.48c0 51.645-22.633 100.415-62.078 133.758-.746.64-1.922 1.965-1.922 4.098 0 2.898 2.434 5.332 5.336 5.332h352c2.898 0 5.332-2.434 5.332-5.332 0-2.133-1.172-3.457-1.879-4.055C374.633 373.227 352 324.457 352 272.813v-59.481C352 148.629 299.371 96 234.668 96zm0 0"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M234.668 96c-8.832 0-16-7.168-16-16V16c0-8.832 7.168-16 16-16s16 7.168 16 16v64c0 8.832-7.168 16-16 16zm0 0"
                    fill="#FFFFFF"
                  />
                </g>
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] px-1 rounded-full flex items-center justify-center font-bold w-3.5 h-3.5">3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">{user?.fullName || ''}</span>
              <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
              >
                <button className="cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] border border-[var(--accent-gold)] flex items-center justify-center text-[var(--accent-gold)] font-medium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header >
  );
}
