// Login.tsx
import {type FormEvent, useState} from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import cookie from 'cookiejs';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleLogin = (e: FormEvent) => {

    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setError(null);
    cookie.set('chat-user-example', name, {expires: 7});
    navigate('/chat');
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error && !name.trim()}
            helperText={!name.trim() && error ? "Name is required" : ""}
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
