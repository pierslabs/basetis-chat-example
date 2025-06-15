// Chat.tsx
import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import UserList from '../components/UserList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

import cookie from 'cookiejs';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.ts';
import { useChatSocket } from '../hooks/useChatSocket.ts';

export default function Chat() {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const socketRef = useSocket();
  const { users, messages, sendMessage } = useChatSocket({
    socket: socketRef,
    userName: cookie.get('chat-user-example').toString() || null,
  });

  const cookieValue = cookie.get('chat-user-example');
  const userName = cookieValue
    ? typeof cookieValue === 'string'
      ? cookieValue.replace(/"/g, '')
      : String(cookieValue)
    : null;

  // Redirect to login if no username
  useEffect(() => {
    if (!userName) {
      navigate('/login');
    } else {
      // Set loading to false after a short delay to ensure socket connection
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [userName, navigate]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit('get-users');
    }
  }, []);

  // Reset selectedUserId if the selected user is no longer in the users list (disconnected)
  useEffect(() => {
    if (selectedUserId && !users.some(user => user.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [users, selectedUserId]);
  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  //user disconnect clear his mes

  return (
    <>
      {/*<ErrorAlert message={error} onClose={handleClearError} />*/}

      <Grid container sx={{ height: '100vh' }}>
        {/* User list sidebar */}
        <Grid item xs={2}>
          <UserList
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
        </Grid>

        {/* Chat area */}
        <Grid xs={10}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            {selectedUserId === null ? (
              <Box m='auto'>
                <Typography variant='h6' color='text.secondary'>
                  Selecciona un usuario para chatear
                </Typography>
              </Box>
            ) : (
              <>
                {/* Message history */}
                <MessageList messages={messages[selectedUserId] || []} />

                {/* Message input */}
                <MessageInput
                  onSendMessage={(text) => sendMessage(selectedUserId, text)}
                  disabled={false}
                />
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
