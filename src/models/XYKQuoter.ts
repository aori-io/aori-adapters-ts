import { Calldata, getTokenDetails, Quoter } from "@aori-io/sdk";

export const xykQuoterFactory: ((address: string, chainId?: number, tokenA?: string, tokenB?: string) => Quoter) = (address, chainId, tokenA, tokenB) => ({
    name: () => "XYKMaker",
    getOutputAmountQuote: async ({ inputToken, outputToken, inputAmount, chainId: _chainId }) => {

        if (tokenA != undefined && tokenB != undefined && (tokenA != inputToken && tokenB != outputToken) || (tokenB != inputToken && tokenA != outputToken) || (chainId != undefined && chainId != _chainId)) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }

        const { balance: inputBalance } = await getTokenDetails(_chainId, inputToken, address);
        const { balance: outputBalance } = await getTokenDetails(_chainId, outputToken, address);
        if (inputBalance == undefined || outputBalance == undefined) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }
        
        const newOutputAmount = (BigInt(inputBalance) * BigInt(outputBalance)) / (inputBalance - BigInt(inputAmount));

        return { outputAmount: newOutputAmount - outputBalance, to: "", value: 0, data: "", price: 0, gas: 0n }
    },
    getInputAmountQuote: async ({ inputToken, outputToken, outputAmount, chainId: _chainId }) => {
        if (tokenA != undefined && tokenB != undefined && (tokenA != inputToken && tokenB != outputToken) || (tokenB != inputToken && tokenA != outputToken) || (chainId != undefined && chainId != _chainId)) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }

        const { balance: inputBalance } = await getTokenDetails(_chainId, inputToken, address);
        const { balance: outputBalance } = await getTokenDetails(_chainId, outputToken, address);

        if (inputBalance == undefined || outputBalance == undefined) {
            return {
                price: 0,
                gas: 0n,
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }
        const newInputAmount = (BigInt(inputBalance) * BigInt(outputBalance)) / (outputBalance - BigInt(outputAmount));

        return { outputAmount: newInputAmount - inputBalance, to: "", value: 0, data: "", price: 0, gas: 0n }
    },
    generateCalldata: async ({ inputToken, outputToken, inputAmount, chainId: _chainId }): Promise<Calldata> => {
        if (tokenA != undefined && tokenB != undefined && (tokenA != inputToken && tokenB != outputToken) || (tokenB != inputToken && tokenA != outputToken) || (chainId != undefined && chainId != _chainId)) {
            return {
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }

        const { balance: inputBalance } = await getTokenDetails(_chainId, inputToken, address);
        const { balance: outputBalance } = await getTokenDetails(_chainId, outputToken, address);
        if (inputBalance == undefined || outputBalance == undefined) {
            return {
                outputAmount: 0n,
                to: "",
                value: 0,
                data: ""
            }
        }
        const newOutputAmount = (BigInt(inputBalance) * BigInt(outputBalance)) / (inputBalance - BigInt(inputAmount));

        return { outputAmount: newOutputAmount - outputBalance, to: "", value: 0, data: "" }
    }
});