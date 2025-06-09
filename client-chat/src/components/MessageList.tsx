// components/MessageList.tsx
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  emptyMessage?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  emptyMessage = "No hay mensajes aún" 
}) => {
  // Create a ref for the messages container to auto-scroll to bottom
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box sx={{ 
      flex: 1, 
      p: 2, 
      overflowY: 'auto',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {messages.length === 0 ? (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      ) : (
        <>
          {messages.map((message, index) => (
            <Box
              key={message.id || index}
              sx={{
                display: 'flex',
                justifyContent: message.isOwnMessage ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper 
                sx={{ 
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: message.isOwnMessage ? 'primary.light' : 'background.paper',
                  color: message.isOwnMessage ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {message.isOwnMessage ? 'Tú' : message.author}
                </Typography>
                <Typography variant="body1">{message.text}</Typography>
                {message.timestamp && (
                  <Typography variant="caption" display="block" textAlign="right" sx={{ mt: 0.5 }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
};

export default MessageList;
