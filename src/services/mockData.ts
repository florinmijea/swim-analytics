import { Swimmer, TimeRecord, SwimmingStyle, Competition, Club, TrainingSession } from '../types';
import { Swimmer as SwimmerType } from '../types/swimmers';
import swimmersData from '../../data/swimmers_data.json';

// Temporary mock data until we fix the JSON import
const mockSwimmers: Swimmer[] = [
  {
    id: '1',
    name: 'Alex Smith',
    age: 22,
    club: 'Aquatic Champions',
    styles: [
      { name: 'Freestyle', level: 90 },
      { name: 'Butterfly', level: 85 },
      { name: 'Backstroke', level: 80 },
      { name: 'Breaststroke', level: 75 },
    ],
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    age: 20,
    club: 'Swimming Elite',
    styles: [
      { name: 'Freestyle', level: 88 },
      { name: 'Butterfly', level: 92 },
      { name: 'Backstroke', level: 85 },
      { name: 'Breaststroke', level: 78 },
    ],
  },
  {
    id: '3',
    name: 'John Davis',
    age: 19,
    club: 'City Swimmers',
    styles: [
      { name: 'Freestyle', level: 95 },
      { name: 'Butterfly', level: 82 },
      { name: 'Backstroke', level: 88 },
      { name: 'Breaststroke', level: 85 },
    ],
  },
];

export const getAllSwimmers = async (): Promise<SwimmerType[]> => {
  return swimmersData;
};

export const getSwimmerData = async (swimmerId?: string): Promise<SwimmerType | null> => {
  if (!swimmerId) {
    console.log('No swimmerId provided to getSwimmerData');
    return null;
  }

  try {
    console.log('Loading swimmers data for ID:', swimmerId);
    const swimmers = await getAllSwimmers();
    console.log('Found', swimmers.length, 'total swimmers');
    
    // Use swimmer_id instead of id for matching
    const swimmer = swimmers.find(s => s.swimmer_id.toString() === swimmerId);
    console.log('Found swimmer?', !!swimmer);
    
    if (!swimmer) {
      console.log('No swimmer found with ID:', swimmerId);
      return null;
    }

    // Ensure competitions exist and are properly formatted
    if (!swimmer.competitions || !Array.isArray(swimmer.competitions)) {
      console.log('No competitions found for swimmer:', swimmerId);
      swimmer.competitions = [];
    }

    console.log('Returning swimmer with', swimmer.competitions.length, 'competitions');
    return swimmer;
  } catch (error) {
    console.error('Error in getSwimmerData:', error);
    return null;
  }
};

export const mockCompetitions: Competition[] = [
  {
    id: '1',
    name: 'National Championship 2023',
    date: '2023-09-05',
    location: 'Olympic Pool, Bucharest',
    participants: ['1', '2', '3'],
    results: [
      { swimmerId: '1', style: 'Freestyle', time: 52.31, rank: 1 },
      { swimmerId: '1', style: 'Butterfly', time: 56.78, rank: 2 },
    ],
  },
  {
    id: '2',
    name: 'Summer Open 2023',
    date: '2023-06-10',
    location: 'Municipal Pool, Cluj',
    participants: ['1', '2', '4'],
    results: [
      { swimmerId: '1', style: 'Freestyle', time: 52.89, rank: 2 },
      { swimmerId: '1', style: 'Butterfly', time: 57.12, rank: 1 },
    ],
  },
];

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Aquatic Champions',
    totalSwimmers: 85,
    competitionsParticipated: 12,
    ranking: 1,
    location: 'Bucharest',
    achievements: {
      goldMedals: 45,
      silverMedals: 30,
      bronzeMedals: 25,
    },
    topStyles: ['Freestyle', 'Butterfly'],
    coachName: 'Maria Popescu',
    foundedYear: 2010,
  },
  {
    id: '2',
    name: 'Swimming Elite Cluj',
    totalSwimmers: 72,
    competitionsParticipated: 10,
    ranking: 2,
    location: 'Cluj-Napoca',
    achievements: {
      goldMedals: 38,
      silverMedals: 42,
      bronzeMedals: 28,
    },
    topStyles: ['Backstroke', 'Freestyle'],
    coachName: 'Ioan Muresan',
    foundedYear: 2012,
  },
  {
    id: '3',
    name: 'Timisoara Swim Club',
    totalSwimmers: 65,
    competitionsParticipated: 8,
    ranking: 3,
    location: 'Timisoara',
    achievements: {
      goldMedals: 32,
      silverMedals: 28,
      bronzeMedals: 35,
    },
    topStyles: ['Breaststroke', 'Medley'],
    coachName: 'Alexandra Dumitrescu',
    foundedYear: 2015,
  },
  {
    id: '4',
    name: 'Constanta Dolphins',
    totalSwimmers: 58,
    competitionsParticipated: 9,
    ranking: 4,
    location: 'Constanta',
    achievements: {
      goldMedals: 25,
      silverMedals: 35,
      bronzeMedals: 30,
    },
    topStyles: ['Freestyle', 'Butterfly'],
    coachName: 'Stefan Ionescu',
    foundedYear: 2013,
  },
  {
    id: '5',
    name: 'Iasi Swimming Academy',
    totalSwimmers: 50,
    competitionsParticipated: 7,
    ranking: 5,
    location: 'Iasi',
    achievements: {
      goldMedals: 20,
      silverMedals: 28,
      bronzeMedals: 32,
    },
    topStyles: ['Medley', 'Backstroke'],
    coachName: 'Elena Vasilescu',
    foundedYear: 2016,
  },
];

