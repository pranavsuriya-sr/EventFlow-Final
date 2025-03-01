/*
  # Event Management Schema

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `name` (text)
      - `date` (date)
      - `time` (time)
      - `description` (text)
      - `capacity` (integer)
      - `tag` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `participants`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `ticket_number` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all events
      - Create/update/delete their own events
      - Read/create participants for events
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
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Participants policies
CREATE POLICY "Participants are viewable by everyone"
  ON participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add participants to any event"
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