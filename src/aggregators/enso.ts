import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

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

    async getQuote({ inputToken, outputToken, inputAmount, fromAddress }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                fromAddress,
                tokenIn: inputToken,
                amountIn: inputAmount,
                tokenOut: outputToken,
                priceImpact: true
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
            price: parseFloat("0") // TODO: set price
        }
    }
}