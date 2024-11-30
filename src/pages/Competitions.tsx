import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import CompetitionCard from '../components/competitions/CompetitionCard';
import { Competition } from '../types';
import { getSwimmerCompetitions, getSwimmerData } from '../services/mockData';
import { isFuture, isPast, parseISO } from 'date-fns';

const Competitions: React.FC = () => {
  const { swimmerId } = useParams<{ swimmerId: string }>();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);

  // Load competitions data
  useEffect(() => {
    const loadData = async () => {
      if (!swimmerId) {
        setError('No swimmer selected');
        setLoading(false);
        return;
      }

      try {
        const [competitionsData, swimmerData] = await Promise.all([
          getSwimmerCompetitions(swimmerId),
          getSwimmerData(swimmerId)
        ]);

        setCompetitions(competitionsData);
        filterCompetitions(competitionsData, searchQuery, tabValue);
        setError(null);
      } catch (error) {
        console.error('Error loading competitions:', error);
        setError('Failed to load competitions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [swimmerId]); // Reload when swimmer changes

  // Memoized filter function
  const filterCompetitions = useCallback((data: Competition[], query: string, tab: number) => {
    const filtered = data.filter(competition => {
      const matchesSearch = !query || 
        competition.competition_name.toLowerCase().includes(query.toLowerCase()) ||
        (competition.location || '').toLowerCase().includes(query.toLowerCase());
      
      if (!matchesSearch) return false;

      const date = parseISO(competition.start_date);
      return (tab === 0) ||
             (tab === 1 && isPast(date)) ||
             (tab === 2 && isFuture(date));
    });

    setFilteredCompetitions(filtered);
  }, []);

  // Handle search and tab changes
  useEffect(() => {
    filterCompetitions(competitions, searchQuery, tabValue);
  }, [competitions, searchQuery, tabValue, filterCompetitions]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Competitions
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="All" />
          <Tab label="Past" />
          <Tab label="Upcoming" />
        </Tabs>
      </Box>

      {filteredCompetitions.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No competitions found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCompetitions.map((competition, index) => (
            <Grid item xs={12} sm={12} md={6} key={index}>
              <CompetitionCard competition={competition} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Competitions;
