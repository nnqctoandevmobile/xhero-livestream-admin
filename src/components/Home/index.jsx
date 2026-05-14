import Header from '../Header';
import SideBar from '../SideBar';
import { useEffect, useState, useRef } from 'react';

import SessionList from './components/SessionList';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../core/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import NewSession from './components/NewSession';
import ConsultingForms from './components/ConsultingForms';
import Statistics from './components/Statistics';
import VideoPlayback from './components/VideoPlayback';
import { SESSION_STATUS } from '../../core/constants';
import { useIsMobile } from '../../hook/useMediaQuery';

export default function Home() {
  const [tab, setTab] = useState('sessionList');
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const prevLiveRoomsRef = useRef(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { isLogged } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLogged) {
      navigate('/sign-in');
    }
    const roomsRef = ref(rtdb, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      const parsedRooms = [];
      const hosts = new Set();
      let viewerTotal = 0;
      let liveCount = 0;
      let offlineCount = 0;
      const currentLiveRooms = new Set();

      if (data) {
        Object.entries(data).forEach(([roomId, roomNode]) => {
          const state = roomNode.state || {};
          const isLive = state.isLive === true;
          const viewers = typeof state.viewers === 'number' ? state.viewers : parseInt(state.viewers, 10) || 0;

          if (state.hostName) {
            hosts.add(state.hostName);
          }

          if (isLive) {
            liveCount += 1;
            currentLiveRooms.add(roomId);
          } else {
            offlineCount += 1;
          }

          viewerTotal += viewers;

          let calculatedStatus = '';
          if (isLive) {
            calculatedStatus = SESSION_STATUS.Live;
          } else {
            calculatedStatus = SESSION_STATUS.Ended; // default if no valid time
            if (state.dateStr && state.timeStr && state.dateStr !== 'Chưa xác định') {
              try {
                const parts = state.dateStr.includes('/') ? state.dateStr.split('/') : state.dateStr.split('-');
                if (parts.length === 3) {
                  const isYearFirst = parts[0].length === 4;
                  const year = parseInt(isYearFirst ? parts[0] : parts[2], 10);
                  const month = parseInt(parts[1], 10) - 1;
                  const day = parseInt(isYearFirst ? parts[2] : parts[0], 10);

                  const timeParts = state.timeStr.split(':');
                  const hour = parseInt(timeParts[0] || '0', 10);
                  const minute = parseInt(timeParts[1] || '0', 10);

                  const roomTime = new Date(year, month, day, hour, minute).getTime();
                  if (roomTime > Date.now()) {
                    calculatedStatus = SESSION_STATUS.Scheduled;
                  }
                }
              } catch (e) {
                console.error('Error parsing date:', e);
              }
            }
          }

          parsedRooms.push({
            id: roomId,
            host: state.hostName || 'XHERO Admin',
            title: state.roomTitle || 'Phiên live chưa đặt tên',
            viewers,
            status: calculatedStatus,
            dateStr: state.dateStr || 'Chưa xác định',
            timeStr: state.timeStr || '00:00'
          });
        });
      }

      // Detect if any room went from LIVE to offline
      const endedRooms = [];
      prevLiveRoomsRef.current.forEach(id => {
        if (!currentLiveRooms.has(id)) {
          endedRooms.push(id);
        }
      });

      if (endedRooms.length > 0) {
        setSelectedRoomId(endedRooms[0]);
        setTab('statistics');
      }

      prevLiveRoomsRef.current = currentLiveRooms;

      setRooms(parsedRooms.sort((a, b) => (a.status === SESSION_STATUS.Live ? -1 : 1)));
      // setTotalViewers(viewerTotal);
      // setActiveRooms(liveCount);
      // setOfflineRooms(offlineCount);
      // setHostsOnline(hosts.size);
      setIsLoading(false);
    }, (error) => {
      console.error('Failed to load admin rooms:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLogged]);

  const handleChangeTab = (tab) => {
    setTab(tab);
  };

  return (
    <div className="h-screen bg-[var(--bg-main, #09101a)] flex flex-col">
      <Header setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile */}
        {isDrawerOpen && isMobile && (
          <div 
            className="absolute inset-0 bg-black/50 z-[90] backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
        
        <SideBar tab={tab} setTab={setTab} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <main className="flex-1 p-2 md:p-6 overflow-y-auto">
          {tab === 'sessionList' && (
            <SessionList rooms={rooms} isLoading={false} handleChangeTab={handleChangeTab} />
          )}
          {tab === 'newSession' && (
            <NewSession setTab={setTab} />
          )}
          {tab === 'consultingForms' && (
            <ConsultingForms />
          )}
          {tab === 'videoPlayback' && (
            <VideoPlayback />
          )}
          {tab === 'statistics' && (
            <Statistics
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              setSelectedRoomId={setSelectedRoomId}
            />
          )}
        </main>
      </div>
    </div>
  );
}