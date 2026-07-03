import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");

export const fetchBalance = async (pubKey: string): Promise<string> => {
  try {
    const account = await horizonServer.loadAccount(pubKey);
    // filter blance arr to return native XLM
    const nativeBal = account.balances.find((a) => a.asset_type === "native");
    return nativeBal ? nativeBal.balance : "0.00000";
  } catch (err: any) {
    if (err.response?.status === 404) {
      throw new Error("Accountn not found.");
    }
    throw new Error("Failed to fetch balance.");
  }
};

export const executePayment = async(
  sourcePubKey: string,
  destPubKey: string,
  amt:string
): Promise<string>{
  const srcAccount=await horizonServer.loadAccount(sourcePubKey)
  const txn = new TransactionBuilder(srcAccount, {
    fee: BASE_FEE,
    networkPassphrase:Networks.TESTNET
  }).addOperation(
    Operation.payment({
            destination: destPubKey,
            asset: Asset.native(),
            amount: amt,        //sdk require amt to be string
          })
        )
        .setTimeout(30)
        .build();
  const rawTxXdr = txn.toXDR()
  const signResult = await signTransaction(rawTxXdr, { networkPassphrase: "TESTNET" });
  if (signResult.error) throw new Error(signResult.error);
  const signedTransaction = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET);
  const response = await horizonServer.submitTransaction(signedTransaction);
  return response.hash;
}
