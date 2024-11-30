import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Paper,
  styled,
} from '@mui/material';
import { Competition } from '../../types';
import { format } from 'date-fns';
import { 
  EmojiEvents, 
  LocationOn, 
  CalendarToday, 
  Timer,
  Pool
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const EventChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  fontWeight: 'bold',
  '&.gold': {
    backgroundColor: '#FFD700',
    color: theme.palette.getContrastText('#FFD700'),
  },
  '&.silver': {
    backgroundColor: '#C0C0C0',
    color: theme.palette.getContrastText('#C0C0C0'),
  },
  '&.bronze': {
    backgroundColor: '#CD7F32',
    color: theme.palette.getContrastText('#CD7F32'),
  },
}));

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  const getMedalClass = (place: string) => {
    switch (place) {
      case '1': return 'gold';
      case '2': return 'silver';
      case '3': return 'bronze';
      default: return '';
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEvents 
            color="primary" 
            sx={{ 
              mr: 1,
              fontSize: '2rem',
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {competition.name}
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  {format(new Date(competition.date), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  {competition.location}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Pool sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  {competition.type}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Events
        </Typography>
        
        <Box sx={{ flexGrow: 1 }}>
          {competition.events.map((event, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  {event.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.time}
                    </Typography>
                  </Box>
                  <EventChip
                    label={event.place}
                    size="small"
                    className={getMedalClass(event.place)}
                  />
                </Box>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default CompetitionCard;
