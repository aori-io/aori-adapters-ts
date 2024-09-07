import { Calldata, ChainId, InputAmountRequest, OutputAmountRequest, PriceRequest, Quote, Quoter } from "@aori-io/sdk";

export type Mode = "fast" | "best";

export type QuoterMap = Map<number | ChainId, Quoter[]>;

export class MultiQuoter implements Quoter {
    quoters: QuoterMap;
    mode: Mode;

    constructor(quoters: QuoterMap, mode: Mode = "fast") {
        this.quoters = quoters;
        this.mode = mode;
    }

    static build(quoters: QuoterMap) {
        return new MultiQuoter(quoters);
    }

    name() {
        return "MultiQuoter";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: OutputAmountRequest) {
        if (!this.quoters.has(chainId)) return { price: 0, gas: 0n, outputAmount: 0n };
        const allQuotes = this.quoters.get(chainId)!.map(quoter => quoter.getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }));
        try {
            return await Promise.any(allQuotes);
        } catch (error) {
            return { price: 0, gas: 0n, outputAmount: 0n };
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: InputAmountRequest) {
        if (!this.quoters.has(chainId)) return { price: 0, gas: 0n, outputAmount: 0n };
        const allQuotes = this.quoters.get(chainId)!.map(quoter => quoter.getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }));
        try {
            return await Promise.any(allQuotes);
        } catch (error) {
            return { price: 0, gas: 0n, outputAmount: 0n };
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }: OutputAmountRequest) { 
        if (!this.quoters.has(chainId)) return { price: 0, gas: 0n, outputAmount: 0n, to: "", value: 0, data: "" };
        const allQuotes = this.quoters.get(chainId)!.map(quoter => quoter.generateCalldata({ inputToken, outputToken, inputAmount, outputAmount, fromAddress, chainId }));
        const responses = await Promise.allSettled(allQuotes); 

        // Out of those that were successful, return the one with the lowest input (output) amount
        const bestQuote = responses.reduce((best, response) => {
            if (response.status == "fulfilled") {
                return response.value;
            }
            return best;
        }, { outputAmount: 0n, to: "", value: 0, data: "" });

        return bestQuote;
    }
}

        