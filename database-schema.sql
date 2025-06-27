-- ============================================================================
-- GROUP EXPENSE TRACKER DATABASE SCHEMA
-- ============================================================================
-- 
-- This SQL schema creates the complete database structure for the Group Expense
-- Tracker application. It includes table definitions, Row Level Security (RLS)
-- policies, and automatic user profile creation triggers.
-- 
-- Database Structure:
-- - profiles: User profile information linked to Supabase Auth
-- - groups: Expense groups created by users
-- - expenses: Individual expenses within groups
-- 
-- Security Model:
-- - Row Level Security (RLS) enabled on all tables
-- - Users can only access their own data
-- - Comprehensive policies for CRUD operations
-- - Automatic profile creation on user signup
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES TABLE
-- ----------------------------------------------------------------------------
-- Stores user profile information that extends Supabase Auth users.
-- Each record is automatically created when a user signs up via trigger.
-- 
-- Relationships:
-- - id: Foreign key to auth.users (Supabase's built-in auth table)
-- - One-to-many with groups (user can create multiple groups)
-- - One-to-many with expenses (user can create multiple expenses)
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,  -- Links to Supabase Auth user
  email TEXT NOT NULL,                                          -- User's email address
  username TEXT,                                                -- Optional username for display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- GROUPS TABLE
-- ----------------------------------------------------------------------------
-- Stores expense groups that users create to organize their expenses.
-- Each group belongs to exactly one user (the creator).
-- 
-- Relationships:
-- - created_by: Foreign key to profiles table
-- - One-to-many with expenses (group can contain multiple expenses)
-- ----------------------------------------------------------------------------
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,               -- Unique group identifier
  name TEXT NOT NULL,                                          -- Group name (e.g., "Family Expenses")
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Group owner
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- EXPENSES TABLE
-- ----------------------------------------------------------------------------
-- Stores individual expenses within groups. Each expense belongs to both
-- a group and the user who created it.
-- 
-- Relationships:
-- - group_id: Foreign key to groups table
-- - created_by: Foreign key to profiles table
-- ----------------------------------------------------------------------------
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,               -- Unique expense identifier
  description TEXT NOT NULL,                                   -- Expense description (e.g., "Dinner at restaurant")
  amount DECIMAL(10,2) NOT NULL,                              -- Expense amount with 2 decimal places
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,     -- Which group this expense belongs to
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Who created this expense
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ============================================================================
-- 
-- Row Level Security ensures that users can only access data they own.
-- This is a database-level security feature that automatically filters
-- queries based on the current user's authentication context.
-- 
-- Benefits:
-- - Data isolation between users
-- - Automatic security enforcement
-- - No need for manual filtering in application code
-- - Protection against SQL injection and data breaches
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES TABLE POLICIES
-- ----------------------------------------------------------------------------
-- Users can only view, update, and insert their own profile data.
-- This ensures complete user data isolation.
-- ----------------------------------------------------------------------------

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (username, etc.)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (used by signup trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- GROUPS TABLE POLICIES
-- ----------------------------------------------------------------------------
-- Users can only access groups they created. This ensures that users
-- cannot see or modify other users' expense groups.
-- ----------------------------------------------------------------------------

-- Allow users to view groups they created
CREATE POLICY "Users can view groups they created" ON groups
  FOR SELECT USING (auth.uid() = created_by);

-- Allow users to create new groups (must be the creator)
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update groups they created (rename, etc.)
CREATE POLICY "Users can update groups they created" ON groups
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete groups they created
CREATE POLICY "Users can delete groups they created" ON groups
  FOR DELETE USING (auth.uid() = created_by);

-- ----------------------------------------------------------------------------
-- EXPENSES TABLE POLICIES
-- ----------------------------------------------------------------------------
-- Users can only access expenses that belong to groups they created.
-- This ensures complete expense data isolation between users.
-- ----------------------------------------------------------------------------

-- Allow users to view expenses for their groups
-- Uses a subquery to check if the expense's group belongs to the current user
CREATE POLICY "Users can view expenses for their groups" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Allow users to create expenses for their groups
-- Ensures both the expense creator and group owner are the current user
CREATE POLICY "Users can create expenses for their groups" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Allow users to update expenses they created in their groups
CREATE POLICY "Users can update expenses they created" ON expenses
  FOR UPDATE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Allow users to delete expenses they created in their groups
CREATE POLICY "Users can delete expenses they created" ON expenses
  FOR DELETE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- ============================================================================
-- AUTOMATIC USER PROFILE CREATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USER SIGNUP FUNCTION
-- ----------------------------------------------------------------------------
-- This function automatically creates a user profile in the profiles table
-- whenever a new user signs up through Supabase Auth. It extracts the email
-- and username from the signup data and creates a corresponding profile record.
-- 
-- Trigger Context:
-- - NEW: The new user record from auth.users table
-- - raw_user_meta_data: Contains additional signup data (like username)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert a new profile record for the newly created auth user
  -- Extract email from the auth user record and username from metadata
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,                                        -- User ID from auth.users
    new.email,                                     -- Email from auth.users
    new.raw_user_meta_data->>'username'           -- Username from signup form
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- USER SIGNUP TRIGGER
-- ----------------------------------------------------------------------------
-- This trigger automatically executes the handle_new_user() function
-- whenever a new user is inserted into the auth.users table (user signup).
-- 
-- Timing: AFTER INSERT - Runs after the user is successfully created
-- Scope: FOR EACH ROW - Runs once per new user
-- ----------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
-- 
-- Tables Created:
-- ✓ profiles - User profile data with automatic creation
-- ✓ groups - User-owned expense groups  
-- ✓ expenses - Individual expenses within groups
-- 
-- Security Features:
-- ✓ Row Level Security enabled on all tables
-- ✓ Comprehensive policies for data isolation
-- ✓ Users can only access their own data
-- ✓ Automatic profile creation on signup
-- 
-- Relationships:
-- ✓ auth.users -> profiles (1:1)
-- ✓ profiles -> groups (1:many)
-- ✓ groups -> expenses (1:many)
-- ✓ profiles -> expenses (1:many)
-- 
-- This schema provides a secure, scalable foundation for the Group Expense
-- Tracker application with complete user data isolation and automatic
-- profile management.
-- ============================================================================ 