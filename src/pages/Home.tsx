import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Swimmer } from '../types/swimmers';
import { getAllSwimmers } from '../services/mockData';

const Home: React.FC = () => {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSwimmers = async () => {
      try {
        const data = await getAllSwimmers();
        setSwimmers(data);
      } catch (error) {
        console.error('Error loading swimmers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSwimmers();
  }, []);

  const handleSwimmerSelect = (swimmer: Swimmer) => {
    navigate(`/profile/${swimmer.swimmer_id}`);
  };

  const filteredSwimmers = swimmers.filter(swimmer =>
    swimmer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              color: 'primary.main'
            }}
          >
            Swim Analytics
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              p: 3,
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              label="Search swimmers"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a swimmer's name..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            {searchQuery && (
              <List sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {filteredSwimmers.map((swimmer) => (
                  <ListItem
                    key={swimmer.swimmer_id}
                    button
                    onClick={() => handleSwimmerSelect(swimmer)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText 
                      primary={swimmer.name}
                      secondary={swimmer.club}
                    />
                  </ListItem>
                ))}
                {filteredSwimmers.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No swimmers found"
                      sx={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
