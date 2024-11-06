
import axios from "axios";
import { Calldata, InputAmountRequest, OutputAmountRequest, PriceRequest, Quote, Quoter } from "../interfaces";

export const SOCKET_API_URL = "https://api.socket.tech/v2";

export class SocketQuoter implements Quoter {
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
        return new SocketQuoter({ url, apiKey });
    }

    name() {
        return "socket";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: OutputAmountRequest): Promise<Quote> {
        const { data } = await axios.get(`${this.url}/quote`, {
            params: {
                fromChainId: chainId,
                toChainId: chainId,
                fromTokenAddress: inputToken,
                toTokenAddress: outputToken,
                fromAmount: inputAmount,
                userAddress: fromAddress,
                uniqueRoutesPerBridge: true,
                sort: "output",
                singleTxOnly: true
            },
            headers: {
                "API-KEY": this.apiKey
            }
        });

        const route = data.result.routes[0];

        const { data: _data } = await axios.post(`${this.url}/build-tx`, {
            route
        }, {
            headers: {
                "API-KEY": this.apiKey
            }
        });

        return {
            outputAmount: BigInt(data.result.toAmount),
            price: 0,
            gas: BigInt(data.result.minimumGasBalances[0]),
            // 
            fromAddress,
            inputToken,
            outputToken,
            chainId
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, chainId, fromAddress }: InputAmountRequest): Promise<Quote> {
        throw new Error("Not implemented");
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

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: OutputAmountRequest): Promise<Calldata> {
        const { data } = await axios.get(`${this.url}/quote`, {
            params: {
                fromChainId: chainId,
                toChainId: chainId,
                fromTokenAddress: inputToken,
                toTokenAddress: outputToken,
                fromAmount: inputAmount,
                userAddress: fromAddress,
                uniqueRoutesPerBridge: true,
                sort: "output",
                singleTxOnly: true
            },
            headers: {
                "API-KEY": this.apiKey
            }
        });

        const route = data.result.routes[0];

        const { data: _data } = await axios.post(`${this.url}/build-tx`, {
            route
        }, {
            headers: {
                "API-KEY": this.apiKey
            }
        });

        return {
            outputAmount: BigInt(data.result.toAmount),
            to: _data.result.txTarget,
            value: _data.result.value,
            data: _data.result.data
        }
    }
}