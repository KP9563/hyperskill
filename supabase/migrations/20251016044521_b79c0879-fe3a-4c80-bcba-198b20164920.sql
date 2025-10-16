-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('teacher', 'learner');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  qualification TEXT NOT NULL,
  work_experience TEXT,
  teaching_field TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  verification_documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create learners table
CREATE TABLE learners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create learning categories table
CREATE TABLE learning_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning fields table
CREATE TABLE learning_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES learning_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  teacher_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for teachers
CREATE POLICY "Teachers can view their own data"
  ON teachers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert their own data"
  ON teachers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can update their own data"
  ON teachers FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for learners
CREATE POLICY "Learners can view their own data"
  ON learners FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Learners can insert their own data"
  ON learners FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Learners can update their own data"
  ON learners FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for learning categories (public read)
CREATE POLICY "Anyone can view learning categories"
  ON learning_categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for learning fields (public read)
CREATE POLICY "Anyone can view learning fields"
  ON learning_fields FOR SELECT
  TO authenticated
  USING (true);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample learning categories
INSERT INTO learning_categories (name, description, icon) VALUES
  ('Technology', 'Programming, Web Development, AI & Machine Learning', 'Code'),
  ('Business', 'Marketing, Finance, Entrepreneurship', 'Briefcase'),
  ('Design', 'UI/UX, Graphic Design, Product Design', 'Palette'),
  ('Science', 'Physics, Chemistry, Biology', 'Atom'),
  ('Languages', 'English, Spanish, French, German', 'Languages'),
  ('Arts', 'Music, Painting, Photography', 'Music');

-- Insert sample learning fields for Technology
INSERT INTO learning_fields (category_id, name, description, teacher_count)
SELECT id, 'Web Development', 'Learn HTML, CSS, JavaScript, React', 45
FROM learning_categories WHERE name = 'Technology'
UNION ALL
SELECT id, 'Python Programming', 'Master Python for data science and automation', 38
FROM learning_categories WHERE name = 'Technology'
UNION ALL
SELECT id, 'Machine Learning', 'AI and ML fundamentals with practical projects', 22
FROM learning_categories WHERE name = 'Technology';

-- Insert sample learning fields for Business
INSERT INTO learning_fields (category_id, name, description, teacher_count)
SELECT id, 'Digital Marketing', 'SEO, Social Media, Content Marketing', 31
FROM learning_categories WHERE name = 'Business'
UNION ALL
SELECT id, 'Financial Planning', 'Personal finance and investment strategies', 18
FROM learning_categories WHERE name = 'Business';

-- Insert sample learning fields for Design
INSERT INTO learning_fields (category_id, name, description, teacher_count)
SELECT id, 'UI/UX Design', 'User interface and experience design principles', 27
FROM learning_categories WHERE name = 'Design'
UNION ALL
SELECT id, 'Graphic Design', 'Adobe Creative Suite mastery', 19
FROM learning_categories WHERE name = 'Design';