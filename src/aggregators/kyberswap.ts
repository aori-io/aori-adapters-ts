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

    async getQuote({ inputToken, outputToken, inputAmount, fromAddress }: PriceRequest) {
        const { data } = await axios.get(`${this.url}/routes`, {
            params: {
                tokenIn: inputToken,
                tokenOut: outputToken,
                amountIn: inputAmount,
                saveGas: false,
                gasInclude: false
            }
        });

        const { data: _data } = await axios.post(`${this.url}/route/build`, {
            routeSummary: data.data.routeSummary,
            sender: fromAddress,
            recipient: fromAddress
        });

        return {
            outputAmount: BigInt(_data.data.amountOut),
            to: _data.data.routerAddress,
            value: 0,
            data: _data.data.data,
            price: parseFloat("0") // TODO: 
        }
    }
}