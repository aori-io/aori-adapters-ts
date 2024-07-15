import axios from "axios";
import { Calldata, ChainId, PriceRequest, Quote, Quoter } from "@aori-io/sdk";

export const BEBOP_ETHEREUM_API_URL = "https://api.bebop.xyz/pmm/ethereum/v3/quote/";
export const BEBOP_POLYGON_API_URL = "https://api.bebop.xyz/pmm/polygon/v3/quote/";
export const BEBOP_ARBITRUM_API_URL = "https://api.bebop.xyz/pmm/arbitrum/v3/quote/";
export const BEBOP_BLAST_API_URL = "https://api.bebop.xyz/pmm/blast/v3/quote/";
export const BEBOP_OPTIMISM_API_URL = "https://api.bebop.xyz/pmm/optimism/v3/quote/";
export const BEBOP_TAIKO_API_URL = "https://api.bebop.xyz/pmm/taiko/v3/quote/";

export class BebopQuoter implements Quoter {
    private url: string;

    constructor({ url }: { url: string }) {
        this.url = url;
    }

    static build({ url }: { url: string }): BebopQuoter {
        return new BebopQuoter({ url });
    }

    name(): string {
        return "bebop";
    }

    private static getApiUrl(chainId: ChainId): string {
        switch (chainId) {
            case ChainId.ETHEREUM_MAINNET:
                return BEBOP_ETHEREUM_API_URL;
            case ChainId.POLYGON_MAINNET:
                return BEBOP_POLYGON_API_URL;
            case ChainId.ARBITRUM_MAINNET:
                return BEBOP_ARBITRUM_API_URL;
            case ChainId.BLAST_MAINNET:
                return BEBOP_BLAST_API_URL;
            case ChainId.OPTIMISM_MAINNET:
                return BEBOP_OPTIMISM_API_URL;
            case ChainId.TAIKO_MAINNET:
                return BEBOP_TAIKO_API_URL;
            default:
                throw new Error(`Unsupported chain ID: ${chainId}`);
        }
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress }: PriceRequest): Promise<Quote> {
        if (!inputAmount) {
            throw new Error("inputAmount is required");
        }

        const res = await axios.get(this.url, {
            params: {
                sell_tokens: inputToken,
                buy_tokens: outputToken,
                sell_amounts: inputAmount.toString(),
                taker_address: fromAddress,
                approval_type: 'Standard',
                gasless: true,
            }
        });

        const { gasFee, toSign } = res.data;
    
        return {
            outputAmount: BigInt(toSign.maker_amount),
            price: parseFloat(toSign.maker_amount) / parseFloat(toSign.taker_amount),
            gas: BigInt(parseFloat(gasFee.native) || 0),
        };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: PriceRequest): Promise<Quote> {
        throw new Error("getInputAmountQuote is not implemented for Dexalot");
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, fromAddress }: PriceRequest): Promise<Calldata> {
        if (!inputAmount) {
            throw new Error("inputAmount is required");
        }

        const res = await axios.get(this.url, {
            params: {
                sell_tokens: inputToken,
                buy_tokens: outputToken,
                sell_amounts: inputAmount.toString(),
                taker_address: fromAddress,
                approval_type: 'Standard',
                gasless: false,
            }
        });

        const { tx, toSign } = res.data;

        return {
            outputAmount: BigInt(toSign.maker_amount),
            to: tx.to,
            value: Number(tx.value),
            data: tx.data as `0x${string}`,
        };
    }
}