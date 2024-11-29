import React, { useState } from 'react';
import {
  Container,
  Grid,
  TextField,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ClubCard from '../components/clubs/ClubCard';
import { mockClubs } from '../services/mockData';

const SwimmingClubs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = mockClubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.coachName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
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
      </Box>

      <Grid container spacing={3}>
        {filteredClubs.map((club) => (
          <Grid item key={club.id} xs={12} sm={6} md={4}>
            <ClubCard club={club} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SwimmingClubs;
