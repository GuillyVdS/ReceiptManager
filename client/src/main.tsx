import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

import './index.css'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme'; // Import the theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Ensures consistent styling */}
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
