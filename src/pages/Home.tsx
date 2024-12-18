import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { Search, Pool, EmojiEvents, Group, Timeline } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getAllSwimmers } from '../services/mockData';
import { Swimmer } from '../types/swimmers';

const MEDAL_COLORS = {
  gold: '#FFD700',   // Gold color
  silver: '#C0C0C0', // Silver color
  bronze: '#CD7F32'  // Bronze color
};

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [allSwimmers, setAllSwimmers] = useState<Swimmer[]>([]);
  const [filteredSwimmers, setFilteredSwimmers] = useState<Swimmer[]>([]);
  const [clubStats, setClubStats] = useState({
    totalSwimmers: 0,
    averageAge: 0,
    totalMedals: 0,
    swimStyles: [] as { name: string; value: number }[],
    ageGroups: [] as { name: string; value: number }[],
    medalDistribution: [] as { name: string; value: number; color: string }[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const swimmers = await getAllSwimmers();
        const clubSwimmers = swimmers.filter(
          swimmer => swimmer.club === 'Bluemarin Sport Club'
        );
        setAllSwimmers(clubSwimmers);
        setFilteredSwimmers(clubSwimmers);

        // Calculate statistics
        const totalSwimmers = clubSwimmers.length;
        const currentYear = new Date().getFullYear();
        const ages = clubSwimmers.map(s => currentYear - (s.birth_year || currentYear - 20));
        const averageAge = Math.round(ages.reduce((a, b) => a + b, 0) / totalSwimmers);

        // Count swim styles from actual competition events
        const styles = new Map<string, number>();
        clubSwimmers.forEach(swimmer => {
          if (swimmer.competitions) {
            swimmer.competitions.forEach(comp => {
              comp.events.forEach(event => {
                // Extract the style from the event name
                const style = event.event_name.split('/')[1]?.trim() || event.event_name;
                if (style && event.time !== '99:99:99' && event.place !== 'descalificat') {
                  styles.set(style, (styles.get(style) || 0) + 1);
                }
              });
            });
          }
        });

        // Calculate age groups
        const ageGroups = new Map<string, number>();
        ages.forEach(age => {
          const group = getAgeGroup(age);
          ageGroups.set(group, (ageGroups.get(group) || 0) + 1);
        });

        // Calculate medal distribution
        const medals = {
          gold: 0,
          silver: 0,
          bronze: 0
        };
        
        clubSwimmers.forEach(swimmer => {
          if (swimmer.competitions) {
            swimmer.competitions.forEach(comp => {
              comp.events.forEach(event => {
                if (event.place === '1') medals.gold++;
                else if (event.place === '2') medals.silver++;
                else if (event.place === '3') medals.bronze++;
              });
            });
          }
        });

        const medalDistribution = [
          { name: 'Gold', value: medals.gold, color: MEDAL_COLORS.gold },
          { name: 'Silver', value: medals.silver, color: MEDAL_COLORS.silver },
          { name: 'Bronze', value: medals.bronze, color: MEDAL_COLORS.bronze }
        ];

        setClubStats({
          totalSwimmers,
          averageAge,
          totalMedals: medals.gold + medals.silver + medals.bronze,
          swimStyles: Array.from(styles.entries())
            .map(([name, value]) => ({ 
              name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
              value 
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5), // Get top 5 most popular styles
          ageGroups: Array.from(ageGroups.entries())
            .map(([name]) => ({ name, value: ageGroups.get(name) || 0 }))
            .sort((a, b) => {
              const aStart = parseInt(a.name.split('-')[0]);
              const bStart = parseInt(b.name.split('-')[0]);
              return aStart - bStart;
            }),
          medalDistribution
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      setFilteredSwimmers(
        allSwimmers.filter(swimmer =>
          (swimmer.name?.toLowerCase().includes(query) ||
          swimmer.club.toLowerCase().includes(query) ||
          swimmer.preferred_styles?.some(style => 
            style.toLowerCase().includes(query)
          )) ?? false
        )
      );
    } else {
      setFilteredSwimmers(allSwimmers);
    }
  }, [searchQuery, allSwimmers]);

  const getAgeGroup = (age: number): string => {
    if (age < 12) return '8-11';
    if (age < 15) return '12-14';
    if (age < 18) return '15-17';
    if (age < 23) return '18-22';
    return '23+';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" color="text.primary">
            {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const renderSearchResults = () => {
    if (searchQuery.trim() === '') {
      return null;
    }

    return (
      <Box mt={2} mb={4}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Search Results ({filteredSwimmers.length})
        </Typography>
        <Grid container spacing={2}>
          {filteredSwimmers.map(swimmer => (
            <Grid item xs={12} sm={6} md={4} key={swimmer.swimmer_id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(108, 93, 211, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/profile/${swimmer.swimmer_id}`)}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" color="white">
                    {swimmer.name?.charAt(0) ?? '?'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.primary">
                    {swimmer.name ?? 'Unnamed Swimmer'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {swimmer.preferred_styles?.join(', ') || 'No styles specified'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search swimmers by name, club, or swimming style..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {renderSearchResults()}

      <Typography variant="h4" gutterBottom color="text.primary">
        Bluemarin Sport Club Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, height: '100%', bgcolor: 'background.paper' }}>
            <Box display="flex" alignItems="center">
              <Group sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="text.primary">{clubStats.totalSwimmers}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Swimmers
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, height: '100%', bgcolor: 'background.paper' }}>
            <Box display="flex" alignItems="center">
              <Timeline sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="text.primary">{clubStats.averageAge}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Age
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, height: '100%', bgcolor: 'background.paper' }}>
            <Box display="flex" alignItems="center">
              <EmojiEvents sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="text.primary">{clubStats.totalMedals}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Medals
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, height: '100%', bgcolor: 'background.paper' }}>
            <Box display="flex" alignItems="center">
              <Pool sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="text.primary">
                  {clubStats.swimStyles.length}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Swim Styles
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.primary">
                Age Distribution
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clubStats.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.primary">
                Medal Distribution
              </Typography>
              <Box height={300} display="flex" alignItems="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clubStats.medalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clubStats.medalDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box mt={2}>
                {clubStats.medalDistribution.map((entry) => (
                  <Box key={entry.name} display="flex" alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: entry.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="subtitle2" color="text.secondary">
                      {entry.name}: {entry.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.primary">
                Popular Swimming Styles
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clubStats.swimStyles} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      type="number"
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
