# Manual Deployment Guide for TrustLend NG Contract (`studionet`)

Follow these exact steps to deploy the `TrustLend NG` Intelligent Contract on **GenLayer Studio** (`studionet`).

---

## Step 1: Access GenLayer Studio
1. Open your browser and navigate to: [GenLayer Studio Run & Debug](https://studio.genlayer.com/run-debug).
2. Ensure you are connected to **studionet**.

## Step 2: Reset Storage (Recommended Clean State)
1. Go to **Settings** in the Studio sidebar.
2. Click **Reset Storage**.
3. Confirm the reset dialog.
4. Perform a hard refresh on your browser (`Ctrl + Shift + R` or `Cmd + Shift + R`).

## Step 3: Copy Contract Code
1. Open `contracts/trustlend.py` in your local project.
2. Copy the entire file content, including the header pragma:
   ```python
   # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
   from genlayer import *
   ```
3. Paste it into the GenLayer Studio editor.

## Step 4: Deploy Contract
1. Click the **Deploy** button.
2. Wait for transaction processing in the Studio sidebar.
3. **CRITICAL CHECK**: Click on the deployment transaction item in the sidebar.
   - Verify that **`Result: SUCCESS`** is displayed (do NOT rely solely on `Status: FINALIZED`).
4. Copy the deployed **Contract Address** (format: `0x...`).

## Step 5: Inject Address into Frontend
1. Open `frontend/.env` (or create it from `frontend/.env.example`).
2. Paste your deployed contract address:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
   ```
3. Save the file and restart the Vite development server (`npm run dev`).
