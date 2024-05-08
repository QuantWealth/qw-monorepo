import {
  IDirectory,
  Directory,
  IStrategy,
  IMarketData,
  MarketData,
  TVLDataTuple,
  AssetDataTuple
} from "./schema";

/**
 * Upserts a strategy in the directory. If the strategy exists, it updates it; otherwise, it creates a new entry.
 * @param strategyId - 32-byte ID value.
 * @param data - The strategy details to upsert.
 * @returns void
 */
export async function upsertStrategy(strategyId: string, data: IStrategy): Promise<void> {
  const directory = await getOrCreateDirectory();
  directory.strategies.set(strategyId, data);
  await directory.save();
  console.log("Strategy upserted successfully.");
}

/**
 * Upserts TVL data associated with a strategy. If TVL data for the strategy exists, it appends to it; otherwise, it creates a new entry.
 * @param strategyId - The ID of the strategy to associate the TVL data with.
 * @param data - Array of [timestamp, amount] tuples to be added or created.
 * @returns void
 */
export async function upsertTVL(strategyId: string, data: [number, number][]): Promise<void> {
  const marketData = await getOrCreateMarketData();
  const existingData = marketData.tvl.get(strategyId) || { series: [] };
  existingData.series.push(...data);
  marketData.tvl.set(strategyId, existingData);
  await marketData.save();
  console.log("TVL data upserted successfully.");
}

/**
 * Upserts asset pair data. If data for the asset pair exists, it appends to it; otherwise, it creates a new entry.
 * @param assetPair - The asset pair key, like "USDT-ETH".
 * @param data - Array of [timestamp, volume, open, close] tuples to be added or updated.
 * @returns void
 */
export async function upsertAssetPair(assetPair: string, data: [number, number, number, number][]): Promise<void> {
  const marketData = await getOrCreateMarketData();
  const existingData = marketData.assets.get(assetPair) || { series: [] };
  existingData.series.push(...data);
  marketData.assets.set(assetPair, existingData);
  await marketData.save();
  console.log("Asset pair data upserted successfully.");
}

/**
 * Appends new asset pair data ensuring chronological order.
 * @param marketDataId - The ID of the MarketData document.
 * @param assetPair - The asset pair key, like "USDT-ETH".
 * @param data - Array of [timestamp, volume, open, close] tuples to be appended.
 * @returns void
 */
export async function appendAssetPairData(
  marketDataId: string,
  assetPair: string,
  data: AssetDataTuple[]
): Promise<void> {
  const marketData = await MarketData.findById(marketDataId);
  if (!marketData) {
    throw new Error("MarketData document not found.");
  }

  // Regex to check for the format "AAA-BBB", where AAA and BBB are uppercase letters (ticker symbols).
  const assetPairRegex = /^[A-Z]{2,5}-[A-Z]{2,5}$/;
  if (!assetPairRegex.test(assetPair)) {
    throw new Error(
      "Asset pair must be in the format 'TICKER-TICKER', with each ticker being 2 to 5 uppercase letters."
    );
  }

  // Check to ensure new time series received is in order and comes after the latest timestamped item in the series.
  const assetData = marketData.assets.get(assetPair) || { series: [] };
  if (data.length > 0) {
    // Check if data itself is in chronological order.
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] <= data[i - 1][0]) {
        throw new Error("New data must be chronologically ordered.");
      }
    }

    // Check the first new tuple against the last existing tuple.
    if (assetData.series.length > 0 && data[0][0] <= assetData.series[assetData.series.length - 1][0]) {
      throw new Error("New data must be chronologically after the last entry in the series.");
    }
  }

  // Append new data.
  assetData.series.push(...data);
  marketData.assets.set(assetPair, assetData);
  await marketData.save();
  console.log("Asset pair data appended successfully.");
}

/**
 * Appends new TVL data ensuring chronological order.
 * @param strategyId - The strategy ID associated with the TVL data.
 * @param data - Array of [timestamp, amount] tuples to be appended.
 * @returns void
 */
export async function appendTVLData(strategyId: string, data: TVLDataTuple[]): Promise<void> {
  const marketData = await getOrCreateMarketData();

  const tvlData = marketData.tvl.get(strategyId) || { series: [] };
  if (tvlData.series.length > 0 && data[0][0] <= tvlData.series[tvlData.series.length - 1][0]) {
    throw new Error("New data must be chronologically after the last entry in the series.");
  }

  // Append new data.
  tvlData.series.push(...data);
  marketData.tvl.set(strategyId, tvlData);
  await marketData.save();
  console.log("TVL data appended successfully.");
}


/**
 * Retrieves or creates the singleton instance of the Directory.
 * @returns A promise that resolves to the directory instance.
 */
export async function getOrCreateDirectory(): Promise<IDirectory> {
  let directory = await Directory.findOne();
  if (!directory) {
    directory = new Directory({ strategies: new Map() });
    await directory.save();
  }
  return directory;
}

/**
 * Retrieves or creates the singleton instance of MarketData.
 * @returns A promise that resolves to the market data instance.
 */
export async function getOrCreateMarketData(): Promise<IMarketData> {
  let marketData = await MarketData.findOne();
  if (!marketData) {
    marketData = new MarketData({ tvl: new Map(), assets: new Map() });
    await marketData.save();
  }
  return marketData;
}