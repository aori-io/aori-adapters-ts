import { Calldata, PriceRequest, Quoter } from "../interfaces";
import axios from "axios";

export const PARASWAP_API_URL = "https://apiv5.paraswap.io";

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

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
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
            price: 0,
            gas: BigInt(0)
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, chainId, fromAddress }: PriceRequest) {
        const { data } = await axios.get(`${this.url}/prices`, {
            params: {
                srcToken: inputToken,
                destToken: outputToken,
                amount: outputAmount,
                side: "BUY",
                network: chainId,
                userAddress: fromAddress
            }
        })

        return {
            outputAmount: BigInt(data.priceRoute.srcAmount),
            price: 0,
            gas: BigInt(0)
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: PriceRequest): Promise<Calldata> {
        const { data } = await axios.get(`${this.url}/prices`, {
            params: {
                srcToken: inputToken,
                destToken: outputToken,
                amount: inputAmount || outputAmount,
                side: (inputAmount) ? "SELL" : "BUY",
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
            to: data.priceRoute.destAddress,
            value: 0,
            data: ""
        }
    }
}