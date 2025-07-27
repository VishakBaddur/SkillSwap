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

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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