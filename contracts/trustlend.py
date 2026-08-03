# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass


@allow_storage
@dataclass
class Loan:
    borrower: str
    lender: str
    principal: bigint
    interest_rate: u256
    due_date: u256
    status: str  # PENDING | ACTIVE | REPAID | DEFAULTED | DISPUTED | REJECTED
    evidence_url: str
    ai_verdict: str  # APPROVE | REJECT
    ai_reason: str
    dispute_evidence: str
    dispute_verdict: str  # HONEST_DEFAULT | FRAUD | FORCE_MAJEURE | ""


@allow_storage
@dataclass
class BorrowerProfile:
    name: str
    phone: str
    shop_url: str
    evidence_urls: DynArray[str]
    total_borrowed: bigint
    total_repaid: bigint
    is_verified: bool


@allow_storage
@dataclass
class LenderProfile:
    name: str
    total_deposited: bigint
    total_lent: bigint
    total_earned: bigint


def _addr_str(addr: Address) -> str:
    try:
        return addr.as_hex
    except Exception:
        return str(addr)


class Contract(gl.Contract):
    loans: TreeMap[str, Loan]
    borrowers: TreeMap[str, BorrowerProfile]
    lenders: TreeMap[str, LenderProfile]
    loan_counter: u256
    trust_scores: TreeMap[str, u256]
    repayment_streak: TreeMap[str, u256]
    lender_deposits: TreeMap[str, bigint]
    total_pool: bigint
    min_loan: bigint
    max_loan: bigint
    base_interest_rate: u256

    def __init__(self):
        self.loan_counter = u256(0)
        self.total_pool = bigint(0)
        self.min_loan = bigint(10)
        self.max_loan = bigint(1000000000000000000000)  # Max loan bound in wei / GEN units
        self.base_interest_rate = u256(500)  # 500 basis points = 5%

    @gl.public.write
    def apply_for_loan(
        self,
        name: str,
        phone: str,
        shop_url: str,
        evidence_url: str,
        amount: int,
        duration_days: int,
    ) -> str:
        if amount <= 0:
            raise UserError("Invalid amount")
        if bigint(amount) < self.min_loan:
            raise UserError("Invalid amount")
        if evidence_url == "" or shop_url == "":
            raise UserError("Evidence URL unreachable")

        sender_str = _addr_str(gl.message.sender)

        # Update or register borrower profile
        if sender_str not in self.borrowers:
            empty_evidence = gl.storage.inmem_allocate(DynArray[str])
            profile = BorrowerProfile(
                name=name,
                phone=phone,
                shop_url=shop_url,
                evidence_urls=empty_evidence,
                total_borrowed=bigint(0),
                total_repaid=bigint(0),
                is_verified=True,
            )
            self.borrowers[sender_str] = profile
        
        # Add evidence URL to profile list
        curr_profile = self.borrowers[sender_str]
        curr_profile.evidence_urls.append(evidence_url)
        self.borrowers[sender_str] = curr_profile

        # Define non-deterministic closure for credit underwriting
        def leader_fn():
            try:
                web_data = gl.nondet.web.render(evidence_url, mode="text")
            except Exception:
                web_data = "[UNREACHABLE]"

            if web_data == "" or "[UNREACHABLE]" in web_data:
                return {
                    "verdict": "REJECT",
                    "risk_score": 10,
                    "max_loan_usd": 0,
                    "confidence": 0,
                    "reason": "Evidence URL unreachable or returned empty content",
                }

            prompt = f"""Evaluate microloan applicant from emerging market.
Shop / Business URL: {shop_url}
Evidence Document Content: {web_data}
Requested Loan Amount: ${amount}
Requested Duration: {duration_days} days

Analyze applicant revenue streams, turnover proof, business legitimacy, and default risk.
Return STRICT JSON format:
{{"verdict": "APPROVE"|"REJECT", "risk_score": 1-10, "max_loan_usd": int, "confidence": 0-100, "reason": "string reasoning"}}"""

            res = gl.nondet.exec_prompt(prompt, response_format="json")
            return res

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            leader = leader_res.calldata
            if not isinstance(leader, dict):
                return False

            mine = leader_fn()
            if not isinstance(mine, dict):
                return False

            # Semantic consensus check: compare verdict and risk_score within +-1
            if mine.get("verdict") != leader.get("verdict"):
                return False
            if abs(mine.get("risk_score", 0) - leader.get("risk_score", 0)) > 1:
                return False
            return True

        eval_res = gl.vm.run_nondet(leader_fn, validator_fn)

        if not isinstance(eval_res, dict):
            raise UserError("AI evaluation failed: invalid response format")

        reason = str(eval_res.get("reason", "AI evaluation completed"))
        confidence = int(eval_res.get("confidence", 0))
        verdict = str(eval_res.get("verdict", "REJECT"))
        max_allowed = int(eval_res.get("max_loan_usd", 0))

        if "Evidence URL unreachable" in reason:
            raise UserError("Evidence URL unreachable")

        if confidence < 60 and verdict == "APPROVE":
            verdict = "REJECT"
            reason = f"Escalated to review: AI confidence ({confidence}%) below minimum safety threshold (60%)"

        self.loan_counter = u256(int(self.loan_counter) + 1)
        loan_id = str(self.loan_counter)
        due_timestamp = u256(duration_days * 86400)

        if verdict == "APPROVE" and amount <= max_allowed and self.total_pool >= bigint(amount):
            self.total_pool -= bigint(amount)
            new_loan = Loan(
                borrower=sender_str,
                lender="POOL",
                principal=bigint(amount),
                interest_rate=self.base_interest_rate,
                due_date=due_timestamp,
                status="ACTIVE",
                evidence_url=evidence_url,
                ai_verdict="APPROVE",
                ai_reason=reason,
                dispute_evidence="",
                dispute_verdict="",
            )
            self.loans[loan_id] = new_loan

            # Update borrower profile borrowed amount
            b_prof = self.borrowers[sender_str]
            b_prof.total_borrowed += bigint(amount)
            self.borrowers[sender_str] = b_prof

            # Disburse funds to borrower
            gl.get_contract_at(gl.message.sender).emit_transfer(value=u256(amount))
        else:
            if verdict == "APPROVE" and self.total_pool < bigint(amount):
                reason = f"Approved by AI but rejected due to insufficient liquidity pool balance (Available: {self.total_pool})"

            rejected_loan = Loan(
                borrower=sender_str,
                lender="NONE",
                principal=bigint(amount),
                interest_rate=self.base_interest_rate,
                due_date=due_timestamp,
                status="REJECTED",
                evidence_url=evidence_url,
                ai_verdict="REJECT",
                ai_reason=reason,
                dispute_evidence="",
                dispute_verdict="",
            )
            self.loans[loan_id] = rejected_loan

        return loan_id

    @gl.public.write.payable
    def repay_loan(self, loan_id: str) -> None:
        if loan_id not in self.loans:
            raise UserError("Loan not found")

        loan = self.loans[loan_id]

        if loan.status == "REPAID":
            raise UserError("Loan already repaid")

        if loan.status not in ["ACTIVE", "DISPUTED"]:
            raise UserError("Loan not active or disputed")

        interest = (loan.principal * bigint(loan.interest_rate)) // bigint(10000)
        total_due = loan.principal + interest

        if gl.message.value < total_due:
            raise UserError("Invalid amount")

        # Accept payment into pool
        self.total_pool += gl.message.value

        loan.status = "REPAID"
        self.loans[loan_id] = loan

        # Update borrower stats
        borrower_str = loan.borrower
        curr_score = int(self.trust_scores.get(borrower_str, u256(50)))
        curr_streak = int(self.repayment_streak.get(borrower_str, u256(0)))

        self.repayment_streak[borrower_str] = u256(curr_streak + 1)
        self.trust_scores[borrower_str] = u256(min(100, curr_score + 5))

        if borrower_str in self.borrowers:
            b_prof = self.borrowers[borrower_str]
            b_prof.total_repaid += gl.message.value
            self.borrowers[borrower_str] = b_prof

    @gl.public.write
    def file_dispute(self, loan_id: str, evidence_url: str, reason: str) -> str:
        if loan_id not in self.loans:
            raise UserError("Loan not found")

        loan = self.loans[loan_id]
        sender_str = _addr_str(gl.message.sender)

        if sender_str != loan.borrower and sender_str != loan.lender and loan.lender != "POOL":
            raise UserError("Unauthorized to file dispute")

        if loan.status == "REPAID":
            raise UserError("Loan already repaid")

        if evidence_url == "":
            raise UserError("Evidence URL unreachable")

        loan.status = "DISPUTED"
        loan.dispute_evidence = evidence_url

        def leader_fn():
            try:
                ev_content = gl.nondet.web.render(evidence_url, mode="text")
            except Exception:
                ev_content = "[UNREACHABLE]"

            if ev_content == "" or "[UNREACHABLE]" in ev_content:
                return {
                    "verdict": "FRAUD",
                    "confidence": 90,
                    "reason": "Evidence URL unreachable or empty during dispute investigation",
                }

            prompt = f"""Arbitrate loan default dispute for TrustLend NG.
Loan ID: {loan_id}
Principal: ${loan.principal}
Claim statement: {reason}
Evidence text content: {ev_content}

Determine whether default is caused by:
- HONEST_DEFAULT: Borrower facing temporary liquidity hardship, intends to repay.
- FRAUD: Intentional default, deceptive claims, or fake evidence.
- FORCE_MAJEURE: Sickness, accident, emergency, or natural disaster with proof.

Return STRICT JSON:
{{"verdict": "HONEST_DEFAULT"|"FRAUD"|"FORCE_MAJEURE", "confidence": 0-100, "reason": "string reasoning"}}"""

            res = gl.nondet.exec_prompt(prompt, response_format="json")
            return res

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            leader = leader_res.calldata
            if not isinstance(leader, dict):
                return False

            mine = leader_fn()
            if not isinstance(mine, dict):
                return False

            return mine.get("verdict") == leader.get("verdict")

        disp_res = gl.vm.run_nondet(leader_fn, validator_fn)

        if not isinstance(disp_res, dict):
            raise UserError("AI dispute evaluation failed: invalid response format")

        verdict = str(disp_res.get("verdict", "HONEST_DEFAULT"))
        disp_reason = str(disp_res.get("reason", "Dispute resolved by AI validator consensus"))

        loan.dispute_verdict = verdict
        loan.ai_reason = disp_reason

        borrower_str = loan.borrower
        if verdict == "FRAUD":
            curr_score = int(self.trust_scores.get(borrower_str, u256(50)))
            self.trust_scores[borrower_str] = u256(max(0, curr_score - 25))
            self.repayment_streak[borrower_str] = u256(0)
        elif verdict == "FORCE_MAJEURE":
            # Extend due date by 30 days
            loan.due_date = u256(int(loan.due_date) + 30 * 86400)
        elif verdict == "HONEST_DEFAULT":
            # Grace extension by 15 days
            loan.due_date = u256(int(loan.due_date) + 15 * 86400)

        self.loans[loan_id] = loan
        return verdict

    @gl.public.write.payable
    def deposit(self) -> None:
        if gl.message.value <= 0:
            raise UserError("Invalid amount")

        sender_str = _addr_str(gl.message.sender)
        curr_dep = self.lender_deposits.get(sender_str, bigint(0))

        self.lender_deposits[sender_str] = curr_dep + gl.message.value
        self.total_pool += gl.message.value

        if sender_str not in self.lenders:
            l_prof = LenderProfile(
                name="Lender",
                total_deposited=gl.message.value,
                total_lent=bigint(0),
                total_earned=bigint(0),
            )
            self.lenders[sender_str] = l_prof
        else:
            l_prof = self.lenders[sender_str]
            l_prof.total_deposited += gl.message.value
            self.lenders[sender_str] = l_prof

    @gl.public.write
    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise UserError("Invalid amount")

        sender_str = _addr_str(gl.message.sender)
        curr_dep = self.lender_deposits.get(sender_str, bigint(0))

        if bigint(amount) > curr_dep:
            raise UserError("Insufficient deposit balance")

        if bigint(amount) > self.total_pool:
            raise UserError("Insufficient liquidity pool balance")

        self.lender_deposits[sender_str] = curr_dep - bigint(amount)
        self.total_pool -= bigint(amount)

        if sender_str in self.lenders:
            l_prof = self.lenders[sender_str]
            l_prof.total_deposited -= bigint(amount)
            self.lenders[sender_str] = l_prof

        gl.get_contract_at(gl.message.sender).emit_transfer(value=u256(amount))

    @gl.public.view
    def get_loan(self, loan_id: str) -> Loan:
        if loan_id not in self.loans:
            raise UserError("Loan not found")
        return self.loans[loan_id]

    @gl.public.view
    def get_borrower_profile(self, addr_str: str) -> BorrowerProfile:
        if addr_str in self.borrowers:
            return self.borrowers[addr_str]
        empty_evidence = gl.storage.inmem_allocate(DynArray[str])
        return BorrowerProfile(
            name="Unregistered",
            phone="",
            shop_url="",
            evidence_urls=empty_evidence,
            total_borrowed=bigint(0),
            total_repaid=bigint(0),
            is_verified=False,
        )

    @gl.public.view
    def get_lender_profile(self, addr_str: str) -> LenderProfile:
        if addr_str in self.lenders:
            return self.lenders[addr_str]
        return LenderProfile(
            name="Unregistered",
            total_deposited=bigint(0),
            total_lent=bigint(0),
            total_earned=bigint(0),
        )

    @gl.public.view
    def get_trust_score(self, addr_str: str) -> u256:
        return self.trust_scores.get(addr_str, u256(50))

    @gl.public.view
    def get_pool_info(self) -> dict:
        return {
            "total_pool": self.total_pool,
            "total_loans": self.loan_counter,
            "min_loan": self.min_loan,
            "max_loan": self.max_loan,
            "base_interest_rate": self.base_interest_rate,
        }
