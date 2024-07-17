
import axios from "axios";
import { PriceRequest, Quoter } from "@aori-io/sdk";

const SWING_ROUTE_API_URL = "https://swap.prod.swing.xyz/v0/transfer/quote";
const SWING_APPROVAL_API_URL = "https://swap.prod.swing.xyz/v0/transfer/approve";
const SWING_LOCATION_RESTRICTED_API_URL = "https://swap.prod.swing.xyz/v0/transfer/config/location";

export class SwingQuoter implements Quoter {

    static build() {
        return new SwingQuoter();
    }

    name() {
        return "swing";
    }

    async getChainSlug(chainId: string) {
        const chainsResponse = await axios.get('https://platform.swing.xyz/api/v1/chains');
        const chainSlug = chainsResponse.data.find((chain: any) => chain.id === chainId).slug;
        return chainSlug;
    }

    async getTokenSymbol(tokenAddress: string) {
        const tokensResponse = await axios.get('https://platform.swing.xyz/api/v1/tokens');
        const tokenSymbol = tokensResponse.data.find((token: any) => token.address === tokenAddress).symbol;
        return tokenSymbol;
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest) {
        const restricted_result = await axios.get(SWING_LOCATION_RESTRICTED_API_URL);

        if (restricted_result.status !== 200) {
            throw new Error("Swing doesn't allow requests from your jurisdiction.");
        }

        const chainSlug = await this.getChainSlug(chainId.toString());
        const inputTokenSymbol = await this.getTokenSymbol(inputToken);
        const outputTokenSymbol = await this.getTokenSymbol(outputToken);

        const routeResult = await axios.get(
            SWING_ROUTE_API_URL,
            {
              params: {
                fromChain: chainSlug,
                tokenSymbol: inputTokenSymbol,
                fromTokenAddress: inputToken,

                toChain: chainSlug,
                toTokenSymbol: outputTokenSymbol,
                toTokenAddress: outputToken,

                fromUserAddress: fromAddress,
                toUserAddress: fromAddress,
                tokenAmount: inputAmount,
                contractCall: true,
              }
            }
        );

        return {
            outputAmount: BigInt(routeResult.data.routes[0].quote.amount),
            price: 0,
            gas: BigInt(routeResult.data.routes[0].gas)
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress }: PriceRequest) {
        throw new Error("Not implemented");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0)
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: PriceRequest) {
        const restricted_result = await axios.get(SWING_LOCATION_RESTRICTED_API_URL);

        if (restricted_result.status !== 200) {
            throw new Error("Swing doesn't allow requests from your jurisdiction.");
        }

        const chainSlug = await this.getChainSlug(chainId.toString());
        const inputTokenSymbol = await this.getTokenSymbol(inputToken);
        const outputTokenSymbol = await this.getTokenSymbol(outputToken);

        const routeResult = await axios.get(SWING_ROUTE_API_URL, {
            params: {
                fromChain: chainSlug,
                tokenSymbol: inputTokenSymbol,
                fromTokenAddress: inputToken,
                toChain: chainSlug,
                toTokenSymbol: outputTokenSymbol,
                toTokenAddress: outputToken,
                fromUserAddress: fromAddress,
                toUserAddress: fromAddress,
                tokenAmount: inputAmount,
                contractCall: true,
            }
        });

        const { data } = await axios.get(SWING_APPROVAL_API_URL, {
            params: {
                fromChain: chainSlug,
                tokenSymbol: inputTokenSymbol,
                tokenAddress: inputToken,
                bridge: routeResult.data.routes[0].route[0].bridge,
                toChain: chainSlug,
                toTokenSymbol: outputTokenSymbol,
                toTokenAddress: outputToken,
                fromAddress: fromAddress,
                tokenAmount: inputAmount,
                contractCall: true,
            }
        });

        return {
            to: data.tx[0].to,
            value: Number(0),
            data: data.tx[0].data,
            outputAmount: BigInt(routeResult.data.routes[0].quote.amount),
        };
    }
}