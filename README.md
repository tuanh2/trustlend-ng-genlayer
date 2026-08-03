# TrustLend NG — AI-Driven P2P Microcredit for the Unbanked

**TrustLend NG** is a decentralized peer-to-peer (P2P) microcredit platform designed for unbanked micro-merchants in emerging markets (e.g., Nigeria). It leverages **GenLayer Intelligent Contracts** to perform on-chain credit underwriting directly from unstructured web proof (storefront links, turnover receipts, utility bill screenshots) and provides automated subjective dispute resolution.

---

## 1. Problem & Solution

### The Problem
Millions of micro-entrepreneurs across emerging markets lack formal bank accounts and traditional credit scores (e.g., CRC Credit Bureau in Nigeria). Despite generating steady daily cash flow on platforms like Jumia, Jiji, or Moniepoint, they remain locked out of basic financial credit ($50–$500 microloans).

### The Solution
TrustLend NG replaces rigid corporate credit scoring with **GenLayer AI Subjective Consensus**:
1. **Collateral-Free Credit Underwriting**: Merchants upload proof URLs (screenshots of sales, storefront links). GenLayer AI validators render web data on-chain (`gl.nondet.web.render`) and assess creditworthiness (`gl.nondet.exec_prompt`).
2. **Instant Disbursal**: If consensus approves the applicant, funds are disbursed directly from a decentralized lender pool.
3. **Automated Dispute Arbitration**: In cases of default, borrowers submit hardship proof (e.g., medical emergency certificates, disaster proofs). GenLayer AI validators evaluate whether default is **Force Majeure**, **Honest Liquidity Hardship**, or **Fraud**, applying fair extensions or reputation slashes accordingly.

---

## 2. Why GenLayer?

Traditional EVM smart contracts (Solidity/Vyper) cannot read unstructured web data or make subjective qualitative judgements without relying on centralized, vulnerable off-chain oracles.

GenLayer enables **Intelligent Contracts** running Python at the consensus layer:
- **No Oracles Required**: Direct on-chain web rendering (`gl.nondet.web.render`).
- **Optimistic Democracy Consensus**: Multiple LLM validator nodes process qualitative prompts and achieve consensus on **meaning** (`verdict`) rather than byte-for-byte exact text matching.
- **Soulbound Trust Reputation (SBT)**: Repayment history builds an on-chain credit score (0–100) and repayment streak.

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------+
|                            TrustLend NG Frontend                                  |
|                    React + Vite + TypeScript + Tailwind CSS                       |
+-----------------------------------------+-----------------------------------------+
                                          | MetaMask (chain: studionet)
                                          v
+-----------------------------------------------------------------------------------+
|                           GenLayer Intelligent Contract                           |
|                              (contracts/trustlend.py)                             |
+-----------------------------------------+-----------------------------------------+
|          Borrower Underwriting          |          Lender Liquidity Pool          |
|  - Reads evidence via gl.nondet.web     |  - Lenders deposit GEN for APY yield    |
|  - LLM Prompt: Credit evaluation        |  - Disburses loans upon AI approval     |
|  - Semantic validator: Verdict matching |  - Receives principal + interest repay  |
+-----------------------------------------+-----------------------------------------+
|                           Subjective Dispute Arbitration                          |
|  - Evaluates claim evidence (HONEST_DEFAULT vs FORCE_MAJEURE vs FRAUD)             |
|  - Applies automatic extensions or Soulbound Trust Score penalties                |
+-----------------------------------------------------------------------------------+
```

---

## 4. Contract Deployment (`studionet`)

- **Deployed Contract Address**: `0x19B292aa1501c957F4215cCa15bb6D4A16f75541`
- **GenLayer Explorer**: [https://genlayer-explorer.vercel.app/address/0x19B292aa1501c957F4215cCa15bb6D4A16f75541](https://genlayer-explorer.vercel.app/address/0x19B292aa1501c957F4215cCa15bb6D4A16f75541)

### Manual Deployment Procedure:
1. Open [GenLayer Studio — Run & Debug](https://studio.genlayer.com/run-debug).
2. Click **Settings** -> **Reset Storage** -> **Confirm**.
3. Perform a hard refresh on your browser (`Ctrl + Shift + R`).
4. Copy the complete content of [`contracts/trustlend.py`](file:///d:/genlayer%20project/contracts/trustlend.py) into the Studio editor.
5. Click **Deploy**.
6. Inspect the deployment transaction in the sidebar and verify that **`Result: SUCCESS`** is displayed.
7. Copy the deployed **Contract Address**.

---

## 5. Live Application & Setup

- **Live App URL**: `<TO_BE_FILLED_AFTER_VERCEL_DEPLOYMENT>`

### Local Setup:
```bash
# 1. Navigate into frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure .env file
# VITE_CONTRACT_ADDRESS=0x19B292aa1501c957F4215cCa15bb6D4A16f75541

# 4. Start local development server
npm run dev
```

### Production Build:
```bash
npm run build
```

---

## 6. Running Automated Tests

Tests are written using `genlayer-test` (`gltest`).

```bash
# Install genlayer-test
pip install genlayer-test

# Run tests targeting studionet
gltest --network studionet
```

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| **Intelligent Contract** | Python 3.11, GenLayer SDK (`from genlayer import *`), deployed on **studionet** |
| **Frontend Framework** | React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Chain Integration** | `genlayer-js` SDK (`createClient({ chain: studionet })`) |
| **Wallet Connection** | MetaMask (`wallet_switchEthereumChain` / Chain ID `61999` - `0xF1EF`) |
| **Contract Testing** | `genlayer-test` (`gltest`), Pytest, `sim_installMocks` |
