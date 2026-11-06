CREATE TABLE public.whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  attempts int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX whatsapp_webhook_events_pending ON public.whatsapp_webhook_events (next_attempt_at) WHERE processed_at IS NULL;

CREATE TABLE public.wa_conversations (
  phone text PRIMARY KEY,
  state text NOT NULL DEFAULT 'menu',
  customer_name text,
  document text,
  current_order_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wa_conversations TO service_role;
ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wa_inbound_messages (
  wa_message_id text PRIMARY KEY,
  phone text NOT NULL,
  message_type text NOT NULL,
  body text,
  media_id text,
  provider_timestamp timestamptz,
  reply_status text NOT NULL DEFAULT 'pending',
  reply_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wa_inbound_messages TO service_role;
ALTER TABLE public.wa_inbound_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wa_outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  reply_to text,
  kind text NOT NULL,
  wa_message_id text UNIQUE,
  status text NOT NULL DEFAULT 'accepted',
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wa_outbound_messages TO service_role;
ALTER TABLE public.wa_outbound_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wa_message_statuses (
  wa_message_id text NOT NULL,
  status text NOT NULL,
  provider_timestamp timestamptz,
  recipient_id text,
  errors jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (wa_message_id, status)
);
GRANT ALL ON public.wa_message_statuses TO service_role;
ALTER TABLE public.wa_message_statuses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pix_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  customer_name text NOT NULL,
  document text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'creating',
  xpag_transaction_id text,
  copy_paste text,
  qr_img text,
  e2e text,
  paid_at timestamptz,
  link_sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pix_orders TO service_role;
ALTER TABLE public.pix_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX pix_orders_phone ON public.pix_orders (phone, created_at DESC);

CREATE TABLE public.xpag_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text
);
GRANT ALL ON public.xpag_webhook_events TO service_role;
ALTER TABLE public.xpag_webhook_events ENABLE ROW LEVEL SECURITY;

-- Apply stored status callbacks to the outbound row (both arrival orders; never regress).
CREATE OR REPLACE FUNCTION public.wa_apply_statuses(_wa_message_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.wa_outbound_messages o SET
    sent_at = COALESCE(o.sent_at, (SELECT provider_timestamp FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id AND s.status = 'sent')),
    delivered_at = COALESCE(o.delivered_at, (SELECT provider_timestamp FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id AND s.status = 'delivered')),
    read_at = COALESCE(o.read_at, (SELECT provider_timestamp FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id AND s.status = 'read')),
    failed_at = COALESCE(o.failed_at, (SELECT provider_timestamp FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id AND s.status = 'failed')),
    error = COALESCE((SELECT errors::text FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id AND s.status = 'failed'), o.error),
    status = (
      SELECT x.st FROM (VALUES ('accepted',0),('sent',1),('delivered',2),('read',3),('failed',4)) AS x(st, rk)
      WHERE x.st = o.status OR x.st IN (SELECT s.status FROM public.wa_message_statuses s WHERE s.wa_message_id = o.wa_message_id)
      ORDER BY x.rk DESC LIMIT 1
    )
  WHERE o.wa_message_id = _wa_message_id;
$$;
REVOKE ALL ON FUNCTION public.wa_apply_statuses(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wa_apply_statuses(text) TO service_role;