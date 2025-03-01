import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if tables exist and show setup instructions if needed
    async function checkTables() {
      try {
        const { error: eventsError } = await supabase.from('events').select('id').limit(1);
        
        if (eventsError && eventsError.code === '42P01') {
          setSetupMessage(
            "Database tables don't exist yet. Please run the SQL setup script in the Supabase dashboard SQL editor."
          );
        }
      } catch (error) {
        console.error('Error checking tables:', error);
      }
    }
    
    checkTables();
  }, []);

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demo123'
      });

      if (error) {
        // Only try to sign up if the error is about the user not existing
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'demo@example.com',
            password: 'demo123',
            options: {
              data: {
                name: 'Demo User'
              }
            }
          });

          if (signUpError) throw signUpError;
          
          // Auto sign in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'demo@example.com',
            password: 'demo123'
          });
          
          if (signInError) throw signInError;
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    setLoading(true);
    try {
      // Copy SQL to clipboard
      const sql = `
-- Create event_tag enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_tag') THEN
    CREATE TYPE event_tag AS ENUM ('Tech', 'Non-Tech', 'Club Activities', 'External Talk');
  END IF;
END
$$;

-- Create events table
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

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

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
`;
      
      await navigator.clipboard.writeText(sql);
      setSetupMessage('SQL copied to clipboard! Paste it in the Supabase SQL Editor and run it.');
    } catch (error) {
      console.error('Error copying SQL:', error);
      setSetupMessage('Could not copy SQL. Please check the console for the SQL script.');
      console.log('SQL Script:');
      console.log(`
-- Create event_tag enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_tag') THEN
    CREATE TYPE event_tag AS ENUM ('Tech', 'Non-Tech', 'Club Activities', 'External Talk');
  END IF;
END
$$;

-- Create events table
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

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

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
`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to EventFlow</h2>
        
        {setupMessage && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            <p className="mb-2">{setupMessage}</p>
            <button
              onClick={handleSetupDatabase}
              className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Copy Setup SQL
            </button>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Continue as Demo User'}
        </button>
      </div>
    </div>
  );
}