import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class ConveyorQuoter implements Quoter {
    url: string;

    constructor({ url }: { url: string }) {
        this.url = url;
    }

    static build({ url }: { url: string }) {
        return new ConveyorQuoter({ url });
    }

    name() {
        return "conveyor";
    }

    async getQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const { data: { body } } = await axios.post(this.url, {
            tokenIn: inputToken,
            tokenOut: outputToken,
            amountIn: inputAmount,
            slippage: "50",
            chainId,
            recipient: fromAddress
        });

        return {
            outputAmount: BigInt(body.info.amountOut),
            to: body.tx.to,
            value: body.tx.value,
            data: body.tx.data,
            price: 0
        }
    }
}