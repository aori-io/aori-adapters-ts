import { InputAmountRequest, OutputAmountRequest, PriceRequest, Quoter } from "@aori-io/sdk";

export class MultiQuoter implements Quoter {
    quoters: Quoter[];

    constructor(quoters: Quoter[]) {
        this.quoters = quoters;
    }

    static build(quoters: Quoter[]) {
        return new MultiQuoter(quoters);
    }

    name() {
        return "MultiQuoter";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: OutputAmountRequest) {
        const responses = await Promise.allSettled(this.quoters.map(quoter => quoter.getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }))); 

        // Out of those that were successful, return the one with the highest output amount
        const bestQuote = responses.reduce((best, response) => {
            if (response.status == "fulfilled" && response.value.outputAmount > best.outputAmount) {
                return response.value;
            }
            return best;
        }, { price: 0, gas: 0n, outputAmount: 0n, to: "", value: 0, data: "" });

        return bestQuote;
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: InputAmountRequest) {
        const responses = await Promise.allSettled(this.quoters.map(quoter => quoter.getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }))); 

        // Out of those that were successful, return the one with the lowest input (output) amount
        const bestQuote = responses.reduce((best, response) => {
            if (response.status == "fulfilled" && response.value.outputAmount < best.outputAmount) {
                return response.value;
            }
            return best;
        }, { price: 0, gas: 0n, outputAmount: 0n, to: "", value: 0, data: "" });

        return bestQuote;
    }
}

        