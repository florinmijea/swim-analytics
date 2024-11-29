import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  EmojiEvents,
  Pool,
  LocationOn,
  Person,
  Event,
} from '@mui/icons-material';
import { Club } from '../../types';

interface ClubCardProps {
  club: Club;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const totalMedals = 
    club.achievements.goldMedals +
    club.achievements.silverMedals +
    club.achievements.bronzeMedals;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Pool color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{club.name}</Typography>
          <Chip
            label={`#${club.ranking}`}
            color="primary"
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {club.location}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {club.coachName}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Achievements
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', color: '#FFD700' }}>
                <EmojiEvents />
                <Typography variant="h6">{club.achievements.goldMedals}</Typography>
                <Typography variant="caption">Gold</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', color: '#C0C0C0' }}>
                <EmojiEvents />
                <Typography variant="h6">{club.achievements.silverMedals}</Typography>
                <Typography variant="caption">Silver</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', color: '#CD7F32' }}>
                <EmojiEvents />
                <Typography variant="h6">{club.achievements.bronzeMedals}</Typography>
                <Typography variant="caption">Bronze</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Total Swimmers
            </Typography>
            <Typography variant="h6">
              {club.totalSwimmers}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Competitions
            </Typography>
            <Typography variant="h6">
              {club.competitionsParticipated}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Top Styles
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {club.topStyles.map((style) => (
              <Chip
                key={style}
                label={style}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Event sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Founded in {club.foundedYear}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClubCard;
