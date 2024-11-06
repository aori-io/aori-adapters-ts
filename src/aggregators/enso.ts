
import axios from "axios";
import { PriceRequest, Quoter } from "../interfaces";

export const ENSO_API_URL = "https://api.enso.finance/api/v1/shortcuts/route";
export class EnsoQuoter implements Quoter {
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
        return new EnsoQuoter({ url, apiKey });
    }

    name() {
        return "enso";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                fromAddress,
                tokenIn: inputToken,
                amountIn: inputAmount,
                tokenOut: outputToken,
                priceImpact: true,
                chainId,
                routingStrategy: "router"
            },
            headers: {
                "Authorization": `Bearer ${this.apiKey}`
            }
        });

        return {
            outputAmount: BigInt(data.amountOut),
            to: data.tx.to,
            value: data.tx.value,
            data: data.tx.data,
            price: parseFloat("0"), // TODO: set price
            gas: BigInt(data.gas),
            // 
            fromAddress,
            inputToken,
            outputToken,
            chainId
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: PriceRequest) {
        throw new Error("Doesn't support output -> input just yet");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0),
            // 
            fromAddress,
            inputToken,
            outputToken,
            chainId
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                fromAddress,
                tokenIn: inputToken,
                amountIn: inputAmount,
                tokenOut: outputToken,
                priceImpact: true,
                chainId,
                routingStrategy: "router"
            },
            headers: {
                "Authorization": `Bearer ${this.apiKey}`
            }
        });

        return {
            to: data.tx.to,
            value: data.tx.value,
            data: data.tx.data,
            outputAmount: BigInt(data.amountOut),
        }
    }
}