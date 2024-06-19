import { Calldata, PriceRequest, Quoter, staticCall } from "@aori-io/sdk";
import { UniswapQuoterV2__factory } from "../types";

export class V3Quoter implements Quoter {
    routerContractAddress: string;
    quoterContractAddress: string;
    feeInBips: number;

    name() {
        return "V3";
    }

    constructor({
        routerContractAddress,
        quoterContractAddress,
        feeInBips
    }: {
        routerContractAddress: string;
        quoterContractAddress: string;
        feeInBips: number;
    }) {
        this.quoterContractAddress = quoterContractAddress;
        this.routerContractAddress = routerContractAddress;
        this.feeInBips = feeInBips;
    }

    static build({
        routerContractAddress,
        quoterContractAddress,
        feeInBips = 3000
    }: {
        routerContractAddress: string;
        quoterContractAddress: string;
        feeInBips?: number;
    }) {
        return new V3Quoter({
            routerContractAddress,
            quoterContractAddress,
            feeInBips
        });
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const output = await staticCall({
            to: this.quoterContractAddress,
            // @ts-ignore
            data: QuoterV2__factory.createInterface().encodeFunctionData("quoteExactInputSingle", [
                [
                    inputToken,
                    outputToken,
                    inputAmount,
                    this.feeInBips,
                    0
                ]]),
            chainId
        });

        const [
            outputAmount,
            sqrtPriceLimitX96,
            _, // initializedTicksCrossed
            gasEstimate
        ] = UniswapQuoterV2__factory.createInterface().decodeFunctionResult("quoteExactInputSingle", output);

        return {
            to: this.routerContractAddress,
            value: 0,
            // @ts-ignore
            data: SwapRouter02__factory.createInterface().encodeFunctionData("exactInputSingle", [
                [
                    inputToken, //Take USDC
                    outputToken, //and buy WETH
                    this.feeInBips, // fee
                    fromAddress, // recipient
                    inputAmount,
                    outputAmount,
                    String(0)
                ]
            ]),
            outputAmount,
            price: 0,
            gas: gasEstimate
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, chainId, fromAddress }: PriceRequest) {
        const output = await staticCall({
            to: this.quoterContractAddress,
            // @ts-ignore
            data: QuoterV2__factory.createInterface().encodeFunctionData("quoteExactOutputSingle", [{
                tokenIn: String(inputToken),
                tokenOut: String(outputToken),
                amountOut: outputAmount,
                fee: this.feeInBips,
                sqrtPriceLimitX96: 0
            }]),
            chainId
        });

        const [
            inputAmount,
            sqrtPriceLimitX96,
            _, // initializedTicksCrossed
            gasEstimate // gasEstimate
        ] = UniswapQuoterV2__factory.createInterface().decodeFunctionResult("quoteExactOutputSingle", output);

        return {
            to: this.routerContractAddress,
            value: 0,
            // @ts-ignore
            data: SwapRouter02__factory.createInterface().encodeFunctionData("exactOutputSingle", [
                [
                    inputToken, //Take USDC
                    outputToken, //and buy WETH
                    this.feeInBips,
                    fromAddress,
                    inputAmount,
                    0, // amountOutMinimum = 0, caution when using!
                    String(0)
                ]
            ]),
            outputAmount: inputAmount,
            price: 0,
            gas: gasEstimate,
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest): Promise<Calldata> {
        const output = await staticCall({
            to: this.quoterContractAddress,
            // @ts-ignore
            data: QuoterV2__factory.createInterface().encodeFunctionData("quoteExactInputSingle", [
                [
                    inputToken,
                    outputToken,
                    inputAmount,
                    this.feeInBips,
                    0
                ]]),
            chainId
        });

        const [
            outputAmount,
            sqrtPriceLimitX96,
            _, // initializedTicksCrossed
            gasEstimate
        ] = UniswapQuoterV2__factory.createInterface().decodeFunctionResult("quoteExactInputSingle", output);

        return {
            to: this.routerContractAddress,
            value: 0,
            // @ts-ignore
            data: SwapRouter02__factory.createInterface().encodeFunctionData("exactInputSingle", [
                [
                    inputToken, //Take USDC
                    outputToken, //and buy WETH
                    this.feeInBips, // fee
                    fromAddress, // recipient
                    inputAmount,
                    outputAmount,
                    String(0)
                ]
            ]),
            outputAmount
        }
    }
}