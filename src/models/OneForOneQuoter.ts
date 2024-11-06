import { Quoter } from "../interfaces";

export const oneForOneQuoterFactory: ((tokenA: string, tokenB: string) => Quoter) = (tokenA, tokenB) => ({
    name: () => "name",
    getInputAmountQuote: async ({ fromAddress, inputToken, outputToken, outputAmount, chainId }) => {
        if (tokenA == inputToken && tokenB == outputToken || tokenA == outputToken && tokenB == inputToken) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: BigInt(outputAmount),
                to: "",
                value: 0,
                data: "",
                // 
                inputAmount: BigInt(outputAmount),
                fromAddress,
                inputToken,
                outputToken,
                chainId
            }
        } else {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: "",
                // 
                inputAmount: BigInt(0),
                fromAddress,
                inputToken,
                outputToken,
                chainId
            }
        }
    },
    getOutputAmountQuote: async ({ fromAddress, inputToken, outputToken, inputAmount, chainId }) => {
        if (tokenA == inputToken && tokenB == outputToken || tokenA == outputToken && tokenB == inputToken) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: BigInt(inputAmount),
                to: "",
                value: 0,
                data: "",
                // 
                inputAmount: BigInt(inputAmount),
                fromAddress,
                inputToken,
                outputToken,
                chainId
            }
        } else {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: "",
                // 
                inputAmount: BigInt(0),
                fromAddress,
                inputToken,
                outputToken,
                chainId
            }
        }
    },
    generateCalldata: async ({ inputToken, outputToken, inputAmount, chainId }) => {
        return {
            outputAmount: BigInt(inputAmount),
            to: "",
            value: 0,
            data: ""
        }
    }
});