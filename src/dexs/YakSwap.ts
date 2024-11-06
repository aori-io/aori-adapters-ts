import { Calldata, PriceRequest, Quoter } from "../interfaces";
import { YakRouter, YakRouter__factory } from "../types";
import { JsonRpcProvider } from "ethers";

export class YakSwapQuoter implements Quoter {
    routerContractAddress: string;
    provider?: JsonRpcProvider;

    name() {
        return "YakSwap";
    }

    constructor({ routerContractAddress, provider }: { routerContractAddress: string, provider?: JsonRpcProvider }) {
        this.routerContractAddress = routerContractAddress;
        this.provider = provider;
    }

    static build({ routerContractAddress, provider }: { routerContractAddress: string, provider?: JsonRpcProvider }) {
        return new YakSwapQuoter({ routerContractAddress, provider });
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {

        const { amounts, path, adapters, gasEstimate } = await YakRouter__factory.connect(this.routerContractAddress, this.provider).findBestPath(
            inputAmount ? BigInt(inputAmount) : 0n,
            inputToken,
            outputToken,
            3,
        );
          
        const tradeStruct: YakRouter.TradeStruct = {
            amountIn: amounts[0],
            amountOut: amounts[amounts.length - 1],
            path: path,
            adapters: adapters
        };
          
        return {
            to: this.routerContractAddress,
            value: 0,
            data: YakRouter__factory.createInterface().encodeFunctionData("swapNoSplit", [
              tradeStruct,
              fromAddress,
              0n
            ]),
            outputAmount: amounts[amounts.length - 1],
            price: 0,
            gas: gasEstimate,
            // 
            inputAmount: amounts[0],
            fromAddress,
            inputToken,
            outputToken,
            chainId
        };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: PriceRequest) {
        throw new Error("Not implemented");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0),
            // 
            inputAmount: BigInt(0),
            fromAddress,
            inputToken,
            outputToken,
            chainId
        }
    }

    async generateCalldata({ inputToken, outputToken, inputAmount, fromAddress, chainId }: PriceRequest): Promise<Calldata> {
      const { amounts, path, adapters, gasEstimate } = await YakRouter__factory.connect(this.routerContractAddress, this.provider).findBestPath(
        inputAmount ? BigInt(inputAmount) : 0n,
        inputToken,
        outputToken,
            3,
        );
          
        const tradeStruct: YakRouter.TradeStruct = {
          amountIn: amounts[0],
          amountOut: amounts[amounts.length - 1],
          path: path,
          adapters: adapters
        };
          
        return {
          to: this.routerContractAddress,
          value: 0,
          data: YakRouter__factory.createInterface().encodeFunctionData("swapNoSplit", [
            tradeStruct,
            fromAddress,
            0n
          ]),
          outputAmount: amounts[amounts.length - 1],
        };
    }
}