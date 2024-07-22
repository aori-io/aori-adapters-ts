import { Calldata, PriceRequest, Quote, Quoter } from "@aori-io/sdk";
import axios from "axios";

export const OPENOCEAN_V3_API_URL = "https://open-api.openocean.finance/v3";
export const OPENOCEAN_V4_API_URL = "https://open-api.openocean.finance/v4";
export const OPENOCEAN_API_URL = OPENOCEAN_V4_API_URL;

export class OpenOceanQuoter implements Quoter {
    url: string;

    constructor({ url }: { url: string }) {
        this.url = url;
    }

    static build({ url }: { url: string }) {
        return new OpenOceanQuoter({ url });
    }

    name() {
        return (this.url == OPENOCEAN_V3_API_URL) ? "openocean-v3" : "openocean-v4";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest): Promise<Quote> {
        const inputAmountInEther = Number(inputAmount) / 1e18;

        const { data } = await axios.get(
            `${this.url}/${chainId}/swap${this.url == OPENOCEAN_V4_API_URL ? "" : "_quote"}`,
        {
            params: {
                inTokenAddress: inputToken,
                outTokenAddress: outputToken,
                amount: inputAmountInEther,
                gasPrice: 10,
                slippage: 0.1,
                account: fromAddress,                
            }
        });

        return {
            outputAmount: BigInt(data.data.outAmount),
            price: parseFloat(data.data.price),
            gas: BigInt(data.data.estimatedGas)
        };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, chainId, fromAddress }: PriceRequest) {
        throw new Error("Doesn't support output -> input just yet");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0)
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: PriceRequest): Promise<Calldata> {
        const inputAmountInEther = Number(inputAmount) / 1e18;

        const { data } = await axios.get(
            `${this.url}/${chainId}/swap${this.url == OPENOCEAN_V4_API_URL ? "" : "_quote"}`,
        {
            params: {
                inTokenAddress: inputToken,
                outTokenAddress: outputToken,
                amount: inputAmountInEther,
                gasPrice: 10,
                slippage: 0.1,
                account: fromAddress,                
            }
        });

        return {
            outputAmount: BigInt(data.data.outAmount),
            to: data.data.to,
            value: data.data.value,
            data: data.data.data
        };
    }
}