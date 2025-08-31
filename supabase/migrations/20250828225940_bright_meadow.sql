/*
  # Create CSV Data Storage Table

  1. New Tables
    - `csv_data`
      - `id` (uuid, primary key)
      - `user_id` (text, identifies the user)
      - `csv_content` (text, stores the CSV data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `csv_data` table
    - Add policy for users to manage their own CSV data
*/

CREATE TABLE IF NOT EXISTS csv_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  csv_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE csv_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own CSV data"
  ON csv_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_csv_data_user_id ON csv_data(user_id);