/*//////////////////////////////////////////////////////////////
                               TYPES
//////////////////////////////////////////////////////////////*/

export type PriceRequest = {
    fromAddress: string;
    inputToken: string;
    outputToken: string;
    inputAmount?: string | number | bigint;
    outputAmount?: string | number | bigint;
    chainId: number;
}
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type OutputAmountRequest = WithRequired<PriceRequest, "inputAmount">
export type InputAmountRequest = WithRequired<PriceRequest, "outputAmount">

export interface Calldata {
    outputAmount: bigint;
    to: string;
    value: number;
    data: string;
}
export type Quote = PriceRequest & {
    outputAmount: bigint;
    price: number;
    gas: bigint;
}

export const DEFAULT_QUOTE = { price: 0, gas: 0n, outputAmount: 0n, fromAddress: "", inputToken: "", outputToken: "", chainId: 0 };

export interface Quoter {
    name: () => string;
    getOutputAmountQuote: ({ inputToken, outputToken, inputAmount }: OutputAmountRequest) => Promise<Quote>;
    getInputAmountQuote: ({ inputToken, outputToken, outputAmount }: InputAmountRequest) => Promise<Quote>;
    generateCalldata: ({ inputToken, outputToken, inputAmount, outputAmount }: OutputAmountRequest) => Promise<Calldata>;
}