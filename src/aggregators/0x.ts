import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class ZeroExQuoter implements Quoter {
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

    static build({ url, apiKey }: { url: string; apiKey: string }) {
        return new ZeroExQuoter({ url, apiKey });
    }

    async getQuote({ inputToken, outputToken, inputAmount }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                sellToken: inputToken,
                sellAmount: inputAmount,
                buyToken: outputToken
            },
            headers: {
                '0x-api-key': this.apiKey
            },
        });

        return {
            outputAmount: BigInt(data.buyAmount),
            to: data.to,
            value: 0,
            data: data.data,
            price: parseFloat(data.price)
        };
    }
}