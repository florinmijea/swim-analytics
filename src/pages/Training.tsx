import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import {
  CalendarToday,
  Pool,
  Timer,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import TrainingSessionCard from '../components/training/TrainingSessionCard';
import { TrainingSession } from '../types';
import { getTrainingSessions } from '../services/mockData';

type TrainingType = 'all' | 'technique' | 'endurance' | 'speed' | 'recovery';

const Training: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<TrainingType>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTrainingSessions();
        setSessions(data);
      } catch (error) {
        console.error('Error loading training sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: TrainingType,
  ) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  };

  const filteredSessions = sessions.filter(
    session => selectedType === 'all' || session.type === selectedType
  );

  // Calculate training stats
  const totalDistance = filteredSessions.reduce((sum, session) => sum + session.distance, 0);
  const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
  const averageDistance = Math.round(totalDistance / filteredSessions.length) || 0;

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
        Training Schedule
      </Typography>

      {/* Training Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Pool sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Distance
                  </Typography>
                  <Typography variant="h6">
                    {totalDistance.toLocaleString()}m
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timer sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Duration
                  </Typography>
                  <Typography variant="h6">
                    {totalDuration} min
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Average Distance
                  </Typography>
                  <Typography variant="h6">
                    {averageDistance}m
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="h6">
                    {filteredSessions.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Training Type Filter */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          aria-label="training type"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="all">
            All
          </ToggleButton>
          <ToggleButton value="technique">
            Technique
          </ToggleButton>
          <ToggleButton value="endurance">
            Endurance
          </ToggleButton>
          <ToggleButton value="speed">
            Speed
          </ToggleButton>
          <ToggleButton value="recovery">
            Recovery
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Training Sessions */}
      <Grid container spacing={3}>
        {filteredSessions.map((session) => (
          <Grid item xs={12} md={6} key={session.id}>
            <TrainingSessionCard session={session} />
          </Grid>
        ))}
        {filteredSessions.length === 0 && (
          <Grid item xs={12}>
            <Typography textAlign="center" color="text.secondary">
              No training sessions found
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Training;
