import { SESSION_STATUS } from "./constants";

export function parseRoomsData(data) {
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

  return parsedRooms;
}