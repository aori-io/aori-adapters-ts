import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class EnsoQuoter implements Quoter {
    url: string;

    constructor({
        url
    }: {
        url: string;
    }) {
        this.url = url;
    }

    static build({ url }: { url: string }) {
        return new EnsoQuoter({ url });
    }

    async getQuote({ inputToken, outputToken, inputAmount }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                tokenIn: inputToken,
                amountIn: inputAmount,
                tokenOut: outputToken,
                priceImpact: true
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