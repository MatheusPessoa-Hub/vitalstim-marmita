-- The BRL PIX cash-in flow does not require payer name or document in XPag's current API contract.
-- Keep the columns for historical records, but allow new orders without collecting personal data.
ALTER TABLE public.pix_orders
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN document DROP NOT NULL;

-- Return conversations interrupted in the old name/CPF steps to the main menu.
UPDATE public.wa_conversations
SET state = 'menu', updated_at = now()
WHERE state IN ('pedir_nome', 'pedir_cpf');
