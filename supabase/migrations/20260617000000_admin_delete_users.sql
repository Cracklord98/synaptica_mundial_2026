-- Add repo_url column to model_cards table
ALTER TABLE public.model_cards ADD COLUMN IF NOT EXISTS repo_url TEXT;

-- Create delete policy for admins on profiles table
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles FOR DELETE TO authenticated 
USING (public.is_admin());

-- Create a security definer function to delete from auth.users when a profile is deleted
CREATE OR REPLACE FUNCTION public.delete_user_auth()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to delete auth.user when a profile is deleted
CREATE OR REPLACE TRIGGER on_profile_deleted
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.delete_user_auth();
