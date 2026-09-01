-- Reconcile token balance to 7.5 tokens for user with 1 site created
UPDATE public.profiles
SET token_balance = 7.5,
    updated_at = NOW()
WHERE id = 'efada3bb-e1d1-4f61-9da0-a6283f8d5f06'
  AND token_balance = 10;

-- Ensure profiles update policy allows authenticated users to update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RPC function to deduct tokens safely (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.deduct_tokens_for_generation(
  p_user_id UUID,
  p_tokens NUMERIC DEFAULT 2.5,
  p_site_name TEXT DEFAULT 'Novo Site'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_bal NUMERIC(10, 2);
  v_new_bal NUMERIC(10, 2);
BEGIN
  SELECT token_balance INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  v_new_bal := GREATEST(0, COALESCE(v_current_bal, 0) - p_tokens);

  UPDATE public.profiles
  SET token_balance = v_new_bal,
      updated_at = NOW()
  WHERE id = p_user_id;

  BEGIN
    INSERT INTO public.token_transactions (
      user_id,
      type,
      amount,
      balance_after,
      description
    ) VALUES (
      p_user_id,
      'generation',
      -p_tokens,
      v_new_bal,
      'Geração de site: ' || COALESCE(p_site_name, 'Novo Site')
    );
  EXCEPTION WHEN OTHERS THEN
  END;

  RETURN jsonb_build_object('success', true, 'token_balance', v_new_bal);
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_tokens_for_generation(UUID, NUMERIC, TEXT) TO authenticated, anon, service_role;
