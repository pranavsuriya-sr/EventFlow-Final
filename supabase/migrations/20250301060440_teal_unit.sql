/*
  # Event Manager Schema

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `date` (date, not null)
      - `time` (time, not null)
      - `description` (text, not null)
      - `capacity` (integer, not null)
      - `tag` (event_tag enum, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `user_id` (uuid, references auth.users(id), not null)
    - `participants`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events(id), not null)
      - `ticket_number` (text, not null)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create enum for event tags
CREATE TYPE event_tag AS ENUM ('Tech', 'Non-Tech', 'Club Activities', 'External Talk');

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
CREATE POLICY "view_own_events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Participants policies
CREATE POLICY "participants_select"
  ON participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "participants_insert"
  ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger for events
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();