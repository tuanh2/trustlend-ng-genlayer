export interface P2POrder {
  order_id: string;
  seller: string;
  buyer: string;
  crypto_amount: string; // GEN locked
  fiat_amount: number;
  fiat_currency: string;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  ref_code: string;
  status: 'LISTED' | 'PENDING_BUYER_PROOF' | 'VERIFYING_AI' | 'COMPLETED' | 'DISPUTED_FRAUD' | 'CANCELLED';
  buyer_deposit: string;
  proof_url: string;
  ai_verdict: 'MATCHED' | 'FRAUD' | 'MISMATCH' | 'PENDING';
  ai_reason: string;
}

export interface MerchantProfile {
  name: string;
  total_trades: number;
  successful_releases: number;
  reputation_score: number;
}
