import { PriceRequest, Quoter } from "@aori-io/sdk";
import axios from "axios";

export const LIFI_API_URL = "https://li.quest/v1/quote";

export class LifiQuoter implements Quoter {
    url: string;
    apiKey: string;

    constructor({
        url,
        apiKey
    }: {
        url: string;
        apiKey: string;
    }) {
        this.url = url;
        this.apiKey = apiKey;
    }

    static build({ url, apiKey }: { url: string, apiKey: string }) {
        return new LifiQuoter({ url, apiKey });
    }

    name() {
        return "lifi";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                fromChain: `${chainId}`,
                toChain: `${chainId}`,
                fromToken: inputToken,
                toToken: outputToken,
                fromAmount: inputAmount,
                fromAddress,
                integrator: "aori.io",
            },
            headers: {
                'x-lifi-api-key': this.apiKey
            }
        });

        return {
            outputAmount: BigInt(data.estimate.toAmount),
            to: data.transactionRequest.to,
            value: data.transactionRequest.value,
            data: data.transactionRequest.data,
            price: parseFloat(data.estimate.toAmountUSD) / parseFloat(data.estimate.fromAmountUSD),
            gas: BigInt(data.transactionRequest.gasLimit)
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: PriceRequest) {
        throw new Error("Not implemented");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0)
        }
    }
}