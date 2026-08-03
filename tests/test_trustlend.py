from genlayer import *
from genlayer.testing import *
import pytest

@pytest.fixture
def deploy_contract():
    return sim_deploy("contracts/trustlend.py")

def test_p2p_escrow_flow(deploy_contract):
    seller = sim_account(1)
    buyer = sim_account(2)

    # 1. Merchant creates sell order of 100 GEN for 2,500,000 VND
    order_id = sim_transact(
        deploy_contract,
        "create_sell_order",
        [2500000, "VND", "Vietcombank", "9988776655", "TRINTHI NGAN", "TLENG-88F3A"],
        from_account=seller,
        value=u256(100)
    )
    assert order_id == "1"

    # 2. Buyer initiates buy order with 10% security bond (10 GEN)
    sim_transact(
        deploy_contract,
        "initiate_buy_order",
        [order_id],
        from_account=buyer,
        value=u256(10)
    )

    # Mock AI consensus response for valid Vietcombank proof match
    sim_installMocks({
        "web.render": lambda url, mode: "Vietcombank E-Receipt TX 987654321. Amount: 2,500,000 VND. Target: 9988776655 TRINTHI NGAN. Memo: TLENG-88F3A. Status: SUCCESS",
        "exec_prompt": lambda prompt, response_format: {
            "verdict": "MATCHED",
            "confidence": 99,
            "reason": "Bank transfer receipt verified successfully matching amount 2,500,000 VND and memo TLENG-88F3A."
        }
    })

    # 3. Buyer submits receipt proof URL -> AI auto-releases escrow + refunds deposit!
    verdict = sim_transact(
        deploy_contract,
        "submit_payment_proof",
        [order_id, "https://vcb.com.vn/verify?tx=987654321"],
        from_account=buyer
    )
    assert verdict == "MATCHED"

    # 4. Verify order completed status
    order = sim_call(deploy_contract, "get_order", [order_id])
    assert order.status == "COMPLETED"
