export interface PriceRequest {
    inputToken: string;
    outputToken: string;
    inputAmount: string;
}
export interface Calldata {
    to: string;
    value: number;
    data: string;
}
export type Quote = { outputAmount: bigint; price: number; } & Calldata;
export interface Quoter {
    getQuote: ({ inputToken, outputToken, inputAmount }: PriceRequest) => Promise<Quote>;
}