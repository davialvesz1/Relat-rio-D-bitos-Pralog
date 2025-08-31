/*
  # Create CSV Data Storage Table

  1. New Tables
    - `csv_data`
      - `id` (uuid, primary key)
      - `user_id` (text) - identifier for shared data
      - `csv_content` (text) - the CSV file content
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `csv_data` table
    - Add policy for public access to shared data
    - Add index for user_id for better performance

  3. Notes
    - Uses 'shared' as user_id for data accessible by all users
    - Supports upsert operations for updating existing data
*/

CREATE TABLE IF NOT EXISTS csv_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  csv_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE csv_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to shared data
CREATE POLICY "Allow public access to shared CSV data"
  ON csv_data
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_csv_data_user_id ON csv_data (user_id);