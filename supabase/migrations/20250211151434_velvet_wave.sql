/*
  # Fix RLS policies for events table

  1. Changes
    - Drop all existing policies to ensure clean slate
    - Create new policies for user-specific event management
    - Ensure proper access control for authenticated users
*/

-- First, drop all existing policies for events table
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;

-- Create new comprehensive policies
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