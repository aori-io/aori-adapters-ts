import axios from "axios";
import { Calldata, ChainId, PriceRequest, Quote, Quoter } from "@aori-io/sdk";

export const DEXALOT_PAIRS_API_URL = "https://api.dexalot.com/api/rfq/pairs";
export const DEXALOT_QUOTE_API_URL = "https://api.dexalot.com/api/rfq/firm";

export class DexalotQuoter implements Quoter {
    url: string;
    apiKey: string;

    constructor({ url, apiKey }: { url: string, apiKey: string }) {
        this.apiKey = apiKey;
        this.url = url;
    }

    static build({ url, apiKey }: { url:string, apiKey: string }) {
        return new DexalotQuoter({ url, apiKey });
    }

    name() {
        return "dexalot";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest): Promise<Quote> {
        if (!inputAmount) {
            throw new Error("inputAmount is required");
        }

        const res = await axios.post(this.url, {
            chainid: chainId,
            takerAsset: inputToken,
            makerAsset: outputToken,
            takerAmount: inputAmount.toString(),
            userAddress: fromAddress,
        }, {
            headers: {
                'x-apikey': this.apiKey,
                'Content-Type': 'application/json',
            }
        });

        const { order, tx } = res.data;

        return {
            outputAmount: BigInt(order.makerAmount),
            price: parseFloat(order.makerAmount) / parseFloat(order.takerAmount),
            gas: BigInt(tx.gasLimit || 0),
        };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: PriceRequest): Promise<Quote> {
        throw new Error("getInputAmountQuote is not implemented for Dexalot");
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest): Promise<Calldata> {
        if (!inputAmount) {
            throw new Error("inputAmount is required");
        }

        const res = await axios.get(this.url, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
            params: {
                tokenIn: inputToken,
                from: fromAddress,
                amount: inputAmount.toString(),
                tokenOut: outputToken,
                to: fromAddress,
                slippage: 0.01.toString(),
            }
        });

        const { tx, assumedAmountOut, price } = res.data;

        return {
            outputAmount: BigInt(assumedAmountOut),
            to: tx.to,
            value: Number(tx.value),
            data: tx.data as `0x${string}`,
        };
    }
}