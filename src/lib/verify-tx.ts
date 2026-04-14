import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";
import { SUPPORTED_CHAINS, TOKEN_CONTRACTS, ERC20_TRANSFER_ABI, type ChainKey } from "./payment-config";

export async function verifyPayment(params: {
  txHash: string;
  chain: ChainKey;
  token: "USDT" | "USDC";
  expectedAmount: number;
  receivingWallet: string;
}): Promise<{ valid: boolean; error?: string }> {
  const { txHash, chain, token, expectedAmount, receivingWallet } = params;
  const chainConfig = SUPPORTED_CHAINS[chain];
  const tokenContract = TOKEN_CONTRACTS[token][chain];

  try {
    const client = createPublicClient({
      transport: http(chainConfig.rpc),
    });

    // 1. Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status === "reverted") {
      return { valid: false, error: "Transaction failed or not found" };
    }

    // 2. Check confirmations (at least 3)
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);
    if (confirmations < 3) {
      return { valid: false, error: `Only ${confirmations} confirmations. Need at least 3.` };
    }

    // 3. Parse Transfer events from the receipt
    const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
    const logs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === tokenContract.toLowerCase()
    );

    // 4. Find the Transfer to our wallet
    let foundTransfer = false;
    let transferredAmount = 0;

    for (const log of logs) {
      try {
        // Topic 0 = Transfer event signature
        // Topic 1 = from
        // Topic 2 = to
        if (log.topics.length >= 3) {
          const to = "0x" + log.topics[2]!.slice(26);
          if (to.toLowerCase() === receivingWallet.toLowerCase()) {
            foundTransfer = true;
            // USDT/USDC have 6 decimals
            const rawValue = BigInt(log.data);
            transferredAmount = Number(formatUnits(rawValue, 6));
            break;
          }
        }
      } catch {
        continue;
      }
    }

    if (!foundTransfer) {
      return { valid: false, error: "No transfer to receiving wallet found in this transaction" };
    }

    // 5. Check amount (1% tolerance for rounding)
    const tolerance = expectedAmount * 0.01;
    if (transferredAmount < expectedAmount - tolerance) {
      return {
        valid: false,
        error: `Amount too low: received $${transferredAmount.toFixed(2)}, expected $${expectedAmount.toFixed(2)}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}
