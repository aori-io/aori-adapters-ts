import axios from "axios";
import { Calldata, InputAmountRequest, OutputAmountRequest, PriceRequest, Quote, Quoter } from "../interfaces";

export const VALANTIS_HOT_API_URL = "https://hot.valantis.xyz/solver/order";

async function fetchAmountOut(tokenInAddress: string, tokenOutAddress: string, amountIn: bigint, chainId: number): Promise<bigint> {
    try {
        const asset_platforms_list = await axios.get(`https://api.coingecko.com/api/v3/asset_platforms`);
        let chain_identifier;
        for (const platform of asset_platforms_list.data) {
            if (platform.chain_identifier === chainId) {
                chain_identifier = platform.id;
            }
        }

        const responseIn = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chain_identifier}?contract_addresses=${tokenInAddress}&vs_currencies=usd`);
        const responseOut = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chain_identifier}?contract_addresses=${tokenOutAddress}&vs_currencies=usd`);


        if (!responseIn.data || !responseOut.data) {
            throw new Error('Empty response from CoinGecko API');
        }

        const tokenInData = responseIn.data[tokenInAddress.toLowerCase()];
        const tokenOutData = responseOut.data[tokenOutAddress.toLowerCase()];

        if (!tokenInData || !tokenOutData) {
            throw new Error('Token data not found in CoinGecko response');
        }

        const priceInUSD = tokenInData.usd;
        const priceOutUSD = tokenOutData.usd;

        if (priceInUSD === undefined || priceOutUSD === undefined) {
            throw new Error('Price data is not available for one of the tokens');
        }

        // Ensuring consistent precision with 12 decimal places
        const scaleFactor = BigInt(10 ** 12);

        const priceInScaled = BigInt(Math.round(priceInUSD * 10 ** 6));
        const priceOutScaled = BigInt(Math.round(priceOutUSD * 10 ** 6));

        // Calculating output amount
        const amountOut = (priceInScaled * amountIn) / priceOutScaled;

        // Adjusting for scale factor
        return amountOut / scaleFactor;
    } catch (error) {
        console.error('Error fetching amount out:', error);
        console.error('Token In Address:', tokenInAddress);
        console.error('Token Out Address:', tokenOutAddress);
        throw error;
    }
}

export class ValantisQuoter implements Quoter {
    url: string;
    apiKey: string;

    constructor({
        url,
        apiKey
    }: {
        url: string;
        apiKey: string;
    }) {
        this.url = url;
        this.apiKey = apiKey;
    }

    static build({ url, apiKey }: { url: string, apiKey: string }) {
        return new ValantisQuoter({ url, apiKey });
    }

    name() {
        return "valantis";
    }

    async getOutputAmountQuote({ inputToken, outputToken, inputAmount, fromAddress, chainId }: OutputAmountRequest): Promise<Quote> {
        if (!inputAmount) {
            throw new Error("inputAmount is required");
        }

        const AMOUNT_OUT = await fetchAmountOut(inputToken, outputToken, BigInt(inputAmount), chainId);

        const requestBody = {
            authorized_recipient: fromAddress,
            authorized_sender: fromAddress,
            chain_id: chainId,
            expected_gas_price: '0',
            expected_gas_units: '0',
            quote_expiry: Math.ceil(Date.now() / 1000) + 120,
            request_expiry: Math.ceil(Date.now() / 1000) + 30,
            token_in: inputToken,
            token_out: outputToken,
            amount_in: inputAmount,
            amount_out_requested: (AMOUNT_OUT - BigInt(750)).toString(),
        };

        const { data } = await axios.post(this.url, requestBody, {
            headers: {
                "X-API-Key": `${this.apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        return {
            outputAmount: BigInt(data.volume_token_out),
            price: parseFloat("0"),
            gas: BigInt(0),
        };
    }

    async getInputAmountQuote({ inputToken, outputToken, outputAmount, fromAddress, chainId }: InputAmountRequest): Promise<Quote> {
        throw new Error("getInputAmountQuote is not implemented for Valantis");
    }

    async generateCalldata({ inputToken, outputToken, outputAmount, fromAddress, chainId }: OutputAmountRequest): Promise<Calldata> {
        if (!outputAmount) {
            throw new Error("outputAmount is required");
        }

        const amountOutBigInt = BigInt(outputAmount);
        const amountIn = await fetchAmountOut(outputToken, inputToken, amountOutBigInt, chainId);

        const requestBody = {
            authorized_recipient: fromAddress,
            authorized_sender: fromAddress,
            chain_id: chainId,
            request_expiry: Math.ceil(Date.now() / 1000) + 30,
            quote_expiry: Math.ceil(Date.now() / 1000) + 120,
            token_in: inputToken,
            token_out: outputToken,
            amount_in: amountIn.toString(),
            amount_out_requested: outputAmount
        };

        const { data } = await axios.post(this.url, requestBody, {
            headers: {
                "X-API-Key": `${this.apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        return {
            outputAmount: BigInt(data.volume_token_out),
            to: data.pool_address,
            value: 0,
            data: data.signed_payload
        };
    }
}
