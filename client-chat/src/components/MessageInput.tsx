
import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe un mensaje...",
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        display: 'flex',
        gap: 1,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <TextField
        fullWidth
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        size="medium"
        InputProps={{
          sx: { borderRadius: 2 }
        }}
      />
      <IconButton 
        type="submit" 
        size="large" 
        disabled={disabled || !input.trim()}
        color="primary"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
