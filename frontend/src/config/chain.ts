import { studionet } from 'genlayer-js/chains';

export const STUDIONET_CHAIN = studionet;
export const CHAIN_ID_HEX = "0x" + studionet.id.toString(16); // 0xF1EF (61999)

export const EXPLORER_URL = "https://genlayer-explorer.vercel.app";

export async function switchToStudioNet(): Promise<boolean> {
  if (!window.ethereum) {
    alert("MetaMask extension not found! Please install MetaMask to use TrustLend NG.");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
    return true;
  } catch (err: any) {
    if (err.code === 4902 || err.code === -32603) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: CHAIN_ID_HEX,
            chainName: "Genlayer Studio Network",
            nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
            rpcUrls: ["https://studio.genlayer.com/api"],
            blockExplorerUrls: [EXPLORER_URL],
          }],
        });
        return true;
      } catch (addErr) {
        console.error("Failed to add Studionet network to MetaMask:", addErr);
        return false;
      }
    } else {
      console.error("Failed to switch network:", err);
      return false;
    }
  }
}
