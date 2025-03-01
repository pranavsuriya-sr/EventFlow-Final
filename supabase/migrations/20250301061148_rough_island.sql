/*
  # Create database setup functions

  1. New Functions
    - `create_event_tag_enum`: Creates the event_tag enum if it doesn't exist
    - `create_events_table`: Creates the events table if it doesn't exist
    - `create_participants_table`: Creates the participants table if it doesn't exist
    - `setup_rls_policies`: Sets up row level security policies for both tables
  2. Security
    - All functions are accessible to authenticated users
*/

-- Function to create event_tag enum
CREATE OR REPLACE FUNCTION create_event_tag_enum()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_tag') THEN
    CREATE TYPE event_tag AS ENUM ('Tech', 'Non-Tech', 'Club Activities', 'External Talk');
  END IF;
END;
$$;

-- Function to create events table
CREATE OR REPLACE FUNCTION create_events_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    CREATE TABLE events (
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
    RETURNS TRIGGER AS $trigger$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;

    CREATE TRIGGER events_updated_at
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;

-- Function to create participants table
CREATE OR REPLACE FUNCTION create_participants_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'participants') THEN
    CREATE TABLE participants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
      ticket_number text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END;
$$;

-- Function to setup RLS policies
CREATE OR REPLACE FUNCTION setup_rls_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
END;
$$;