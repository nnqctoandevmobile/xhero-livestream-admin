import Header from '../Header';
import SideBar from '../SideBar';
import { useEffect, useState } from 'react';

import SessionList from './components/SessionList';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../core/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';

export default function Home() {
  const [tab, setTab] = useState('sessionList');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLogged } = useAuth();
  const navigate = useNavigate();

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

      if (data) {
        console.log(data);
        Object.entries(data).forEach(([roomId, roomNode]) => {
          const state = roomNode.state || {};
          const isLive = state.isLive === true;
          const viewers = typeof state.viewers === 'number' ? state.viewers : parseInt(state.viewers, 10) || 0;

          if (state.hostName) {
            hosts.add(state.hostName);
          }

          if (isLive) {
            liveCount += 1;
          } else {
            offlineCount += 1;
          }

          viewerTotal += viewers;

          let calculatedStatus = '';
          if (isLive) {
            calculatedStatus = 'LIVE';
          } else {
            calculatedStatus = 'ENDED'; // default if no valid time
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
                    calculatedStatus = 'SCHEDULED';
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

      setRooms(parsedRooms.sort((a, b) => (a.status === 'LIVE' ? -1 : 1)));
      setTotalViewers(viewerTotal);
      setActiveRooms(liveCount);
      setOfflineRooms(offlineCount);
      setHostsOnline(hosts.size);
      setIsLoading(false);
    }, (error) => {
      console.error('Failed to load admin rooms:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLogged]);

  return (
    <div className="min-h-screen bg-[var(--bg-main, #09101a)] flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideBar tab={tab} setTab={setTab} />
        <main className="flex-1 p-6 overflow-y-auto">
          {tab === 'sessionList' && (
            <SessionList rooms={rooms} isLoading={false} />
          )}
        </main>
      </div>
    </div>
  );
}