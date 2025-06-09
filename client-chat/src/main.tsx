import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './normalice.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider theme={darkTheme}>
    <CssBaseline  />
    <App />
  </ThemeProvider>
  </StrictMode>
);
