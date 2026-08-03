import json
import pytest
from genlayer import *


def test_trustlend_full_flow(client, contract_factory):
    # Deploy contract
    creator = client.accounts[0]
    borrower = client.accounts[1]
    lender = client.accounts[2]

    contract = contract_factory.deploy(creator, [])

    # Lender deposits into liquidity pool first
    contract.connect(lender).deposit().transact(value=1000)

    # 1. Install mocks for Underwriting approval
    client.provider.make_request(
        method="sim_installMocks",
        params={
            "llm_mocks": {
                ".*": json.dumps({
                    "verdict": "APPROVE",
                    "risk_score": 3,
                    "max_loan_usd": 500,
                    "confidence": 88,
                    "reason": "Business revenue verified from Jumia screenshot with strong turnover proof"
                })
            },
            "web_mocks": {
                ".*": {"status": 200, "body": "Mock store data with monthly sales of $1500 USD."}
            }
        }
    )

    # 2. Borrower applies for loan
    loan_tx = contract.connect(borrower).apply_for_loan(
        args=["Shop Owner", "+234800000000", "https://jumia.com.ng/store", "https://evidence.org/bill.png", 200, 30]
    ).transact()

    loan_id = loan_tx.result
    assert loan_id == "1"

    # Check loan state
    loan_data = contract.get_loan(args=["1"]).call()
    assert loan_data["status"] == "ACTIVE"
    assert loan_data["ai_verdict"] == "APPROVE"

    # 3. Test Repayment
    # Interest for 200 at 5% = 10 -> total required = 210
    contract.connect(borrower).repay_loan(args=["1"]).transact(value=210)

    repaid_loan = contract.get_loan(args=["1"]).call()
    assert repaid_loan["status"] == "REPAID"

    # 4. Test Double Repayment -> expect UserError
    with pytest.raises(Exception) as exc_info:
        contract.connect(borrower).repay_loan(args=["1"]).transact(value=210)
    assert "Loan already repaid" in str(exc_info.value) or "UserError" in str(exc_info.value)


def test_unreachable_evidence_url(client, contract_factory):
    creator = client.accounts[0]
    borrower = client.accounts[1]
    contract = contract_factory.deploy(creator, [])

    # Empty URL -> should fail with UserError
    with pytest.raises(Exception) as exc_info:
        contract.connect(borrower).apply_for_loan(
            args=["Applicant", "+234800000000", "", "", 100, 14]
        ).transact()
    assert "Evidence URL unreachable" in str(exc_info.value) or "UserError" in str(exc_info.value)


def test_dispute_resolution(client, contract_factory):
    creator = client.accounts[0]
    borrower = client.accounts[1]
    lender = client.accounts[2]
    contract = contract_factory.deploy(creator, [])

    contract.connect(lender).deposit().transact(value=1000)

    # Approve loan
    client.provider.make_request(
        method="sim_installMocks",
        params={
            "llm_mocks": {
                ".*": json.dumps({
                    "verdict": "APPROVE",
                    "risk_score": 4,
                    "max_loan_usd": 400,
                    "confidence": 85,
                    "reason": "Verified store"
                })
            },
            "web_mocks": {
                ".*": {"status": 200, "body": "Mock store data"}
            }
        }
    )

    contract.connect(borrower).apply_for_loan(
        args=["Borrower B", "+234811111111", "https://shop.com", "https://evidence.org/doc.png", 150, 15]
    ).transact()

    # Install dispute mock for FORCE_MAJEURE
    client.provider.make_request(
        method="sim_installMocks",
        params={
            "llm_mocks": {
                ".*": json.dumps({
                    "verdict": "FORCE_MAJEURE",
                    "confidence": 92,
                    "reason": "Hospital admission certificate verified on official medical portal"
                })
            },
            "web_mocks": {
                ".*": {"status": 200, "body": "Hospital record verified"}
            }
        }
    )

    # File dispute
    dispute_tx = contract.connect(borrower).file_dispute(
        args=["1", "https://evidence.org/hospital.pdf", "Medical emergency hospitalization"]
    ).transact()

    assert dispute_tx.result == "FORCE_MAJEURE"
    disputed_loan = contract.get_loan(args=["1"]).call()
    assert disputed_loan["status"] == "DISPUTED"
    assert disputed_loan["dispute_verdict"] == "FORCE_MAJEURE"
