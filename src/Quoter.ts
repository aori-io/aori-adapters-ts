export interface PriceRequest {
    fromAddress: string;
    inputToken: string;
    outputToken: string;
    inputAmount: string;
    chainId: number;
}
export interface Calldata {
    to: string;
    value: number;
    data: string;
}
export type Quote = { outputAmount: bigint; price: number; } & Calldata;
export interface Quoter {
    name: () => string;
    getQuote: ({ inputToken, outputToken, inputAmount }: PriceRequest) => Promise<Quote>;
}