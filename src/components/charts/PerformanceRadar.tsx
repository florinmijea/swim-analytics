import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { SwimmingStyle } from '../../types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PerformanceRadarProps {
  styles: SwimmingStyle[];
}

const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ styles }) => {
  const data = {
    labels: styles.map(style => style.name),
    datasets: [
      {
        label: 'Current Performance',
        data: styles.map(style => {
          const bestTime = style.bestTime;
          // Convert time to a score (inverse relationship - lower time is better)
          return 100 * (1 - bestTime / 120); // Assuming 120 seconds is the baseline
        }),
        backgroundColor: 'rgba(107, 78, 255, 0.2)',
        borderColor: 'rgb(107, 78, 255)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Overview
        </Typography>
        <Box sx={{ height: 300 }}>
          <Radar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceRadar;
