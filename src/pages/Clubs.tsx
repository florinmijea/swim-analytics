import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ClubCard from '../components/clubs/ClubCard';
import { Club } from '../types';
import { getClubs } from '../services/mockData';

type SortOption = 'ranking' | 'totalSwimmers' | 'medals' | 'name';

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('ranking');

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

  const sortedAndFilteredClubs = React.useMemo(() => {
    return clubs
      .filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.coachName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'ranking':
            return a.ranking - b.ranking;
          case 'totalSwimmers':
            return b.totalSwimmers - a.totalSwimmers;
          case 'medals':
            const aTotalMedals = a.achievements.goldMedals + a.achievements.silverMedals + a.achievements.bronzeMedals;
            const bTotalMedals = b.achievements.goldMedals + b.achievements.silverMedals + b.achievements.bronzeMedals;
            return bTotalMedals - aTotalMedals;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [clubs, searchQuery, sortBy]);

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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search clubs, locations, or coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  label="Sort By"
                >
                  <MenuItem value="ranking">Ranking</MenuItem>
                  <MenuItem value="totalSwimmers">Total Swimmers</MenuItem>
                  <MenuItem value="medals">Total Medals</MenuItem>
                  <MenuItem value="name">Club Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {sortedAndFilteredClubs.map((club) => (
          <Grid item xs={12} md={6} key={club.id}>
            <ClubCard club={club} />
          </Grid>
        ))}
        {sortedAndFilteredClubs.length === 0 && (
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
