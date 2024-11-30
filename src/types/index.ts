export interface Swimmer {
  id: string;
  name: string;
  age: number;
  club: string;
  styles: SwimmingStyle[];
  competitions?: Competition[];
}

export interface SwimmingStyle {
  name: string;
  bestTime: number;
  recentTimes: TimeRecord[];
}

export interface TimeRecord {
  time: number;
  date: string;
  competition: string;
}

export interface Club {
  id: string;
  name: string;
  location: string;
  coach: string;
  members: number;
}

export interface Event {
  event_name: string;
  time: string;
  place: string;
}

export interface Competition {
  competition_name: string;
  start_date: string;
  end_date: string;
  location?: string;
  competition_type?: string;
  events: Event[];
  isFuture?: boolean;
}

export interface CompetitionResult {
  swimmerId: string;
  style: string;
  time: number;
  rank: number;
}

export interface TrainingSession {
  id: string;
  date: string;
  type: 'technique' | 'endurance' | 'speed' | 'recovery';
  style: string;
  duration: number; // in minutes
  distance: number; // in meters
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    distance: number;
    restTime: number; // in seconds
    description: string;
  }[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  distance: number;
  targetTime?: number;
  restTime: number; // in seconds
  description?: string;
}
