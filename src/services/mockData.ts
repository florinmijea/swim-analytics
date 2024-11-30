import { Competition, Club, TrainingSession, Event } from '../types';
import { Swimmer } from '../types/swimmers';
import swimmersData from '../../data/swimmers_data.json';

// Define the raw data type to match the JSON structure
interface RawSwimmer {
  swimmer_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  gender: string;
  birth_year: number;
  club: string;
  lpin_license: string;
  federation_license: string;
  last_updated: string;
  competitions?: {
    competition_name: string;
    start_date: string;
    end_date: string;
    location?: string;
    competition_type?: string;
    events: {
      event_name: string;
      time: string;
      place: string;
    }[];
  }[];
}

const parseSwimmerName = (swimmer: RawSwimmer) => {
  if (swimmer.first_name && swimmer.last_name) {
    return {
      first_name: swimmer.first_name,
      last_name: swimmer.last_name
    };
  }
  
  const nameParts = (swimmer.name || '').split(' ');
  return {
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || ''
  };
};

const processSwimmer = (swimmer: RawSwimmer): Swimmer => {
  const { first_name, last_name } = parseSwimmerName(swimmer);
  
  return {
    swimmer_id: swimmer.swimmer_id,
    first_name,
    last_name,
    name: swimmer.name,
    gender: swimmer.gender,
    birth_year: swimmer.birth_year || new Date().getFullYear() - 20,
    club: swimmer.club,
    lpin_license: swimmer.lpin_license,
    federation_license: swimmer.federation_license,
    last_updated: swimmer.last_updated,
    competitions: swimmer.competitions?.map(comp => ({
      competition_name: comp.competition_name,
      start_date: comp.start_date,
      end_date: comp.end_date || comp.start_date,
      location: comp.location,
      competition_type: comp.competition_type,
      events: comp.events.map(event => ({
        event_name: event.event_name,
        time: event.time,
        place: event.place
      })),
      isFuture: new Date(comp.end_date || comp.start_date) > new Date()
    })) || []
  };
};

export const getAllSwimmers = async (): Promise<Swimmer[]> => {
  try {
    return (swimmersData as RawSwimmer[]).map(processSwimmer);
  } catch (error) {
    console.error('Error loading swimmers:', error);
    return [];
  }
};

export const getSwimmerData = async (swimmerId?: string): Promise<Swimmer | null> => {
  if (!swimmerId) {
    console.log('No swimmerId provided to getSwimmerData');
    return null;
  }

  try {
    const swimmer = (swimmersData as RawSwimmer[]).find(s => s.swimmer_id.toString() === swimmerId);
    return swimmer ? processSwimmer(swimmer) : null;
  } catch (error) {
    console.error('Error loading swimmer:', error);
    return null;
  }
};

// Cache for competitions data
let cachedCompetitions: Competition[] | null = null;
const competitionsCache = new Map<string, Competition[]>();

export const getCompetitions = async (): Promise<Competition[]> => {
  // Return cached data if available
  if (cachedCompetitions) {
    return cachedCompetitions;
  }

  const allSwimmers = await getAllSwimmers();
  const competitionsMap = new Map<string, Competition>();

  // Process all swimmers in a single pass
  allSwimmers.forEach(swimmer => {
    if (!swimmer.competitions) return;

    swimmer.competitions.forEach(comp => {
      const competitionId = `${comp.competition_name}-${comp.start_date}`;
      const isFutureCompetition = new Date(comp.end_date || comp.start_date) > new Date();
      
      if (!competitionsMap.has(competitionId)) {
        // Initialize competition with valid events only
        const validEvents = comp.events
          .filter(event => event.time !== '99:99:99' && event.place !== 'descalificat')
          .map(event => ({
            event_name: event.event_name,
            time: event.time,
            place: event.place
          }));

        competitionsMap.set(competitionId, {
          competition_name: comp.competition_name,
          start_date: comp.start_date,
          end_date: comp.end_date || comp.start_date,
          location: comp.location || 'Location TBD',
          competition_type: comp.competition_type || 'Competition',
          events: validEvents,
          isFuture: isFutureCompetition
        });
      } else {
        // Add only valid events that aren't duplicates
        const competition = competitionsMap.get(competitionId)!;
        const existingEventNames = new Set(competition.events.map(e => e.event_name));

        comp.events.forEach(event => {
          if (event.time !== '99:99:99' && 
              event.place !== 'descalificat' && 
              !existingEventNames.has(event.event_name)) {
            competition.events.push({
              event_name: event.event_name,
              time: event.time,
              place: event.place
            });
            existingEventNames.add(event.event_name);
          }
        });
      }
    });
  });

  // Sort competitions by date once at the end
  cachedCompetitions = Array.from(competitionsMap.values())
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return cachedCompetitions;
};

export const getSwimmerCompetitions = async (swimmerId: string): Promise<Competition[]> => {
  // Return cached data if available
  if (competitionsCache.has(swimmerId)) {
    return competitionsCache.get(swimmerId)!;
  }

  const swimmer = await getSwimmerData(swimmerId);
  if (!swimmer || !swimmer.competitions) {
    return [];
  }

  // Process swimmer's competitions
  const competitions = swimmer.competitions
    .map(comp => ({
      competition_name: comp.competition_name,
      start_date: comp.start_date,
      end_date: comp.end_date || comp.start_date,
      location: comp.location || 'Location TBD',
      competition_type: comp.competition_type || 'Competition',
      events: comp.events.map(event => ({
        event_name: event.event_name,
        time: event.time,
        place: event.place
      })),
      isFuture: new Date(comp.end_date || comp.start_date) > new Date()
    }))
    .filter(comp => {
      if (comp.isFuture) return true;
      return comp.events.some(event => 
        event.time !== '99:99:99' && event.place !== 'descalificat'
      );
    })
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Cache the results
  competitionsCache.set(swimmerId, competitions);
  return competitions;
};

// Add a function to clear the cache if needed
export const clearCompetitionsCache = (swimmerId?: string) => {
  if (swimmerId) {
    competitionsCache.delete(swimmerId);
  } else {
    competitionsCache.clear();
    cachedCompetitions = null;
  }
};

export const getClubs = async (): Promise<Club[]> => {
  return mockClubs;
};

export const getTrainingSessions = async (): Promise<TrainingSession[]> => {
  return mockTrainingSessions;
};

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
