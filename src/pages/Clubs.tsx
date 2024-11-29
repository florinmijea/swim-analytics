import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ClubCard from '../components/clubs/ClubCard';
import { Club } from '../types';
import { getClubs } from '../services/mockData';

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.coach.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Swimming Clubs
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search clubs by name, location, or coach..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {filteredClubs.map((club) => (
          <Grid item xs={12} md={6} key={club.id}>
            <ClubCard club={club} />
          </Grid>
        ))}
        {filteredClubs.length === 0 && (
          <Grid item xs={12}>
            <Typography textAlign="center" color="text.secondary">
              No clubs found
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Clubs;
