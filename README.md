# TrustLend P2P — AI-Automated Fiat-to-Crypto Escrow Exchange

**TrustLend P2P** is a decentralized peer-to-peer (P2P) Fiat-to-Crypto escrow exchange platform powered by **GenLayer Intelligent Contracts**. It replaces manual trader verification with **on-chain AI consensus** that automatically inspects bank transfer receipts and verification URLs to instantly release escrowed Crypto (GEN) to buyers while enforcing a **10% Buyer Security Bond** against fraudulent claims.

---

## 1. Problem & Solution

### The Problem
Traditional P2P fiat-to-crypto exchanges (e.g., Binance P2P, Remitano) force buyers to wait minutes or hours for sellers to manually check their bank apps and release crypto. Conversely, sellers risk fraudulent claims or photoshopped receipts that lock up liquidity during manual dispute processing.

### The Solution
TrustLend P2P automates escrow releases with **GenLayer AI Subjective Consensus**:
1. **Merchant Escrow Listing**: Merchants lock GEN Crypto into the Intelligent Contract escrow with required fiat payment details and a unique transfer reference code (e.g., `TLENG-88F3A`).
2. **Buyer 10% Security Deposit**: Buyers initiate trade by locking a **10% Security Bond** into escrow to deter fake/photoshopped claims.
3. **Automated AI Receipt Verification**: Buyers upload their bank transfer receipt URL. GenLayer AI validators render the receipt content on-chain (`gl.nondet.web.render`) and verify amount, account number, and memo reference matching.
4. **Instant Auto-Release & Anti-Fraud Slashing**:
   - **`MATCHED`**: Contract automatically releases the escrowed Crypto + refunds the 10% security deposit to the Buyer immediately!
   - **`FRAUD`**: Contract **slashes 100% of the Buyer's 10% Security Deposit** and transfers it to the Seller as compensation for fraudulent claims!

---

## 2. Why GenLayer?

Traditional EVM smart contracts cannot inspect external bank receipt URLs, parse unstructured web text, or make qualitative judgements without relying on centralized oracles.

GenLayer enables **Intelligent Contracts** running Python at the consensus layer:
- **Oracle-Free Web Rendering**: Direct on-chain web parsing (`gl.nondet.web.render`).
- **Optimistic Democracy Consensus**: Multiple LLM validator nodes evaluate bank receipts and reach consensus on semantic transaction validity (`verdict`).
- **Automated Escrow Execution**: Instant, code-enforced crypto payouts upon AI consensus without human intervention.

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------+
|                            TrustLend P2P Frontend                                 |
|                    React + Vite + TypeScript + Tailwind CSS                       |
+-----------------------------------------+-----------------------------------------+
                                          | MetaMask (chain: studionet)
                                          v
+-----------------------------------------------------------------------------------+
|                           GenLayer Intelligent Contract                           |
|                              (contracts/trustlend.py)                             |
+-----------------------------------------+-----------------------------------------+
|             P2P Escrow Market           |           Merchant Escrow Hub           |
|  - Buyers browse active sell listings   |  - Merchants lock GEN into escrow       |
|  - Locks 10% Security Bond to buy       |  - Sets Bank Account & Ref Code         |
|  - Submits Bank Receipt URL for release |  - Manages active P2P sell listings     |
+-----------------------------------------+-----------------------------------------+
|                      Automated AI Bank Proof Consensus                            |
|  - LLM Validators parse receipt via gl.nondet.web.render                          |
|  - MATCHED: Instantly releases escrowed GEN to Buyer                              |
|  - FRAUD: Slashes 100% of Buyer Security Bond to Seller                           |
+-----------------------------------------------------------------------------------+
```

---

## 4. Deployed Contract & Live Application

- **Live Application URL**: [https://trustlend-ng-genlayer.vercel.app](https://trustlend-ng-genlayer.vercel.app)
- **Deployed Contract Address (`studionet`)**: `0x081aB66Cb915f9400Ac00B6b0Ce9aD8aa55dbC25`
- **GenLayer Explorer**: [https://genlayer-explorer.vercel.app/address/0x081aB66Cb915f9400Ac00B6b0Ce9aD8aa55dbC25](https://genlayer-explorer.vercel.app/address/0x081aB66Cb915f9400Ac00B6b0Ce9aD8aa55dbC25)

---

## 5. Local Setup & Build

```bash
# 1. Navigate into frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure .env file
# VITE_CONTRACT_ADDRESS=0x081aB66Cb915f9400Ac00B6b0Ce9aD8aa55dbC25

# 4. Start local development server
npm run dev

# 5. Production build
npm run build
```

---

## 6. Running Automated Tests

Tests are written using `genlayer-test` (`gltest`).

```bash
# Run pytest suite
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
