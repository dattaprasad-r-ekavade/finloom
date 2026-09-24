import { getLivePrice } from './angeloneLivePrice';

export interface PricedInstrument {
  scrip: string;
  exchange: string;
}

export function quoteKey({ scrip, exchange }: PricedInstrument): string {
  return `${exchange.toUpperCase()}:${scrip.toUpperCase()}`;
}

export class QuoteUnavailable extends Error {}

export async function freshQuote(instrument: PricedInstrument) {
  const quote = await getLivePrice(instrument.scrip, instrument.exchange);
  const maxAgeMs = 90_000;
  if (!quote || quote.asOf.getTime() > Date.now() + 60_000 || Date.now() - quote.asOf.getTime() > maxAgeMs) {
    throw new QuoteUnavailable(`A recent price is unavailable for ${quoteKey(instrument)}. Try again when the feed recovers.`);
  }
  return quote;
}

export async function freshQuoteMap(instruments: PricedInstrument[]) {
  const unique = new Map(instruments.map((instrument) => [quoteKey(instrument), instrument]));
  const quotes = await Promise.all([...unique].map(async ([key, instrument]) => [key, await freshQuote(instrument)] as const));
  return new Map(quotes);
}
