-- Function to safely and idempotently credit purchased tokens
CREATE OR REPLACE FUNCTION public.credit_tokens_for_payment(
  p_payment_id text,
  p_user_id uuid,
  p_tokens numeric,
  p_pkg_slug text DEFAULT 'starter'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_already_credited boolean;
  v_current_balance numeric;
  v_new_balance numeric;
  v_desc text;
BEGIN
  -- 1. Check idempotency (prevent double credit)
  SELECT EXISTS (
    SELECT 1 FROM public.token_transactions
    WHERE user_id = p_user_id
      AND description ILIKE '%' || p_payment_id || '%'
  ) INTO v_already_credited;

  IF v_already_credited THEN
    SELECT token_balance INTO v_current_balance FROM public.profiles WHERE id = p_user_id;
    RETURN jsonb_build_object(
      'success', true,
      'already_credited', true,
      'token_balance', COALESCE(v_current_balance, 0)
    );
  END IF;

  -- 2. Fetch or initialize profile
  SELECT token_balance INTO v_current_balance FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, token_balance)
    VALUES (p_user_id, p_tokens)
    RETURNING token_balance INTO v_new_balance;
  ELSE
    v_new_balance := COALESCE(v_current_balance, 0) + p_tokens;
    UPDATE public.profiles
    SET token_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  -- 3. Record transaction
  v_desc := 'Compra de tokens via Mercado Pago Pix (' || p_tokens || ' tokens - Ref: ' || p_payment_id || ')';
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description
  ) VALUES (
    p_user_id,
    'purchase',
    p_tokens,
    v_new_balance,
    v_desc
  );

  -- 4. Create in-app notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    kind,
    is_read
  ) VALUES (
    p_user_id,
    'Tokens Creditados com Sucesso! 🎉',
    'Seu pagamento via Pix de R$ 49,90 foi confirmado e ' || p_tokens || ' tokens foram adicionados ao seu saldo. Saldo atual: ' || v_new_balance || ' tokens.',
    'token_purchase',
    false
  );

  RETURN jsonb_build_object(
    'success', true,
    'already_credited', false,
    'tokens_added', p_tokens,
    'token_balance', v_new_balance
  );
END;
$func$;

GRANT EXECUTE ON FUNCTION public.credit_tokens_for_payment(text, uuid, numeric, text) TO anon, authenticated;

-- Immediately credit the approved payment made by customer efada3bb-e1d1-4f61-9da0-a6283f8d5f06
SELECT public.credit_tokens_for_payment(
  '176322572050',
  'efada3bb-e1d1-4f61-9da0-a6283f8d5f06'::uuid,
  10,
  'starter'
);
