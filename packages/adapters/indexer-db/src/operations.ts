import {
  IDirectory,
  Directory,
  IStrategy,
  IMarketData,
  MarketData,
  TVLDataTuple,
  AssetDataTuple
} from "./schema";

/// ------- Directory Methods -------
/**
 * Retrieves or creates the single instance of the Directory.
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

/// ------- Strategy Methods -------
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

/// ------- Market Data Methods -------
/**
 * Retrieves or creates the single instance of MarketData.
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

/// ------- Asset Pair Methods -------
/**
 * Appends new asset pair data ensuring chronological order.
 * @param assetPair - The asset pair key, like "USDT-ETH".
 * @param data - Array of [timestamp, volume, open, close] tuples to be appended.
 * @returns void
 */
export async function appendAssetPairData(
  assetPair: string,
  data: AssetDataTuple[]
): Promise<void> {
  const marketData = await getOrCreateMarketData();

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
 * Inserts asset pair data in the correct chronological location.
 * @param assetPair - The asset pair key, like "USDT-ETH".
 * @param newData - Array of [timestamp, volume, open, close] tuples to be inserted.
 * @returns void
 */
export async function insertAssetPairData(assetPair: string, newData: AssetDataTuple[]): Promise<void> {
  const marketData = await getOrCreateMarketData();

  const assetData = marketData.assets.get(assetPair) || { series: [] as AssetDataTuple[] };
  
  // Insert each new data tuple in the correct chronological position
  newData.forEach((newTuple) => {
    const pos = assetData.series.findIndex((existingTuple) => existingTuple[0] > newTuple[0]);
    if (pos === -1) {
      assetData.series.push(newTuple); // Append at the end if all existing tuples are earlier
    } else {
      assetData.series.splice(pos, 0, newTuple); // Insert at the found position
    }
  });

  marketData.assets.set(assetPair, assetData);
  await marketData.save();
  console.log("Asset pair data inserted successfully.");
}

/// ------- TVL Methods -------
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
 * Inserts TVL data in the correct chronological location.
 * @param strategyId - The strategy ID associated with the TVL data.
 * @param newData - Array of [timestamp, amount] tuples to be inserted.
 * @returns void
 */
export async function insertTVLData(strategyId: string, newData: TVLDataTuple[]): Promise<void> {
  const marketData = await getOrCreateMarketData();

  const tvlData = marketData.tvl.get(strategyId) || { series: [] as TVLDataTuple[] };
  
  // Insert each new data tuple in the correct chronological position
  newData.forEach((newTuple) => {
    const pos = tvlData.series.findIndex((existingTuple) => existingTuple[0] > newTuple[0]);
    if (pos === -1) {
      tvlData.series.push(newTuple); // Append at the end if all existing tuples are earlier
    } else {
      tvlData.series.splice(pos, 0, newTuple); // Insert at the found position
    }
  });

  marketData.tvl.set(strategyId, tvlData);
  await marketData.save();
  console.log("TVL data inserted successfully.");
}

