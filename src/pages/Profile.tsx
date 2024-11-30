import React, { useEffect, useState, createContext, useContext } from 'react';
import { useParams, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  IconButton,
} from '@mui/material';
import { Pool, ArrowBack } from '@mui/icons-material';
import { Swimmer, calculateAge, getBestTimes } from '../types/swimmers';
import { getSwimmerData } from '../services/mockData';

// Create context for swimmer data
export const SwimmerContext = createContext<{
  swimmer: Swimmer | null;
  loading: boolean;
  error: string | null;
}>({
  swimmer: null,
  loading: false,
  error: null,
});

export const useSwimmer = () => useContext(SwimmerContext);

const Profile: React.FC = () => {
  const { swimmerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [swimmer, setSwimmer] = useState<Swimmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentTab = location.pathname.split('/').pop() || 'performance';

  useEffect(() => {
    const loadData = async () => {
      if (!swimmerId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getSwimmerData(swimmerId);
        if (!data) {
          setError('Swimmer not found');
          return;
        }
        setSwimmer(data);
      } catch (error) {
        console.error('Error loading swimmer data:', error);
        setError('Error loading swimmer data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [swimmerId]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <LinearProgress sx={{ width: '80%' }} />
      </Box>
    );
  }

  if (error || !swimmer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error" sx={{ width: '80%' }}>
          {error || 'Swimmer not found'}
        </Alert>
      </Box>
    );
  }

  const bestTimes = getBestTimes(swimmer.competitions || []);
  const styles = Object.entries(bestTimes).map(([style, time]) => ({
    name: style,
    bestTime: time
  }));

  return (
    <SwimmerContext.Provider value={{ swimmer, loading, error }}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="span">
            Swimmer Profile
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      bgcolor: 'primary.main',
                    }}
                  >
                    <Pool sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h4">
                      {swimmer ? 
                        (swimmer.first_name || swimmer.last_name 
                          ? `${swimmer.first_name || ''} ${swimmer.last_name || ''}`.trim()
                          : 'Unnamed Swimmer'
                        ) 
                        : 'Loading...'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Age: {swimmer ? calculateAge(swimmer.birth_year) : '-'} years
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Club: {swimmer?.club || '-'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Gender: {swimmer?.gender || '-'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      License: {swimmer?.federation_license || '-'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Competitions: {swimmer?.competitions?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Best Times
                  </Typography>
                  {styles.map((style) => (
                    <Box key={style.name} sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>{style.name}</Typography>
                        <Typography>{style.bestTime}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={100}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 2 }}>
                <Tabs
                  value={currentTab}
                  textColor="primary"
                  indicatorColor="primary"
                  variant="fullWidth"
                >
                  <Tab
                    label="Performance"
                    value="performance"
                    component={Link}
                    to="performance"
                  />
                  <Tab
                    label="Competitions"
                    value="competitions"
                    component={Link}
                    to="competitions"
                  />
                  <Tab
                    label="Training"
                    value="training"
                    component={Link}
                    to="training"
                  />
                </Tabs>
              </Card>
              <Box sx={{ mt: 2 }}>
                <Outlet />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </SwimmerContext.Provider>
  );
};

export default Profile;
