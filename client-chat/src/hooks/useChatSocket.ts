// hooks/useChatSocket.ts
import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import type{ User, Message, MessageResponse } from '../types/chat';

interface UseChatSocketProps {
  socket: React.MutableRefObject<Socket | null>;
  userName: string | null;
}

interface UseChatSocketResult {
  users: User[];
  messages: Record<string, Message[]>;
  isConnected: boolean;
  error: string | null;
  sendMessage: (recipientId: string, text: string) => void;
}

export const useChatSocket = ({ socket, userName }: UseChatSocketProps): UseChatSocketResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle connection status and user list updates
  useEffect(() => {
    const socketInstance = socket.current;
    if (!socketInstance || !userName) return;

    // Handle connection events
    const handleConnect = () => {
      console.log('Socket connected in useChatSocket');
      setIsConnected(true);
      setError(null); // Clear any previous disconnect error

      // Request current user list
      socketInstance.emit('get-users');

      // Set username on connection
      socketInstance.emit('set-username', userName);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected in useChatSocket');

      // Check if the socket is actually disconnected
      if (socketInstance && !socketInstance.connected) {
        setIsConnected(false);
        setError('Disconnected from server. Please refresh the page.');
      } else {
        console.log('Disconnect event received but socket appears to be connected');
        // Socket is still connected, so request the user list again
        socketInstance.emit('get-users');
      }
    };

    const handleConnectError = (err: Error) => {
      console.error('Socket connection error in useChatSocket:', err);
      setIsConnected(false);
      setError('Connection error: ' + err.message);
    };

    // Listen for user list updates
    const handleUserList = (userList: User[]) => {
      // If we're receiving a user list, we must be connected
      setIsConnected(true);
      // Clear any disconnect error if present
      if (error && error.includes('Disconnected from server')) {
        setError(null);
      }

      const currentUser = userList.find(u => u.name === userName);
      if (currentUser) {
        // Filter out the current user from the list
        const otherUsers = userList.filter(u => u.name !== userName);

        // Check for disconnected users by comparing with previous user list
        setUsers(prevUsers => {
          // Find users that were in the previous list but not in the new list (disconnected users)
          const disconnectedUsers = prevUsers.filter(
            prevUser => !otherUsers.some(newUser => newUser.id === prevUser.id)
          );

          // Clear messages for disconnected users
          if (disconnectedUsers.length > 0) {
            setMessages(prevMessages => {
              const newMessages = { ...prevMessages };

              // Remove messages for each disconnected user
              disconnectedUsers.forEach(user => {
                delete newMessages[user.id];
              });

              return newMessages;
            });
          }

          return otherUsers;
        });
      }
    };

    // Set up event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('user-list', handleUserList);

    // If already connected, request users and set username
    if (socketInstance.connected) {
      handleConnect();
    }

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.off('user-list', handleUserList);
    };
  }, [socket, userName, error]);

  // Handle incoming messages
  useEffect(() => {
    const socketInstance = socket.current;
    if (!socketInstance) return;

    const handleMessage = (data: MessageResponse) => {
      // If we're receiving a message, we must be connected
      setIsConnected(true);

      // Clear any disconnect error if present
      if (error && error.includes('Disconnected from server')) {
        setError(null);
      }

      if (data.author === 'me') {
        // This is a confirmation of our own message, already handled in sendMessage
        return;
      } else {
        // Find the user ID by name
        const sender = users.find(u => u.name === data.author);
        if (sender) {
          // Update messages for this conversation
          setMessages((prev) => {
            // Make sure we don't add duplicate messages
            const existingMessages = prev[sender.id] || [];
            const newMessage: Message = {
              author: data.author,
              text: data.text,
              isOwnMessage: false,
              timestamp: Date.now()
            };

            // Check if this message is already in the conversation
            const isDuplicate = existingMessages.some(
              m => m.author === newMessage.author && m.text === newMessage.text
            );

            if (isDuplicate) return prev;

            return {
              ...prev,
              [sender.id]: [...existingMessages, newMessage],
            };
          });
        } else {
          // If sender is not in the users list, request an updated user list
          // This can happen if the user list is not up-to-date
          console.log(`Received message from unknown user: ${data.author}. Requesting updated user list.`);
          socketInstance.emit('get-users');

          // Store the message temporarily with a placeholder ID
          // We'll use the author name as a temporary ID
          const tempId = `temp_${data.author}`;
          setMessages((prev) => {
            const existingMessages = prev[tempId] || [];
            const newMessage: Message = {
              author: data.author,
              text: data.text,
              isOwnMessage: false,
              timestamp: Date.now()
            };

            // Check if this message is already in the conversation
            const isDuplicate = existingMessages.some(
              m => m.author === newMessage.author && m.text === newMessage.text
            );

            if (isDuplicate) return prev;

            return {
              ...prev,
              [tempId]: [...existingMessages, newMessage],
            };
          });
        }
      }
    };

    // Handle error events from the server
    const handleError = (error: { message: string }) => {
      console.error('Message error:', error.message);
      setError(error.message);

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    };

    socketInstance.on('message', handleMessage);
    socketInstance.on('error', handleError);

    return () => {
      socketInstance.off('message', handleMessage);
      socketInstance.off('error', handleError);
    };
  }, [socket, users, error]);

  // Send message function
  const sendMessage = useCallback((recipientId: string, text: string) => {
    const socketInstance = socket.current;
    if (!socketInstance || !userName) {
      setError('No connection available. Please try again.');
      return;
    }

    // Find recipient name by ID
    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) {
      setError('Recipient not found');
      return;
    }

    // Emit the message to the server
    socketInstance.emit('message', {
      sender: userName,
      recipient: recipientId,
      message: text,
    });

    // Update local messages state immediately for better UX
    setMessages((prev) => {
      const existingMessages = prev[recipientId] || [];
      const newMessage: Message = {
        author: userName,
        text,
        isOwnMessage: true,
        timestamp: Date.now()
      };

      return {
        ...prev,
        [recipientId]: [...existingMessages, newMessage],
      };
    });
  }, [socket, userName, users]);

  return {
    users,
    messages,
    isConnected,
    error,
    sendMessage
  };
};
