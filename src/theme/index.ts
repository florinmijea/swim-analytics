import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6C5DD3', // The purple color from the image
      light: '#8677DD',
      dark: '#4B3DB9',
    },
    secondary: {
      main: '#FF754C', // The coral/orange color from the image
      light: '#FF8D6A',
      dark: '#E65B35',
    },
    background: {
      default: '#F7F7F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#11142D',
      secondary: '#808191',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '24px',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: 1.2,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '14px',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
  },
});
