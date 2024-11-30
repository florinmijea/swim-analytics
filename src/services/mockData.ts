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
      
      if (!competitionsMap.has(competitionId)) {
        // Initialize competition with valid events only
        const validEvents = comp.events
          .filter(event => event.time !== '99:99:99' && event.place !== 'descalificat')
          .map(event => ({
            name: event.event_name,
            time: event.time,
            place: event.place
          }));

        competitionsMap.set(competitionId, {
          id: competitionId,
          name: comp.competition_name,
          date: comp.start_date,
          location: comp.location || 'Location TBD',
          type: comp.competition_type || 'Competition',
          events: validEvents
        });
      } else {
        // Add only valid events that aren't duplicates
        const competition = competitionsMap.get(competitionId)!;
        const existingEventNames = new Set(competition.events.map(e => e.name));

        comp.events.forEach(event => {
          if (event.time !== '99:99:99' && 
              event.place !== 'descalificat' && 
              !existingEventNames.has(event.event_name)) {
            competition.events.push({
              name: event.event_name,
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
  const competitions = swimmer.competitions.map(comp => {
    // Filter valid events
    const validEvents = comp.events
      .filter(event => event.time !== '99:99:99' && event.place !== 'descalificat')
      .map(event => ({
        name: event.event_name,
        time: event.time,
        place: event.place
      }));

    return {
      id: `${comp.competition_name}-${comp.start_date}`,
      name: comp.competition_name,
      date: comp.start_date,
      location: comp.location || 'Location TBD',
      type: comp.competition_type || 'Competition',
      events: validEvents
    };
  })
  .filter(comp => comp.events.length > 0) // Only include competitions with valid events
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
