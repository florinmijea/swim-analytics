import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../../theme';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;
