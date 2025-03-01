import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Checking database setup...');
    
    // Check if events table exists
    const { data: eventsExists, error: eventsError } = await supabase.from('events').select('id').limit(1);
    
    if (eventsError && eventsError.code === '42P01') { // Table doesn't exist
      console.log('Creating database schema...');
      
      // Create event_tag enum
      await supabase.rpc('exec_sql', { 
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_tag') THEN
              CREATE TYPE event_tag AS ENUM ('Tech', 'Non-Tech', 'Club Activities', 'External Talk');
            END IF;
          END
          $$;
        `
      });
      
      // Create events table
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            date date NOT NULL,
            time time NOT NULL,
            description text NOT NULL,
            capacity integer NOT NULL CHECK (capacity > 0),
            tag event_tag NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            user_id uuid REFERENCES auth.users(id) NOT NULL
          );
          
          -- Create updated_at trigger for events
          CREATE OR REPLACE FUNCTION update_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = now();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          DROP TRIGGER IF EXISTS events_updated_at ON events;
          CREATE TRIGGER events_updated_at
            BEFORE UPDATE ON events
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        `
      });
      
      // Create participants table
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS participants (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
            ticket_number text NOT NULL,
            created_at timestamptz DEFAULT now()
          );
        `
      });
      
      // Enable RLS and create policies
      await supabase.rpc('exec_sql', { 
        sql: `
          -- Enable RLS
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
          
          -- Events policies
          DROP POLICY IF EXISTS "view_own_events" ON events;
          CREATE POLICY "view_own_events"
            ON events
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "insert_own_events" ON events;
          CREATE POLICY "insert_own_events"
            ON events
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "update_own_events" ON events;
          CREATE POLICY "update_own_events"
            ON events
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "delete_own_events" ON events;
          CREATE POLICY "delete_own_events"
            ON events
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
          
          -- Participants policies
          DROP POLICY IF EXISTS "participants_select" ON participants;
          CREATE POLICY "participants_select"
            ON participants
            FOR SELECT
            TO authenticated
            USING (true);
          
          DROP POLICY IF EXISTS "participants_insert" ON participants;
          CREATE POLICY "participants_insert"
            ON participants
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
        `
      });
      
      console.log('Database setup complete!');
    } else {
      console.log('Database already set up.');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    
    // If the error is related to the exec_sql function not existing,
    // we need to inform the user to run the SQL migrations manually
    if (error instanceof Error && error.message.includes('function exec_sql() does not exist')) {
      console.error('The exec_sql function does not exist in your Supabase project.');
      console.error('Please run the SQL migrations manually in the Supabase dashboard SQL editor.');
    }
  }
}