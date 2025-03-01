export type EventTag = 'Tech' | 'Non-Tech' | 'Club Activities' | 'External Talk';

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  tag: EventTag;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Participant {
  id: string;
  event_id: string;
  ticket_number: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      participants: {
        Row: Participant;
        Insert: Omit<Participant, 'id' | 'created_at'>;
        Update: Partial<Omit<Participant, 'id' | 'created_at'>>;
      };
    };
  };
}