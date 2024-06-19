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
    tokenA,
    tokenB
}: ConstructorParameters<typeof QuoteMaker>[0] & {
    tokenA?: string,
    tokenB?: string
}) {
    const xykMaker = new QuoteMaker({
        wallet,
        apiUrl,
        feedUrl,
        takerUrl,
        vaultContract,
        spreadPercentage,
        apiKey,
        defaultChainId,
        quoter: xykQuoterFactory(vaultContract || wallet.address, defaultChainId, tokenA, tokenB)
    });

    return xykMaker;
}