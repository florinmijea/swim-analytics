import { Competition, Club, TrainingSession } from '../types';
import { Swimmer } from '../types/swimmers';
import swimmersData from '../../data/swimmers_data.json';

export const getAllSwimmers = async (): Promise<Swimmer[]> => {
  return swimmersData.map(swimmer => ({
    ...swimmer,
    birth_year: swimmer.birth_year || new Date().getFullYear() - 20 // Default age of 20 if birth_year is null
  }));
};

export const getSwimmerData = async (swimmerId?: string): Promise<Swimmer | null> => {
  if (!swimmerId) {
    console.log('No swimmerId provided to getSwimmerData');
    return null;
  }

  const swimmer = swimmersData.find(s => s.swimmer_id.toString() === swimmerId);
  if (!swimmer) return null;

  return {
    ...swimmer,
    birth_year: swimmer.birth_year || new Date().getFullYear() - 20 // Default age of 20 if birth_year is null
  };
};

export const getCompetitions = async (): Promise<Competition[]> => {
  return mockCompetitions;
};

export const getClubs = async (): Promise<Club[]> => {
  return mockClubs;
};

export const getTrainingSessions = async (): Promise<TrainingSession[]> => {
  return mockTrainingSessions;
};

export const mockCompetitions: Competition[] = [
  {
    id: '1',
    name: 'National Championship 2023',
    date: '2023-12-15',
    location: 'Olympic Pool Complex',
    type: 'National',
    events: [
      { name: '100m Freestyle', time: '00:52:45', place: '1st' },
      { name: '200m Butterfly', time: '02:15:30', place: '3rd' }
    ]
  },
  {
    id: '2',
    name: 'Regional Sprint Meet',
    date: '2024-02-20',
    location: 'City Aquatics Center',
    type: 'Regional',
    events: [
      { name: '50m Freestyle', time: '00:24:15', place: '2nd' },
      { name: '50m Butterfly', time: '00:26:45', place: '1st' }
    ]
  }
];

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Aquatic Champions',
    location: 'Downtown Pool',
    coach: 'Michael Thompson',
    members: 45
  },
  {
    id: '2',
    name: 'Swimming Elite',
    location: 'Sports Complex',
    coach: 'Sarah Wilson',
    members: 38
  }
];

export const mockTrainingSessions: TrainingSession[] = [
  {
    id: '1',
    date: '2024-01-29',
    type: 'technique',
    style: 'freestyle',
    duration: 90,
    distance: 2000,
    exercises: [
      {
        id: '1-1',
        name: 'Drill Set',
        sets: 4,
        reps: 50,
        distance: 200,
        restTime: 30,
        description: 'Focus on catch phase'
      },
      {
        id: '1-2',
        name: 'Main Set',
        sets: 6,
        reps: 100,
        distance: 600,
        restTime: 45,
        description: 'Build speed each 25m'
      }
    ],
    notes: 'Good progress on stroke efficiency'
  },
  {
    id: '2',
    date: '2024-01-30',
    type: 'endurance',
    style: 'mixed',
    duration: 120,
    distance: 3000,
    exercises: [
      {
        id: '2-1',
        name: 'Warm Up',
        sets: 1,
        reps: 400,
        distance: 400,
        restTime: 60,
        description: 'Mixed strokes'
      },
      {
        id: '2-2',
        name: 'Distance Set',
        sets: 3,
        reps: 400,
        distance: 1200,
        restTime: 90,
        description: 'Negative split'
      }
    ],
    notes: 'Maintained good pace throughout'
  }
];
