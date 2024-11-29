import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TimeRecord } from '../../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TimeProgressChartProps {
  title: string;
  timeRecords: TimeRecord[];
}

const TimeProgressChart: React.FC<TimeProgressChartProps> = ({ title, timeRecords }) => {
  const sortedRecords = [...timeRecords].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = {
    labels: sortedRecords.map(record => format(new Date(record.date), 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Time (seconds)',
        data: sortedRecords.map(record => record.time),
        borderColor: 'rgb(107, 78, 255)',
        backgroundColor: 'rgba(107, 78, 255, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const time = context.raw;
            const minutes = Math.floor(time / 60);
            const seconds = (time % 60).toFixed(2);
            return `Time: ${minutes}:${seconds.padStart(5, '0')}`;
          },
        },
      },
    },
    scales: {
      y: {
        reverse: true,
        title: {
          display: true,
          text: 'Time (seconds)',
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeProgressChart;
