
import axios from "axios";
import { PriceRequest, Quoter } from "../interfaces";

export const KYBERSWAP_MAINNET_API_URL = "https://aggregator-api.kyberswap.com/ethereum/api/v1";
export const KYBERSWAP_ARBITRUM_API_URL = "https://aggregator-api.kyberswap.com/arbitrum/api/v1";
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

    name() {
        return "kyberswap";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest) {
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
            price: parseFloat("0"), // TODO: 
            gas: BigInt(_data.data.gas),
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
            price: 0,
            gas: BigInt(0),
            // 
            fromAddress,
            inputToken,
            outputToken,
            chainId
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest) {
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
        }
    }
}