-- Add phone and location columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update RLS policies to include new columns
-- The existing policies should work, but let's make sure
COMMENT ON COLUMN public.users.phone IS 'User phone number for contact';
COMMENT ON COLUMN public.users.location IS 'User location for matching'; 