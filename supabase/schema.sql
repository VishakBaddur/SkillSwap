-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE public.users (
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
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  category TEXT
);

-- User skills junction table
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  is_offering BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  proficiency_level TEXT DEFAULT 'intermediate'
);

-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  matched_on TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  UNIQUE(user1_id, user2_id)
);

-- Messages table for chat functionality
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- Skill exchange requests table
CREATE TABLE public.skill_exchange_requests (
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
CREATE TABLE public.user_reports (
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
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  UNIQUE(blocker_id, blocked_user_id)
);

-- User ratings table
CREATE TABLE public.user_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rater_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_exchanged TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 5),
  teaching_ability_rating INTEGER DEFAULT 0 CHECK (teaching_ability_rating >= 0 AND teaching_ability_rating <= 5),
  punctuality_rating INTEGER DEFAULT 0 CHECK (punctuality_rating >= 0 AND punctuality_rating <= 5),
  friendliness_rating INTEGER DEFAULT 0 CHECK (friendliness_rating >= 0 AND friendliness_rating <= 5),
  knowledge_rating INTEGER DEFAULT 0 CHECK (knowledge_rating >= 0 AND knowledge_rating <= 5),
  review_text TEXT,
  UNIQUE(rater_id, rated_user_id, skill_exchanged)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for skills
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert skills" ON public.skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for user_skills
CREATE POLICY "Users can view all user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));
CREATE POLICY "Users can create matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update their matches" ON public.matches FOR UPDATE USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their sent messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for skill_exchange_requests
CREATE POLICY "Users can view their skill exchange requests" ON public.skill_exchange_requests FOR SELECT USING ((auth.uid() = requester_id) OR (auth.uid() = receiver_id));
CREATE POLICY "Users can create skill exchange requests" ON public.skill_exchange_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their skill exchange requests" ON public.skill_exchange_requests FOR UPDATE USING ((auth.uid() = requester_id) OR (auth.uid() = receiver_id));

-- RLS Policies for user_reports
CREATE POLICY "Users can view their reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for user_blocks
CREATE POLICY "Users can view their blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can create blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete their blocks" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- RLS Policies for user_ratings
CREATE POLICY "Users can view all ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can update their ratings" ON public.user_ratings FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Users can delete their ratings" ON public.user_ratings FOR DELETE USING (auth.uid() = rater_id);

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default skills
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

-- Create indexes for better performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_skill_exchange_requests_requester_id ON public.skill_exchange_requests(requester_id);
CREATE INDEX idx_skill_exchange_requests_receiver_id ON public.skill_exchange_requests(receiver_id);
CREATE INDEX idx_skill_exchange_requests_status ON public.skill_exchange_requests(status);
CREATE INDEX idx_skill_exchange_requests_created_at ON public.skill_exchange_requests(created_at);
CREATE INDEX idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_user_id ON public.user_blocks(blocked_user_id);
CREATE INDEX idx_user_ratings_rater_id ON public.user_ratings(rater_id);
CREATE INDEX idx_user_ratings_rated_user_id ON public.user_ratings(rated_user_id);
CREATE INDEX idx_user_ratings_overall_rating ON public.user_ratings(overall_rating);
CREATE INDEX idx_user_ratings_created_at ON public.user_ratings(created_at); 