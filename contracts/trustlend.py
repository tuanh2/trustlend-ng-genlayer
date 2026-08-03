# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass


@allow_storage
@dataclass
class P2POrder:
    seller: str
    buyer: str
    crypto_amount: bigint  # Locked GEN crypto in wei
    fiat_amount: u256      # Fiat required e.g., 2500000 VND or 50 USD
    fiat_currency: str     # VND, NGN, USD, EUR
    bank_name: str         # Vietcombank, Techcombank, Moniepoint, etc.
    bank_account: str      # Account Number
    account_holder: str    # Account Owner Name
    ref_code: str          # Unique memo required e.g. TLENG-88F3A
    status: str            # LISTED | PENDING_BUYER_PROOF | VERIFYING_AI | COMPLETED | DISPUTED_FRAUD | CANCELLED
    buyer_deposit: bigint  # 10% Security deposit locked by buyer
    proof_url: str         # Bank receipt / verification URL submitted by buyer
    ai_verdict: str        # MATCHED | FRAUD | MISMATCH | PENDING
    ai_reason: str         # AI verification reasoning output


@allow_storage
@dataclass
class MerchantProfile:
    name: str
    total_trades: u256
    successful_releases: u256
    reputation_score: u256


def _addr_str(addr: Address) -> str:
    try:
        return addr.as_hex
    except Exception:
        return str(addr)


