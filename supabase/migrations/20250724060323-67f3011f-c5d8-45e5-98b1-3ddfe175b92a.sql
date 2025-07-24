-- Add avatar_color column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_color TEXT DEFAULT '#3B82F6';

-- Create array of nice colors for avatars
CREATE OR REPLACE FUNCTION public.get_random_avatar_color()
RETURNS TEXT AS $$
DECLARE
  colors TEXT[] := ARRAY[
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
    '#8B5A2B', '#059669', '#7C3AED', '#DB2777'
  ];
BEGIN
  RETURN colors[floor(random() * array_length(colors, 1) + 1)];
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to assign random colors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_color)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', get_random_avatar_color());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;