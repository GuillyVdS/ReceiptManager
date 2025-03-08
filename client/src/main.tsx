import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import './index.css'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme'; // Import the theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures consistent styling */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)



// import ReactDOM from 'react-dom/client';
// import { ThemeProvider } from '@mui/material/styles';




// const root = ReactDOM.createRoot(document.getElementById('root')!);