class Contract(gl.Contract):
    orders: TreeMap[str, P2POrder]
    merchants: TreeMap[str, MerchantProfile]
    order_counter: u256
    security_bond_pct: u256  # 10% = 1000 basis points

    def __init__(self):
        self.order_counter = u256(0)
        self.security_bond_pct = u256(1000)  # 10.00%

    @gl.public.write.payable
    def create_sell_order(
        self,
        fiat_amount: int,
        fiat_currency: str,
        bank_name: str,
        bank_account: str,
        account_holder: str,
        ref_code: str,
    ) -> str:
        if gl.message.value <= 0:
            raise UserError("Must lock crypto amount in escrow")
        if fiat_amount <= 0:
            raise UserError("Invalid fiat amount")
        if bank_account == "" or ref_code == "":
            raise UserError("Invalid bank account or memo reference code")

        sender_str = _addr_str(gl.message.sender)
        self.order_counter = u256(int(self.order_counter) + 1)
        order_id = str(self.order_counter)

        new_order = P2POrder(
            seller=sender_str,
            buyer="",
            crypto_amount=gl.message.value,
            fiat_amount=u256(fiat_amount),
            fiat_currency=fiat_currency.upper(),
            bank_name=bank_name,
            bank_account=bank_account,
            account_holder=account_holder,
            ref_code=ref_code.upper(),
            status="LISTED",
            buyer_deposit=bigint(0),
            proof_url="",
            ai_verdict="PENDING",
            ai_reason="",
        )
        self.orders[order_id] = new_order

        if sender_str not in self.merchants:
            self.merchants[sender_str] = MerchantProfile(
                name=account_holder,
                total_trades=u256(0),
                successful_releases=u256(0),
                reputation_score=u256(100),
            )

        return order_id

    @gl.public.write.payable
    def initiate_buy_order(self, order_id: str) -> None:
        if order_id not in self.orders:
            raise UserError("Order not found")

        order = self.orders[order_id]
        if order.status != "LISTED":
            raise UserError("Order not available for buying")

        sender_str = _addr_str(gl.message.sender)
        if sender_str == order.seller:
            raise UserError("Seller cannot buy own order")

        # 10% Security Deposit requirement calculation
        required_bond = (order.crypto_amount * bigint(self.security_bond_pct)) // bigint(10000)
        if gl.message.value < required_bond:
            raise UserError("Insufficient 10% security bond deposit")

        order.buyer = sender_str
        order.buyer_deposit = gl.message.value
        order.status = "PENDING_BUYER_PROOF"
        self.orders[order_id] = order

    @gl.public.write
    def submit_payment_proof(self, order_id: str, proof_url: str) -> str:
        if order_id not in self.orders:
            raise UserError("Order not found")

        order = self.orders[order_id]
        sender_str = _addr_str(gl.message.sender)

        if sender_str != order.buyer:
            raise UserError("Only initiating buyer can submit payment proof")

        if order.status != "PENDING_BUYER_PROOF":
            raise UserError("Order not in pending payment proof state")

        if proof_url == "":
            raise UserError("Proof URL cannot be empty")

        order.proof_url = proof_url
        order.status = "VERIFYING_AI"

        # GenLayer Subjective AI Consensus for Bank Receipt Verification
        def leader_fn():
            try:
                receipt_text = gl.nondet.web.render(proof_url, mode="text")
            except Exception:
                receipt_text = "[UNREACHABLE]"

            if receipt_text == "" or "[UNREACHABLE]" in receipt_text:
                return {
                    "verdict": "FRAUD",
                    "confidence": 95,
                    "reason": "Bank receipt URL unreachable or empty content. Flagged as fraudulent proof.",
                }

            prompt = f"""Verify P2P Bank Transfer Receipt for Crypto Escrow Release.
Required Fiat Amount: {order.fiat_amount} {order.fiat_currency}
Target Bank Account: {order.bank_account} ({order.bank_name})
Account Holder Name: {order.account_holder}
Required Memo Reference Code: {order.ref_code}

Bank Receipt Web Page Content:
{receipt_text}

Analyze if the bank transfer receipt proves a successful payment matching ALL parameters.
Detect any potential tampering, missing memo code, mismatched amount, or fraudulent claims.

Return STRICT JSON:
{{"verdict": "MATCHED"|"FRAUD"|"MISMATCH", "confidence": 0-100, "reason": "Detailed AI audit explanation"}}"""

            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return) or not isinstance(leader_res.calldata, dict):
                return False
            mine = leader_fn()
            if not isinstance(mine, dict):
                return False
            return mine.get("verdict") == leader_res.calldata.get("verdict")

        eval_res = gl.vm.run_nondet(leader_fn, validator_fn)

        if not isinstance(eval_res, dict):
            raise UserError("AI verification consensus failed")

        verdict = str(eval_res.get("verdict", "MISMATCH"))
        reason = str(eval_res.get("reason", "AI verification completed"))

        order.ai_verdict = verdict
        order.ai_reason = reason

        if verdict == "MATCHED":
            # SUCCESSFUL AI VERIFICATION:
            # 1. Transfer locked crypto + return 10% security deposit to Buyer!
            total_buyer_payout = order.crypto_amount + order.buyer_deposit
            order.status = "COMPLETED"
            self.orders[order_id] = order

            # Update merchant stats
            if order.seller in self.merchants:
                m_prof = self.merchants[order.seller]
                m_prof.total_trades += u256(1)
                m_prof.successful_releases += u256(1)
                self.merchants[order.seller] = m_prof

            # Instant automated escrow release to buyer
            gl.get_contract_at(Address(order.buyer)).emit_transfer(value=u256(total_buyer_payout))

        elif verdict == "FRAUD":
            # FRAUDULENT / FAKE PROOF DETECTED:
            # 1. Slash 100% of Buyer's Security Deposit and pay it to Seller as compensation!
            # 2. Return original locked crypto to Seller!
            total_seller_payout = order.crypto_amount + order.buyer_deposit
            order.status = "DISPUTED_FRAUD"
            self.orders[order_id] = order

            # Penalty slash to seller
            gl.get_contract_at(Address(order.seller)).emit_transfer(value=u256(total_seller_payout))

        else: # MISMATCH
            order.status = "PENDING_BUYER_PROOF"
            self.orders[order_id] = order

        return verdict

    @gl.public.write
    def cancel_sell_order(self, order_id: str) -> None:
        if order_id not in self.orders:
            raise UserError("Order not found")

        order = self.orders[order_id]
        sender_str = _addr_str(gl.message.sender)

        if sender_str != order.seller:
            raise UserError("Only seller can cancel order")

        if order.status != "LISTED":
            raise UserError("Cannot cancel order in active trade or completed state")

        order.status = "CANCELLED"
        self.orders[order_id] = order

        # Refund locked crypto to seller
        gl.get_contract_at(Address(order.seller)).emit_transfer(value=u256(order.crypto_amount))

    @gl.public.view
    def get_order(self, order_id: str) -> P2POrder:
        if order_id not in self.orders:
            raise UserError("Order not found")
        return self.orders[order_id]

    @gl.public.view
    def get_merchant_profile(self, addr_str: str) -> MerchantProfile:
        if addr_str in self.merchants:
            return self.merchants[addr_str]
        return MerchantProfile(
            name="Merchant",
            total_trades=u256(0),
            successful_releases=u256(0),
            reputation_score=u256(100),
        )

    @gl.public.view
    def get_market_info(self) -> dict:
        return {
            "total_orders": self.order_counter,
            "security_bond_pct": self.security_bond_pct,
        }
