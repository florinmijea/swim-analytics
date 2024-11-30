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
import { Swimmer, Competition, Event } from '../types';
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

interface ChartDataPoint {
  x: Date;
  y: number;
  date: Date;
  displayTime: string;
  competition: string;
  timeDiff: string | null;
}

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

  if (swimmer?.competitions) {
    swimmer.competitions.forEach((comp: Competition) => {
      comp.events.forEach((event: Event) => {
        if (!event || !event.event_name) return;
        
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

        const startDate = new Date(comp.start_date);
        if (!isNaN(startDate.getTime())) {
          eventsByStyle[style].push({
            date: startDate,
            time: event.time,
            competition: comp.competition_name
          });
        }
      });
    });
  }

  // Sort events by date for each style
  Object.keys(eventsByStyle).forEach(style => {
    eventsByStyle[style].sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  console.log('Processed events by style:', eventsByStyle);

  const createChartData = (events: { date: Date; time: string; competition: string }[]) => {
    console.log('Creating chart data for events:', events);
    const timeData: ChartDataPoint[] = events.map((event, index) => {
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
        const diff = (prevTime - currentTime).toFixed(2);
        timeDiff = Number(diff);
      }

      return {
        x: event.date,
        y: timeInSeconds,
        date: event.date,
        displayTime: event.time,
        competition: event.competition,
        timeDiff: timeDiff ? (timeDiff > 0 ? `-${timeDiff}s` : `+${Math.abs(timeDiff)}s`) : null
      };
    });

    return {
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
          title: (items) => {
            if (!items.length) return '';
            const item = items[0].raw as ChartDataPoint;
            return `${item.competition}\n${item.date.toLocaleDateString()}`;
          },
          label: (item) => {
            const dataPoint = item.raw as ChartDataPoint;
            const lines = [`Time: ${dataPoint.displayTime}`];
            if (dataPoint.timeDiff) {
              lines.push(`Difference: ${dataPoint.timeDiff}`);
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        reverse: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value) => {
            const absValue = Math.abs(Number(value));
            const minutes = Math.floor(absValue / 60);
            const seconds = (absValue % 60).toFixed(2);
            return `${minutes}:${seconds.padStart(5, '0')}`;
          },
        },
        title: {
          display: true,
          text: 'Time (seconds)'
        }
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Analysis
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(eventsByStyle).map(([style, events]) => (
          <Grid item xs={12} md={6} key={style}>
            <Card sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                {style}
              </Typography>
              <Box sx={{ height: 'calc(100% - 32px)' }}>
                <Line data={createChartData(events)} options={chartOptions} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Performance;
