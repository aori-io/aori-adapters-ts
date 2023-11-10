import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class ParaswapQuoter implements Quoter {

    url: string;

    constructor({
        url
    }: {
        url: string;
    }) {
        this.url = url;
    }

    static build({ url }: { url: string }) {
        return new ParaswapQuoter({ url });
    }

    name() {
        return "paraswap";
    }

    async getQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const { data } = await axios.get(`${this.url}/prices`, {
            params: {
                srcToken: inputToken,
                destToken: outputToken,
                amount: inputAmount,
                network: chainId,
                userAddress: fromAddress
            }
        })

        // TODO: add back when able to bypass approval
        // const { data: _data } = await axios.post(`${this.url}/transactions/${chainId}`, {
        //     srcToken: inputToken,
        //     destToken: outputToken,
        //     srcAmount: inputAmount,
        //     slippage: 50,
        //     userAddress: fromAddress,
        //     priceRoute: data.priceRoute
        // });

        return {
            outputAmount: BigInt(data.priceRoute.destAmount),
            to: "",
            value: 0,
            data: "",
            price: 0
        }
    }
}