import axios from "axios";
import { PriceRequest, Quoter } from "../Quoter";

export class OdosQuoter implements Quoter {

    url: string;

    constructor({ url }: { url: string }) {
        this.url = url;
    }
    static build({ url }: { url: string }) {
        return new OdosQuoter({ url });
    }

    async getQuote({ inputToken, outputToken, inputAmount, chainId, fromAddress }: PriceRequest) {
        const { data } = await axios.post(`${this.url}/sor/quote/v2`, {
            chainId: 1,
            inputTokens: [
                {
                    tokenAddress: inputToken,
                    amount: inputAmount,
                }
            ],
            outputTokens: [
                {
                    tokenAddress: outputToken,
                    proportion: 1
                }
            ],
            userAddr: fromAddress,
            slippageLimitPercent: 0.3,
            referralCode: 0,
            compact: true,
        });

        const { data: _data } = await axios.post(`${this.url}/sor/assemble`, {
            userAddr: fromAddress,
            pathId: data.pathId,
        });

        console.log(_data);

        return {
            outputAmount: BigInt(_data.outputTokens[0].amount),
            to: _data.transaction.to,
            value: _data.transaction.value,
            data: _data.transaction.data,
            price: parseFloat("0")
        };
    }
}