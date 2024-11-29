import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  Person,
  Groups,
} from '@mui/icons-material';
import { Club } from '../../types';

interface ClubCardProps {
  club: Club;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {club.name}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {club.location}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                Coach: {club.coach}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Groups sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {club.members} Members
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClubCard;
