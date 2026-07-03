"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStellarWallet } from "../hooks/useStellarWallet";
import { executePayment } from "../services/stellar";

const AnimatedDots = () => {
  return (
    <span className="inline-flex ml-1 w-6">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
};
export default function SplitBillCalculator() {
  const { pubKey, balance, error, setError, connect, refreshBalance } =
    useStellarWallet();

  const [totalBill, setTotalBill] = useState<string>("100");
  const [partySize, setPartySize] = useState<number>(3);
  const [friendAddress, setFriendAddress] = useState("");

  const [txState, setTxState] = useState<"idle" | "signing" | "success">(
    "idle",
  );
  const [txHash, setTxHash] = useState("");

  const splitAmount = useMemo(() => {
    const total = parseFloat(totalBill) || 0;
    if (partySize <= 1 || total <= 0) return "0.0000000";
    return (total / partySize).toFixed(7).replace(/\.?0+$/, "");
  }, [totalBill, partySize]);

  const handleSend = async () => {
    if (!friendAddress || parseFloat(splitAmount) <= 0) return;

    setTxState("signing");
    setTxHash("");
    setError("");

    try {
      const hash = await executePayment(pubKey, friendAddress, splitAmount);
      setTxHash(hash);
      setTxState("success");
      setFriendAddress("");
      await refreshBalance();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Raw Error:", err);

      // 1. Safely extract the error message whether it's a string or an object
      let parsedError = "Transaction failed.";
      if (typeof err === "string") {
        parsedError = err;
      } else if (err.message) {
        parsedError =
          typeof err.message === "string"
            ? err.message
            : JSON.stringify(err.message);
      } else {
        parsedError = JSON.stringify(err);
      }

      // 2. Intercept Freighter's specific cancellation message
      if (
        parsedError.toLowerCase().includes("declined") ||
        parsedError.toLowerCase().includes("rejected")
      ) {
        parsedError = "Signature cancelled by user.";
      }

      setError(parsedError);
      setTxState("idle");
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F4F0] p-4 md:p-8 flex items-center justify-center font-sans text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
        <header className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
              Split Calculator
            </h1>
            <p className="font-bold mt-2 text-lg sm:text-xl font-mono text-gray-600">
              On the Stellar network.
            </p>
          </div>

          <a
            href="https://github.com/dexterhere-2k/Stela"
            target="_blank"
            rel="noreferrer"
            className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all px-4 py-2 font-black uppercase tracking-wider text-sm flex-shrink-0"
          >
            GitHub ↗
          </a>
        </header>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-[#FF4911] text-white border-4 border-black font-black uppercase tracking-wide overflow-hidden"
            >
              ERR: {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!pubKey ? (
            <motion.button
              key="connect-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={connect}
              className="w-full bg-[#B8FF9F] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all duration-150 py-4 font-black text-2xl uppercase"
            >
              Connect Wallet
            </motion.button>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Wallet Info Banner */}
              <div className="p-4 bg-[#E2E8F0] border-4 border-black font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold uppercase tracking-wider text-sm">
                    Wallet
                  </span>
                  <span className="text-sm bg-black text-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(156,163,175,1)]">
                    {pubKey.slice(0, 4)}...{pubKey.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 border-t-2 border-black pt-2">
                  <span className="font-bold uppercase tracking-wider text-sm">
                    Balance
                  </span>
                  <span className="font-black text-xl">
                    {balance ? `${balance} XLM` : "SYNCING..."}
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-black mb-2 uppercase text-sm tracking-wider">
                      Total Bill (XLM)
                    </label>
                    <input
                      type="number"
                      value={totalBill}
                      onChange={(e) => setTotalBill(e.target.value)}
                      className="w-full border-4 border-black p-4 font-mono font-black text-xl focus:outline-none focus:bg-yellow-200 transition-colors placeholder-gray-400"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block font-black mb-2 uppercase text-sm tracking-wider">
                      People
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={partySize}
                      onChange={(e) =>
                        setPartySize(parseInt(e.target.value) || 2)
                      }
                      className="w-full border-4 border-black p-4 font-mono font-black text-xl focus:outline-none focus:bg-yellow-200 transition-colors"
                    />
                  </div>
                </div>

                {/* The Split Readout */}
                <div className="p-6 border-4 border-black bg-[#FF90E8] text-center shadow-inner">
                  <span className="block font-bold uppercase mb-2 tracking-widest text-sm">
                    Owed per person
                  </span>
                  <span className="text-5xl font-black font-mono">
                    {splitAmount}
                  </span>
                </div>

                <div>
                  <label className="block font-black mb-2 uppercase text-sm tracking-wider">
                    Friend's Address
                  </label>
                  <input
                    type="text"
                    placeholder="G..."
                    value={friendAddress}
                    onChange={(e) => setFriendAddress(e.target.value)}
                    className="w-full border-4 border-black p-4 font-mono font-bold focus:outline-none focus:bg-yellow-200 transition-colors placeholder-gray-400"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={txState === "signing"}
                  className="w-full bg-[#B8FF9F] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all duration-150 py-4 font-black text-2xl uppercase disabled:opacity-50 disabled:pointer-events-none"
                >
                  {txState === "signing" ? (
                    <span className="flex items-center justify-center">
                      Awaiting Signature <AnimatedDots />
                    </span>
                  ) : (
                    `Send ${splitAmount} XLM`
                  )}
                </button>
              </div>

              {/* The Printed Receipt Success State */}
              <AnimatePresence>
                {txState === "success" && txHash && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    className="relative mt-8 p-6 bg-white border-4 border-black text-left font-mono overflow-hidden"
                  >
                    <h3 className="font-black text-2xl uppercase border-b-4 border-black pb-2 mb-4">
                      Receipt
                    </h3>

                    <div className="space-y-3 text-sm font-bold uppercase">
                      <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-1">
                        <span>Amount Split</span>
                        <span>{splitAmount} XLM</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-1">
                        <span>Network</span>
                        <span>Stellar Testnet</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-1">
                        <span>Base Fee</span>
                        <span>100 Stroops</span>
                      </div>
                    </div>

                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-6 w-full py-4 bg-black text-white text-center font-black uppercase tracking-widest hover:bg-gray-800 transition-colors active:scale-95"
                    >
                      View Explorer ↗
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
