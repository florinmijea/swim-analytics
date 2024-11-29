import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Pool,
  Timer,
  StraightenOutlined,
  Notes,
} from '@mui/icons-material';
import { TrainingSession, Exercise } from '../../types';
import { format } from 'date-fns';

interface TrainingSessionCardProps {
  session: TrainingSession;
}

const ExerciseItem: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" gutterBottom>
      {exercise.name}
    </Typography>
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Sets
        </Typography>
        <Typography>{exercise.sets}</Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Reps
        </Typography>
        <Typography>{exercise.reps}</Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Distance
        </Typography>
        <Typography>{exercise.distance}m</Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Rest
        </Typography>
        <Typography>{exercise.restTime}s</Typography>
      </Grid>
    </Grid>
    {exercise.targetTime && (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Target Time: {Math.floor(exercise.targetTime / 60)}:
          {(exercise.targetTime % 60).toString().padStart(2, '0')}
        </Typography>
      </Box>
    )}
    {exercise.description && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {exercise.description}
      </Typography>
    )}
  </Box>
);

const TrainingSessionCard: React.FC<TrainingSessionCardProps> = ({ session }) => {
  const typeColors = {
    technique: 'primary',
    endurance: 'secondary',
    speed: 'error',
    recovery: 'success',
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Pool color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {format(new Date(session.date), 'EEEE, MMMM d')}
          </Typography>
          <Chip
            label={session.type}
            color={typeColors[session.type] as any}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Duration
                </Typography>
                <Typography>{session.duration} min</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StraightenOutlined sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Distance
                </Typography>
                <Typography>{session.distance}m</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Pool sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Style
                </Typography>
                <Typography>{session.style}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Exercises</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {session.exercises.map((exercise) => (
              <ExerciseItem key={exercise.id} exercise={exercise} />
            ))}
          </AccordionDetails>
        </Accordion>

        {session.notes && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
            <Notes sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {session.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingSessionCard;
