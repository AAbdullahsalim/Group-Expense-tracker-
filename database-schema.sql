-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view groups they created" ON groups
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update groups they created" ON groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete groups they created" ON groups
  FOR DELETE USING (auth.uid() = created_by);

-- Expenses policies
CREATE POLICY "Users can view expenses for their groups" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses for their groups" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses they created" ON expenses
  FOR UPDATE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses they created" ON expenses
  FOR DELETE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 