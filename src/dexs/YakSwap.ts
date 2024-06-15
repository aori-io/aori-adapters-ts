import { PriceRequest, Quoter, staticCall } from "@aori-io/sdk";
import { YakRouter, YakRouter__factory } from "../types";

export class YakSwapQuoter implements Quoter {
    routerContractAddress: string;

    name() {
        return "YakSwap";
    }

    constructor({ routerContractAddress }: { routerContractAddress: string }) {
        this.routerContractAddress = routerContractAddress;
    }

    static build({ routerContractAddress }: { routerContractAddress: string }) {
        return new YakSwapQuoter({ routerContractAddress });
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const output = await staticCall({
            to: this.routerContractAddress,
            data: YakRouter__factory.createInterface().encodeFunctionData("findBestPath", [
                inputAmount ? BigInt(inputAmount) : 0n,
                inputToken,
                outputToken,
                3,
            ]),
            chainId
        });

        const result = await YakRouter__factory.createInterface().decodeFunctionResult(
            "findBestPath",
            output
          );
          
          const [innerResult] = result;
          const [amountsResult, adaptersResult, pathResult, gasEstimateResult] = innerResult;
          
          const amounts = amountsResult.map(BigInt);
          const adapters = adaptersResult.map(String);
          const path = pathResult.map(String);
          const gasEstimate = gasEstimateResult;
          
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
            gas: gasEstimate
          };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress }: PriceRequest) {
        throw new Error("Not implemented");

        return {
            outputAmount: BigInt(0),
            to: "",
            value: 0,
            data: "",
            price: 0,
            gas: BigInt(0)
        }
    }
}