import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import { Competition } from '../../types';
import { format } from 'date-fns';
import { EmojiEvents, LocationOn, CalendarToday } from '@mui/icons-material';

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEvents color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{competition.name}</Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {format(new Date(competition.date), 'MMMM d, yyyy')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography color="text.secondary">
                {competition.location}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Results:
          </Typography>
          {competition.results.map((result, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="body2">
                {result.style}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {Math.floor(result.time / 60)}:
                  {(result.time % 60).toFixed(2).padStart(5, '0')}
                </Typography>
                <Chip
                  label={`#${result.rank}`}
                  size="small"
                  color={result.rank === 1 ? 'primary' : 'default'}
                  sx={{ minWidth: 60 }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {competition.participants.length} Participants
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
