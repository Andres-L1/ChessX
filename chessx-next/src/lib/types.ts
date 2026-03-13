export interface Lock {
  id: string;
  token: string;
  title: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: 'locked' | 'paid';
  created_at: string;
  updated_at: string;
  paid_at?: string;
  client_email: string | null;
  file: {
    type: 'upload';
    path: string;
    original_name: string;
    mime: string;
    size: number;
  } | {
    type: 'link';
    url: string;
  };
  stripe: {
    session_id?: string;
    payment_intent?: string;
    customer_email?: string | null;
  };
}
