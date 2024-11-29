import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  Person,
  Pool,
  EmojiEvents,
  Timeline,
  Groups,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const drawerWidth = 240;

  const menuItems = [
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Performance', icon: <Timeline />, path: '/performance' },
    { text: 'Competitions', icon: <EmojiEvents />, path: '/competitions' },
    { text: 'Swimming Clubs', icon: <Groups />, path: '/clubs' },
    { text: 'Training', icon: <Pool />, path: '/training' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
          Swim Analytics
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '30',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path
                  ? theme.palette.primary.main
                  : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                color: location.pathname === item.path
                  ? theme.palette.primary.main
                  : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigation;
