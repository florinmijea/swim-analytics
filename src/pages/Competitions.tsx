import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import CompetitionCard from '../components/competitions/CompetitionCard';
import { Competition } from '../types';
import { getCompetitions } from '../services/mockData';
import { isFuture, isPast, parseISO } from 'date-fns';

const Competitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCompetitions();
        setCompetitions(data);
      } catch (error) {
        console.error('Error loading competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const date = parseISO(competition.date);
    const matchesTab = (tabValue === 0) ||
                      (tabValue === 1 && isPast(date)) ||
                      (tabValue === 2 && isFuture(date));
    
    return matchesSearch && matchesTab;
  });

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
        Competitions
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" />
          <Tab label="Past" />
          <Tab label="Upcoming" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredCompetitions.map((competition) => (
          <Grid item xs={12} md={6} key={competition.id}>
            <CompetitionCard competition={competition} />
          </Grid>
        ))}
        {filteredCompetitions.length === 0 && (
          <Grid item xs={12}>
            <Typography textAlign="center" color="text.secondary">
              No competitions found
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Competitions;
