-- Add reply functionality to chat messages

-- Add reply_to_message_id to rescue_team_chat_messages
ALTER TABLE rescue_team_chat_messages
ADD COLUMN reply_to_message_id uuid REFERENCES rescue_team_chat_messages(id) ON DELETE SET NULL;

-- Add reply_to_message_id to youth_chat_messages
ALTER TABLE youth_chat_messages
ADD COLUMN reply_to_message_id uuid REFERENCES youth_chat_messages(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_rescue_team_chat_reply ON rescue_team_chat_messages(reply_to_message_id);
CREATE INDEX idx_youth_chat_reply ON youth_chat_messages(reply_to_message_id);