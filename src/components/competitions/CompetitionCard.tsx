import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { LocationOn, EmojiEvents, Timer } from '@mui/icons-material';
import { Competition } from '../../types';

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  const theme = useTheme();

  const getPlaceColor = (place: string) => {
    switch (place) {
      case '1': return theme.palette.warning.light;  // Gold
      case '2': return theme.palette.grey[400];  // Silver
      case '3': return theme.palette.warning.dark;  // Bronze
      default: return theme.palette.grey[500];
    }
  };

  const getPlaceLabel = (place: string) => {
    if (place === '1') return '1st';
    if (place === '2') return '2nd';
    if (place === '3') return '3rd';
    return `${place}th`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...(competition.isFuture && {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
          borderStyle: 'solid'
        })
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              {competition.competition_name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center">
                <EmojiEvents sx={{ fontSize: '1rem', mr: 0.5, color: theme.palette.primary.main }} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(competition.start_date), 'MMM d, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ fontSize: '1rem', mr: 0.5, color: theme.palette.primary.main }} />
                <Typography variant="body2" color="text.secondary">
                  {competition.location || 'TBD'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Chip
              label={competition.isFuture ? 'Upcoming' : 'Past'}
              color={competition.isFuture ? 'primary' : 'default'}
              size="small"
              sx={{
                borderRadius: '4px',
                fontWeight: 500,
                ...(competition.isFuture && {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                })
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Events Grid */}
        <Grid container spacing={2}>
          {competition.events.map((event, index) => (
            <Grid item xs={12} key={index}>
              <Box 
                sx={{ 
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        mb: 0.5
                      }}
                    >
                      {event.event_name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center">
                        <Timer sx={{ fontSize: '0.9rem', mr: 0.5, color: theme.palette.grey[500] }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.time === '99:99:99' ? 'Upcoming' : event.time}
                        </Typography>
                      </Box>
                      {!competition.isFuture && event.place !== '99' && (
                        <Box display="flex" alignItems="center">
                          <EmojiEvents sx={{ 
                            fontSize: '0.9rem', 
                            mr: 0.5, 
                            color: getPlaceColor(event.place)
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: getPlaceColor(event.place),
                              fontWeight: 500
                            }}
                          >
                            {getPlaceLabel(event.place)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
