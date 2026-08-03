import { useState, useEffect, useCallback } from 'react';
import { createClient } from 'genlayer-js';
import { STUDIONET_CHAIN, switchToStudioNet } from '../config/chain';

export function useGenLayer() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [txPending, setTxPending] = useState<boolean>(false);
  const [txMessage, setTxMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';

  const getClient = useCallback(() => {
    if (!address) return null;
    return createClient({
      chain: STUDIONET_CHAIN,
      account: address as `0x${string}`,
    });
  }, [address]);

  const updateBalance = useCallback(async (userAddr: string) => {
    if (!window.ethereum || !userAddr) return;
    try {
      const hexBal = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [userAddr, 'latest'],
      });
      if (hexBal) {
        const wei = BigInt(hexBal);
        const gen = (Number(wei) / 1e18).toFixed(4);
        setBalance(gen);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }
    setIsConnecting(true);
    try {
      const switched = await switchToStudioNet();
      if (!switched) {
        setIsConnecting(false);
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts[0]) {
        const userAddr = accounts[0];
        setAddress(userAddr);
        setIsConnected(true);
        await updateBalance(userAddr);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  useEffect(() => {
    const eth = window.ethereum;
    if (eth) {
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts[0]) {
          setAddress(accounts[0]);
          setIsConnected(true);
          updateBalance(accounts[0]);
        }
      });

      const handleAccountsChanged = (accs: string[]) => {
        if (accs.length > 0) {
          setAddress(accs[0]);
          setIsConnected(true);
          updateBalance(accs[0]);
        } else {
          setAddress('');
          setIsConnected(false);
          setBalance('0');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);

      return () => {
        if (eth.removeListener) {
          eth.removeListener('accountsChanged', handleAccountsChanged);
          eth.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [updateBalance]);

  const readContract = useCallback(async (functionName: string, args: any[] = []) => {
    const client = getClient();
    if (!client || !contractAddress) return null;
    try {
      const data = await client.readContract({
        address: contractAddress as `0x${string}`,
        functionName,
        args,
      });
      return data;
    } catch (err) {
      console.error(`Read error on ${functionName}:`, err);
      return null;
    }
  }, [getClient, contractAddress]);

  const writeContract = useCallback(async (
    functionName: string,
    args: any[] = [],
    valueWei?: bigint,
    loadingText: string = 'Executing transaction...'
  ) => {
    const client = getClient();
    if (!client) {
      alert('Please connect your MetaMask wallet first!');
      return null;
    }
    if (!contractAddress) {
      alert('Contract address is not configured yet! Please deploy the contract to GenLayer Studio.');
      return null;
    }

    setTxPending(true);
    setTxMessage(loadingText);
    setTxHash('');

    try {
      const writeParams: any = {
        address: contractAddress as `0x${string}`,
        functionName,
        args,
      };
      if (valueWei !== undefined) {
        writeParams.value = valueWei;
      }

      const hash = await client.writeContract(writeParams);
      
      setTxHash(String(hash));
      setTxMessage('Waiting for AI validators consensus...');
      
      if (address) {
        setTimeout(() => updateBalance(address), 3000);
      }
      return hash;
    } catch (err: any) {
      console.error(`Write error on ${functionName}:`, err);
      alert(err.message || 'Transaction failed or was rejected');
      return null;
    } finally {
      setTxPending(false);
      setTxMessage('');
    }
  }, [getClient, contractAddress, address, updateBalance]);

  return {
    address,
    balance,
    isConnected,
    isConnecting,
    contractAddress,
    connectWallet,
    readContract,
    writeContract,
    txPending,
    txMessage,
    txHash,
  };
}
