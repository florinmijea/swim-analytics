import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Swimmer } from '../types/swimmers';
import { getSwimmerData } from '../services/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Performance: React.FC = () => {
  const { swimmerId } = useParams();
  const [swimmer, setSwimmer] = useState<Swimmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!swimmerId) {
        console.log('No swimmerId provided');
        return;
      }

      try {
        console.log('Loading data for swimmer:', swimmerId);
        setLoading(true);
        setError(null);
        const data = await getSwimmerData(swimmerId);
        console.log('Received swimmer data:', data);
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

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error || !swimmer) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Swimmer not found'}
      </Alert>
    );
  }

  // Process competition data
  console.log('Processing competitions:', swimmer.competitions);
  const eventsByStyle: { [key: string]: { date: Date; time: string; competition: string }[] } = {};

  swimmer.competitions.forEach(comp => {
    console.log('Processing competition:', comp);
    comp.events.forEach(event => {
      const style = event.event_name.split('/')[1]?.trim() || event.event_name;
      console.log('Processing event:', event, 'Style:', style);
      
      // Skip invalid times and disqualifications
      if (event.time === '99:99:99' || event.place === 'descalificat') {
        console.log('Skipping invalid time or DQ:', event.time, event.place);
        return;
      }

      if (!eventsByStyle[style]) {
        eventsByStyle[style] = [];
      }

      eventsByStyle[style].push({
        date: new Date(comp.start_date),
        time: event.time,
        competition: comp.competition_name
      });
    });
  });

  // Sort events by date for each style
  Object.keys(eventsByStyle).forEach(style => {
    eventsByStyle[style].sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  console.log('Processed events by style:', eventsByStyle);

  const createChartData = (events: { date: Date; time: string; competition: string }[]) => {
    console.log('Creating chart data for events:', events);
    const timeData = events.map((event, index) => {
      const [minutes, seconds, centiseconds] = event.time.split(':').map(Number);
      const timeInSeconds = -(minutes * 60 + seconds + (centiseconds || 0) / 100);
      
      // Calculate time difference from previous data point
      let timeDiff = null;
      if (index > 0) {
        const prevTime = Math.abs(events[index - 1].time.split(':').map(Number).reduce((acc, val, idx) => {
          if (idx === 0) return acc + val * 60;
          if (idx === 1) return acc + val;
          return acc + val / 100;
        }, 0));
        const currentTime = Math.abs(timeInSeconds);
        timeDiff = (prevTime - currentTime).toFixed(2);
      }

      const dataPoint = {
        x: event.date,
        y: timeInSeconds,
        date: event.date,
        displayTime: event.time,
        competition: event.competition,
        timeDiff: timeDiff ? (timeDiff > 0 ? `-${timeDiff}s` : `+${Math.abs(Number(timeDiff))}s`) : null
      };
      console.log('Created data point:', dataPoint);
      return dataPoint;
    });

    const chartData = {
      labels: timeData.map(d => d.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Time',
          data: timeData,
          borderColor: 'rgba(149, 76, 233, 1)',
          backgroundColor: 'rgba(149, 76, 233, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: 'rgba(149, 76, 233, 1)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
        },
      ],
    };
    console.log('Created chart data:', chartData);
    return chartData;
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: any) => {
            const item = items[0].raw;
            return `${item.competition}\n${item.date.toLocaleDateString()}`;
          },
          label: (item: any) => {
            const lines = [`Time: ${item.raw.displayTime}`];
            if (item.raw.timeDiff) {
              lines.push(`Difference: ${item.raw.timeDiff}`);
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
      },
      y: {
        reverse: true,
        type: 'linear' as const,
        grid: {
          color: '#f0f0f0',
        },
        ticks: {
          callback: function(value) {
            const absValue = Math.abs(Number(value));
            const minutes = Math.floor(absValue / 60);
            const seconds = Math.floor(absValue % 60);
            const centiseconds = Math.round((absValue % 1) * 100);
            return `${minutes}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
          },
        },
      },
    },
  };

  const styles = Object.keys(eventsByStyle);
  console.log('Available styles:', styles);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {swimmer.name}'s Performance
      </Typography>
      <Grid container spacing={3}>
        {styles.length > 0 ? (
          styles.map((style) => {
            console.log(`Creating chart for ${style}:`, eventsByStyle[style]);
            return (
              <Grid item xs={12} md={6} key={style}>
                <Card sx={{ height: '400px', p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {style}
                  </Typography>
                  <Box sx={{ height: 'calc(100% - 40px)' }}>
                    <Line
                      data={createChartData(eventsByStyle[style])}
                      options={chartOptions}
                    />
                  </Box>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No performance data available for this swimmer.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Performance;
