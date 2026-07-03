import { useState, useEffect, useCallback } from "react";
import { requestAccess } from "@stellar/freighter-api";
import { fetchBalance } from "../services/stellar";

export function useStellarWallet() {
  const [pubKey, setPubKey] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const connect = async () => {
    try {
      setError("");
      const accessResponse = await requestAccess();
      if (accessResponse.error) {
        setError(accessResponse.error);
        return;
      }
      if (accessResponse.address) setPubKey(accessResponse.address);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Freighter connection failed. Is the extension installed?");
    }
  };

  const refreshBalance = useCallback(async () => {
    if (!pubKey) return;
    try {
      const bal = await fetchBalance(pubKey);
      setBalance(bal);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  }, [pubKey]);

  useEffect(() => {
    const syncBalance = async () => {
      if (pubKey) {
        await refreshBalance();
      }
    };

    syncBalance();
  }, [pubKey, refreshBalance]);

  return { pubKey, balance, error, setError, connect, refreshBalance };
}
