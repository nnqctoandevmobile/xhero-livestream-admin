'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useAntMedia({
  serverUrl,
  port,
  appName = 'LiveApp',
  streamId,
  token = '',
  mode
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false);
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const adaptorRef = useRef(null);

  useEffect(() => {
    if (!streamId) {
      setLoading(false);
      return;
    }
    let active = true;

    // Dynamically load the WebRTC Adaptor script from CDN or the server itself
    // Loading from the server itself ensures 100% version compatibility!
    const activeServer = serverUrl || import.meta.env.NEXT_PUBLIC_ANT_MEDIA_SERVER;
    const resolvedPort = port || import.meta.env.NEXT_PUBLIC_ANT_MEDIA_PORT;

    const isLocal = activeServer.includes('localhost') || activeServer.includes('127.0.0.1');
    const protocol = isLocal ? (window.location.protocol === 'https:' ? 'https:' : 'http:') : 'https:';

    const scriptUrl = (resolvedPort === '443' || resolvedPort === '80' || !resolvedPort)
      ? `${protocol}//${activeServer}/${appName}/js/webrtc_adaptor.js`
      : `${protocol}//${activeServer}:${resolvedPort}/${appName}/js/webrtc_adaptor.js`;

    const initAdaptor = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import WebRTCAdaptor to prevent Next.js SSR crashes
        const antMedia = await import('@antmedia/webrtc_adaptor');
        const WebRTCAdaptorClass = antMedia.WebRTCAdaptor;

        if (!active) return;

        const wsProtocol = isLocal ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:') : 'wss:';
        const activePort = resolvedPort || '5443';
        const websocketUrl = (activePort === '443' || activePort === '80')
          ? `${wsProtocol}//${activeServer}/${appName}/websocket`
          : `${wsProtocol}//${activeServer}:${activePort}/${appName}/websocket`;

        adaptorRef.current = new WebRTCAdaptorClass({
          websocket_url: websocketUrl,
          mediaConstraints: (mode === 'publish' || mode === 'admin') ? { video: true, audio: true } : { video: false, audio: false },
          peerconnection_config: {
            iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
          },
          sdp_constraints: {
            OfferToReceiveAudio: mode === 'play' || mode === 'admin',
            OfferToReceiveVideo: mode === 'play' || mode === 'admin'
          },
          localVideoElement: mode === 'publish' ? localVideoRef.current : null,
          remoteVideoElement: (mode === 'play' || mode === 'admin') ? remoteVideoRef.current : null,
          callback: (info, obj) => {
            // console.log('Ant Media WebRTC Callback:', info, obj);
            
            if (info === 'initialized') {
              setLoading(false);
              if (mode === 'play' || mode === 'admin') {
                // Auto-play the stream once initialized, wrapped in timeout to prevent race condition before ref assignment
                setTimeout(() => {
                  if (adaptorRef.current) {
                    adaptorRef.current.play(streamId, token);
                  }
                }, 100);
              }
            } else if (info === 'publish_started') {
              setIsPublishing(true);
              setError(null);
            } else if (info === 'publish_finished') {
              setIsPublishing(false);
            } else if (info === 'play_started') {
              setIsPlaying(true);
              setError(null);
            } else if (info === 'play_finished') {
              setIsPlaying(false);
            } else if (info === 'closed') {
              setIsPlaying(false);
              setIsPublishing(false);
            } else if (info === 'videoTrackMuted') {
              setIsRemoteVideoMuted(true);
            } else if (info === 'videoTrackUnmuted') {
              setIsRemoteVideoMuted(false);
            } else if (info === 'audioTrackMuted') {
              setIsRemoteAudioMuted(true);
            } else if (info === 'audioTrackUnmuted') {
              setIsRemoteAudioMuted(false);
            }
          },
          callbackError: (err, message) => {
            const errStr = typeof err === 'string' ? err : (err?.definition || err?.message || (err instanceof Event ? 'WebSocket connection failed' : JSON.stringify(err)) || 'Unknown WebRTC Error');
            const isNoStream = errStr.includes('no_stream_exist');
            const isAlreadyPlaying = errStr.includes('already_playing');

            if (isNoStream) {
              console.warn('Ant Media: Stream not ready (no_stream_exist), retrying...');
            } else if (isAlreadyPlaying) {
              console.info('Ant Media: Stream is already playing (already_playing).');
              setIsPlaying(true);
              setError(null);
              setLoading(false);
              return;
            } else {
              console.error('Ant Media WebRTC Error:', err, message);
            }

            const msgStr = typeof message === 'string' ? message : '';
            setError(msgStr || errStr);
            setLoading(false);
          }
        });

      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize WebRTC Adaptor');
        setLoading(false);
      }
    };

    initAdaptor();

    return () => {
      active = false;
      if (adaptorRef.current) {
        try {
          // Unconditionally stop the stream and close the WebSocket to prevent streamIdInUse errors
          try {
            adaptorRef.current.stop(streamId);
          } catch (stopError) {
            // Silence stop errors if the stream wasn't actively publishing/playing
          }
          
          if (adaptorRef.current.webSocket || adaptorRef.current.websocket) {
            adaptorRef.current.closeWebSocket();
          }
        } catch (cleanupError) {
          console.warn('Ant Media cleanup error:', cleanupError);
        }
        adaptorRef.current = null;
      }
    };
  }, [serverUrl, port, appName, streamId, token, mode]);

  const startPublishing = useCallback(() => {
    if (adaptorRef.current && (mode === 'publish' || mode === 'admin') && !isPublishing) {
      const ws = adaptorRef.current.webSocket || adaptorRef.current.websocket;
      if (!ws || ws.readyState === 1) { // 1 is WebSocket.OPEN (or proceed as fallback if ws reference is undefined)
        try {
          adaptorRef.current.publish(streamId, token);
        } catch (e) {
          console.warn('Ant Media publish error:', e);
        }
      } else {
        console.warn('Cannot publish: WebSocket is not open yet.');
      }
    }
  }, [mode, isPublishing, streamId, token]);

  const stopPublishing = useCallback(() => {
    if (adaptorRef.current && (mode === 'publish' || mode === 'admin') && isPublishing) {
      adaptorRef.current.stop(streamId);
      setIsPublishing(false);
    }
  }, [mode, isPublishing, streamId]);

  const startPlaying = useCallback(() => {
    if (adaptorRef.current && (mode === 'play' || mode === 'admin') && !isPlaying) {
      const ws = adaptorRef.current.webSocket || adaptorRef.current.websocket;
      if (!ws || ws.readyState === 1) { // 1 is WebSocket.OPEN (or proceed as fallback if ws reference is undefined)
        try {
          adaptorRef.current.play(streamId, token);
        } catch (e) {
          console.warn('Ant Media play error:', e);
        }
      } else {
        console.warn('Cannot play: WebSocket is not open yet.');
      }
    }
  }, [mode, isPlaying, streamId, token]);

  const stopPlaying = useCallback(() => {
    if (adaptorRef.current && (mode === 'play' || mode === 'admin') && isPlaying) {
      adaptorRef.current.stop(streamId);
      setIsPlaying(false);
    }
  }, [mode, isPlaying, streamId]);

  return {
    localVideoRef,
    remoteVideoRef,
    isPlaying,
    isPublishing,
    loading,
    error,
    startPublishing,
    stopPublishing,
    startPlaying,
    stopPlaying,
    isRemoteVideoMuted,
    isRemoteAudioMuted,
    adaptor: adaptorRef.current
  };
}
