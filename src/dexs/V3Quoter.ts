
import { PriceRequest, Quoter, staticCall } from "@aori-io/sdk";
import { Quoter__factory, SwapRouter__factory } from "../types";

export class V3Quoter implements Quoter {
    routerContractAddress: string;
    quoterContractAddress: string;

    name() {
        return "V3";
    }

    constructor({
        routerContractAddress,
        quoterContractAddress
    }: {
        routerContractAddress: string;
        quoterContractAddress: string;
    }) {
        this.quoterContractAddress = quoterContractAddress;
        this.routerContractAddress = routerContractAddress;
    }

    static build({
        routerContractAddress,
        quoterContractAddress
    }: {
        routerContractAddress: string;
        quoterContractAddress: string;
    }) {
        return new V3Quoter({
            routerContractAddress,
            quoterContractAddress
        });
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const outputAmount = BigInt(await staticCall({
            to: this.quoterContractAddress,
            // @ts-ignore
            data: Quoter__factory.createInterface().encodeFunctionData("quoteExactInputSingle", [
                String(inputToken),
                String(outputToken),
                String(3000),
                inputAmount,
                0
            ]),
            chainId
        }));

        return {
            to: this.routerContractAddress,
            value: 0,
            // @ts-ignore
            data: SwapRouter__factory.createInterface().encodeFunctionData("exactInputSingle", [
                [
                    inputToken, //Take USDC
                    outputToken, //and buy WETH
                    3000,
                    fromAddress,
                    String(Number((Date.now() / 1000).toFixed(0)) + 60),
                    inputAmount,
                    outputAmount,
                    String(0)
                ]
            ]),
            outputAmount,
            price: 0,
            gas: 0n
        }
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, chainId, fromAddress }: PriceRequest) {
        const inputAmount = BigInt(await staticCall({
            to: this.quoterContractAddress,
            // @ts-ignore
            data: Quoter__factory.createInterface().encodeFunctionData("quoteExactOutputSingle", [
                String(inputToken),
                String(outputToken),
                String(3000),
                outputAmount,
                0
            ]),
            chainId
        }));

        return {
            to: this.routerContractAddress,
            value: 0,
            // @ts-ignore
            data: SwapRouter__factory.createInterface().encodeFunctionData("exactOutputSingle", [
                [
                    inputToken, //Take USDC
                    outputToken, //and buy WETH
                    3000,
                    fromAddress,
                    String(Number((Date.now() / 1000).toFixed(0)) + 60),
                    inputAmount,
                    outputAmount,
                    String(0)
                ]
            ]),
            outputAmount: 0n,
            price: 0,
            gas: 0n,
        }
    }


}