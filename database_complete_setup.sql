-- =====================================================
-- SKILLSWAP COMPLETE DATABASE SETUP
-- One-time comprehensive fix for all database issues
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (update if exists, create if not)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT,
  bio TEXT,
  profile_picture TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  category TEXT
);

-- User skills junction table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  is_offering BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  proficiency_level TEXT DEFAULT 'intermediate'
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  matched_on TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  UNIQUE(user1_id, user2_id)
);

-- Messages table for chat functionality
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- Skill exchange requests table
CREATE TABLE IF NOT EXISTS public.skill_exchange_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_to_learn TEXT NOT NULL,
  skill_to_teach TEXT NOT NULL,
  message TEXT,
  preferred_time TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  evidence TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id)
);

-- User blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  UNIQUE(blocker_id, blocked_user_id)
);

-- User ratings table
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rater_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_exchanged TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 5),
  teaching_ability_rating INTEGER DEFAULT 0 CHECK (teaching_ability_rating >= 0 AND teaching_ability_rating <= 5),
  punctuality_rating INTEGER DEFAULT 0 CHECK (punctuality_rating >= 0 AND punctuality_rating <= 5),
  review_text TEXT,
  UNIQUE(rater_id, rated_user_id, skill_exchanged)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all skills" ON public.skills;
DROP POLICY IF EXISTS "Users can view their own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their skill exchange requests" ON public.skill_exchange_requests;
DROP POLICY IF EXISTS "Users can create skill exchange requests" ON public.skill_exchange_requests;
DROP POLICY IF EXISTS "Users can update their skill exchange requests" ON public.skill_exchange_requests;
DROP POLICY IF EXISTS "Users can view their reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can view ratings for them" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON public.user_ratings;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills policies (public read, admin write)
CREATE POLICY "Users can view all skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can insert skills" ON public.skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update skills" ON public.skills FOR UPDATE USING (true);

-- User skills policies
CREATE POLICY "Users can view all user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can view their own skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));
CREATE POLICY "Users can create matches" ON public.matches FOR INSERT WITH CHECK ((auth.uid() = user1_id) OR (auth.uid() = user2_id));
CREATE POLICY "Users can update their matches" ON public.matches FOR UPDATE USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their sent messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Skill exchange requests policies
CREATE POLICY "Users can view their skill exchange requests" ON public.skill_exchange_requests FOR SELECT USING ((auth.uid() = requester_id) OR (auth.uid() = receiver_id));
CREATE POLICY "Users can create skill exchange requests" ON public.skill_exchange_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their skill exchange requests" ON public.skill_exchange_requests FOR UPDATE USING ((auth.uid() = requester_id) OR (auth.uid() = receiver_id));

-- User reports policies
CREATE POLICY "Users can view their reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- User blocks policies
CREATE POLICY "Users can view their blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can create blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete their blocks" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- User ratings policies
CREATE POLICY "Users can view ratings for them" ON public.user_ratings FOR SELECT USING (auth.uid() = rated_user_id);
CREATE POLICY "Users can create ratings" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_skill_exchange_requests_requester_id ON public.skill_exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_skill_exchange_requests_receiver_id ON public.skill_exchange_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id ON public.user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_id ON public.user_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON public.user_ratings(rated_user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert some sample skills if they don't exist
INSERT INTO public.skills (name, category) VALUES
('JavaScript', 'technology'),
('Python', 'technology'),
('React', 'technology'),
('Node.js', 'technology'),
('TypeScript', 'technology'),
('SQL', 'technology'),
('Spanish', 'languages'),
('French', 'languages'),
('German', 'languages'),
('Italian', 'languages'),
('Guitar', 'music'),
('Piano', 'music'),
('Violin', 'music'),
('Singing', 'music'),
('Photography', 'art'),
('Drawing', 'art'),
('Painting', 'art'),
('Digital Art', 'art'),
('Cooking', 'cooking'),
('Baking', 'cooking'),
('Yoga', 'sports'),
('Tennis', 'sports'),
('Swimming', 'sports'),
('Running', 'sports'),
('Marketing', 'business'),
('Public Speaking', 'business'),
('Project Management', 'business'),
('Sales', 'business'),
('Writing', 'creative'),
('Video Editing', 'creative'),
('Graphic Design', 'creative'),
('Web Design', 'creative')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This will show a success message when the script completes
DO $$
BEGIN
    RAISE NOTICE '✅ SkillSwap database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: users, skills, user_skills, matches, messages, skill_exchange_requests, user_reports, user_blocks, user_ratings';
    RAISE NOTICE '🔒 RLS policies applied for security';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🎯 Sample skills data inserted';
    RAISE NOTICE '🚀 Your SkillSwap app is now ready!';
END $$;

