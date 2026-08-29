-- Remove 50 tokens welcome bonus. New users start with 0 tokens.
ALTER TABLE public.profiles ALTER COLUMN token_balance SET DEFAULT 0;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, token_balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email, 0)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, 'user') 
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; 
$$;

-- Reset any users who are not admin and received the 50 token bonus
UPDATE public.profiles
SET token_balance = 0
WHERE email != 'andre.jesus.rocha@gmail.com' AND token_balance = 50;

DELETE FROM public.token_transactions
WHERE type = 'bonus' AND amount = 50;

-- Auto-confirm new users so they never need email confirmation
CREATE OR REPLACE FUNCTION public.auto_confirm_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

