export interface Event {
  event_name: string;
  time: string;
  place: string;
}

export interface Competition {
  competition_name: string;
  start_date: string;
  end_date: string;
  events: Event[];
  competition_type?: string;
  location?: string;
  isFuture?: boolean;
}

export interface Swimmer {
  swimmer_id: number;
  name?: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_year: number;
  club: string;
  lpin_license: string;
  federation_license: string;
  last_updated: string;
  competitions?: Competition[];
  preferred_styles?: string[];
}

// Helper function to calculate age
export function calculateAge(birth_year: number): number {
  return new Date().getFullYear() - birth_year;
}

// Helper function to get best times per style
export function getBestTimes(competitions: Competition[]): Record<string, string> {
  const bestTimes: Record<string, string> = {};
  
  competitions?.forEach(comp => {
    comp.events.forEach(event => {
      const style = event.event_name.split('/')[1]?.trim() || event.event_name;
      if (event.time !== '99:99:99' && event.place !== 'descalificat') {
        if (!bestTimes[style] || event.time < bestTimes[style]) {
          bestTimes[style] = event.time;
        }
      }
    });
  });
  
  return bestTimes;
}
