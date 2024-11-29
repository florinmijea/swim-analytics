import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, LocationOn, Person } from '@mui/icons-material';
import { Club } from '../types';
import { getClubs } from '../services/mockData';

const SwimmingClubs: React.FC = () => {
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
        placeholder="Search clubs..."
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {club.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    {club.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    Coach: {club.coach}
                  </Typography>
                </Box>

                <Typography color="text.secondary">
                  {club.members} Members
                </Typography>
              </CardContent>
            </Card>
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

export default SwimmingClubs;
