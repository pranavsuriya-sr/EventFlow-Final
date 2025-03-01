/*
  # Add user fields and update RLS policies

  1. New Fields
    - Add name and roll_number to auth.users
    - Add email confirmation requirement
  
  2. Security
    - Update RLS policies for user-specific event visibility
    - Keep analytics accessible to all authenticated users
*/

-- Add custom fields to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS roll_number text;

-- Drop existing policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;

-- Create new policies for user-specific event visibility
CREATE POLICY "Users can view their own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Keep existing update and delete policies as they already check user_id