-- Deduct 2.5 tokens automatically on every site generation
CREATE OR REPLACE FUNCTION public.handle_site_creation_token_deduct()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_current_bal NUMERIC(10, 2);
BEGIN
  -- Get user email to skip admins
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;

  -- Super admin does not consume tokens
  IF LOWER(COALESCE(v_user_email, '')) = 'andre.jesus.rocha@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Get current balance
  SELECT token_balance INTO v_current_bal FROM public.profiles WHERE id = NEW.user_id;

  -- Deduct 2.5 tokens
  UPDATE public.profiles
  SET token_balance = GREATEST(0, COALESCE(token_balance, 0) - 2.5),
      updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Record transaction
  BEGIN
    INSERT INTO public.token_transactions (
      user_id,
      type,
      amount,
      balance_after,
      description
    ) VALUES (
      NEW.user_id,
      'generation',
      -2.5,
      GREATEST(0, COALESCE(v_current_bal, 0) - 2.5),
      'Geração de site: ' || COALESCE(NEW.name, 'Novo Site')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignore transaction log error so site creation never fails
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_site_created_deduct_tokens ON public.sites;

CREATE TRIGGER on_site_created_deduct_tokens
AFTER INSERT ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.handle_site_creation_token_deduct();
