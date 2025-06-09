// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type UseSocketOptions = {
  url?: string;
  onConnect?: (socket: Socket) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
};

export const useSocket = (
  options: UseSocketOptions = {},
): React.MutableRefObject<Socket | null> => {
  const socketRef = useRef<Socket | null>(null);
  const {
    url = import.meta.env.VITE_SOCKETS_URL || 'http://localhost:3000',
    onConnect,
    onDisconnect,
    onError
  } = options;

  useEffect(() => {
    try {
      const socket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        if (onConnect) onConnect(socket);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        if (onDisconnect) onDisconnect();
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (onError) onError(error);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      if (onError && error instanceof Error) onError(error);
      return () => {};
    }
  }, [url, onConnect, onDisconnect, onError]);

  return socketRef;
};
