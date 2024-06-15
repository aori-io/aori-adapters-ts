import { QuoteMaker } from "@aori-io/sdk";
import { xykQuoterFactory } from "../models/XYKQuoter";

export function XYKMaker({
    wallet,
    apiUrl,
    feedUrl,
    takerUrl,
    apiKey,
    vaultContract,
    spreadPercentage = 0n,
    defaultChainId,
    cancelAfter,
    tokenA,
    tokenB
}: Parameters<typeof QuoteMaker>[0] & {
    tokenA?: string,
    tokenB?: string
}) {
    const xykMaker = QuoteMaker({
        wallet,
        apiUrl,
        feedUrl,
        takerUrl,
        vaultContract,
        spreadPercentage,
        apiKey,
        defaultChainId,
        cancelAfter,
        quoter: xykQuoterFactory(vaultContract || wallet.address, defaultChainId, tokenA, tokenB)
    });

    return xykMaker;
}