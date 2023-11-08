import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class KyberswapQuoter implements Quoter {
    url: string;

    constructor({
        url
    }: {
        url: string;
    }) {
        this.url = url;
    }

    static build({ url }: { url: string }) {
        return new KyberswapQuoter({ url });
    }

    async getQuote({ inputToken, outputToken, inputAmount }: PriceRequest) {
        const { data } = await axios.get(this.url, {
            params: {
                tokenIn: inputToken,
                tokenOut: outputToken,
                amountIn: inputAmount,
                saveGas: false,
                gasInclude: false
            }
        });

        return {
            outputAmount: BigInt(data.amountOut),
            to: data.routerAddress,
            value: data.value, // TODO:
            data: data.data, // TODO:
            price: parseFloat("0") // TODO: 
        }
    }
}