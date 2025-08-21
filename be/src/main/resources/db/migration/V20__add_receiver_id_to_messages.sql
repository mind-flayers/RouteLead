-- Add receiver_id column to messages table
ALTER TABLE messages ADD COLUMN receiver_id UUID REFERENCES profiles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