export const mockTrainingSessions = [
  {
    id: '1',
    date: '2024-01-29',
    type: 'technique',
    style: 'Freestyle',
    duration: 90,
    distance: 2000,
    exercises: [
      {
        id: '1-1',
        name: 'Warm-up',
        sets: 1,
        reps: 1,
        distance: 400,
        restTime: 60,
        description: 'Easy freestyle swim with focus on breathing',
      },
      {
        id: '1-2',
        name: 'Drill: Catch-up',
        sets: 4,
        reps: 2,
        distance: 50,
        restTime: 30,
        description: 'One arm stays in front while other arm pulls',
      },
      {
        id: '1-3',
        name: 'Main Set',
        sets: 6,
        reps: 4,
        distance: 50,
        targetTime: 35,
        restTime: 45,
        description: 'Focus on high elbow catch and rotation',
      },
      {
        id: '1-4',
        name: 'Cool Down',
        sets: 1,
        reps: 1,
        distance: 200,
        restTime: 0,
        description: 'Easy swim, mixed strokes',
      },
    ],
    notes: 'Focus on maintaining proper form throughout the session',
  },
  {
    id: '2',
    date: '2024-01-30',
    type: 'endurance',
    style: 'Mixed',
    duration: 120,
    distance: 3000,
    exercises: [
      {
        id: '2-1',
        name: 'Warm-up',
        sets: 1,
        reps: 1,
        distance: 500,
        restTime: 60,
        description: 'Progressive warm-up with mixed strokes',
      },
      {
        id: '2-2',
        name: 'Pyramid Set',
        sets: 1,
        reps: 5,
        distance: 100,
        targetTime: 90,
        restTime: 30,
        description: '100m intervals with increasing intensity',
      },
      {
        id: '2-3',
        name: 'Distance Set',
        sets: 2,
        reps: 1,
        distance: 800,
        targetTime: 720,
        restTime: 120,
        description: 'Steady-pace freestyle',
      },
      {
        id: '2-4',
        name: 'Cool Down',
        sets: 1,
        reps: 1,
        distance: 300,
        restTime: 0,
        description: 'Easy swimming, focus on recovery',
      },
    ],
    notes: 'Build endurance while maintaining technique',
  },
  {
    id: '3',
    date: '2024-01-31',
    type: 'speed',
    style: 'Butterfly',
    duration: 75,
    distance: 1500,
    exercises: [
      {
        id: '3-1',
        name: 'Dynamic Warm-up',
        sets: 1,
        reps: 1,
        distance: 300,
        restTime: 60,
        description: 'Progressive butterfly drills',
      },
      {
        id: '3-2',
        name: 'Sprint Set',
        sets: 8,
        reps: 2,
        distance: 25,
        targetTime: 15,
        restTime: 45,
        description: 'Maximum effort sprints',
      },
      {
        id: '3-3',
        name: 'Recovery Intervals',
        sets: 4,
        reps: 1,
        distance: 100,
        restTime: 30,
        description: 'Easy freestyle between sprint sets',
      },
      {
        id: '3-4',
        name: 'Cool Down',
        sets: 1,
        reps: 1,
        distance: 200,
        restTime: 0,
        description: 'Light swimming and stretching',
      },
    ],
    notes: 'Focus on explosive power and maintaining form during sprints',
  },
];

export const getCompetitions = (): Promise<Competition[]> => {
  return Promise.resolve(mockCompetitions);
};

export const getClubs = (): Promise<Club[]> => {
  return Promise.resolve(mockClubs);
};

export const getTrainingSessions = (): Promise<TrainingSession[]> => {
  return Promise.resolve(mockTrainingSessions);
};
