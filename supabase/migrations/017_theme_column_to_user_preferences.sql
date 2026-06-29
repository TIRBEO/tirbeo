ALTER TABLE user_preferences ADD COLUMN theme text check (theme in ('dark', 'light', 'system'));

-- Set default theme for existing users to 'dark'
UPDATE user_preferences SET theme = 'dark' WHERE theme IS NULL;

-- Create index for the theme column for better query performance
CREATE INDEX idx_user_preferences_theme ON user_preferences(theme);
