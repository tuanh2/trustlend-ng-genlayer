export interface Loan {
  id: string;
  borrower: string;
  lender: string;
  principal: string;
  interest_rate: number;
  due_date: number;
  status: 'PENDING' | 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'DISPUTED' | 'REJECTED';
  evidence_url: string;
  ai_verdict: 'APPROVE' | 'REJECT' | '';
  ai_reason: string;
  dispute_evidence: string;
  dispute_verdict: 'HONEST_DEFAULT' | 'FRAUD' | 'FORCE_MAJEURE' | '';
}

export interface BorrowerProfile {
  name: string;
  phone: string;
  shop_url: string;
  evidence_urls: string[];
  total_borrowed: string;
  total_repaid: string;
  is_verified: boolean;
}

export interface LenderProfile {
  name: string;
  total_deposited: string;
  total_lent: string;
  total_earned: string;
}

export interface PoolInfo {
  total_pool: string;
  total_loans: number;
  min_loan: string;
  max_loan: string;
  base_interest_rate: number;
}
