/**
 * Price Oracle for ETH/USD conversion
 * Fetches real-time ETH price from multiple sources
 * NO FALLBACK - Always uses real-time data
 */

// Cache duration: 1 second for real-time updates
const CACHE_DURATION = 1000;

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

/**
 * Fetch ETH price from CoinGecko (free, no API key needed)
 */
async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.ethereum?.usd || null;
  } catch (error) {
    console.warn('CoinGecko API failed:', error);
    return null;
  }
}

/**
 * Fetch ETH price from Coinbase (backup)
 */
async function fetchFromCoinbase(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return parseFloat(data.data?.rates?.USD) || null;
  } catch (error) {
    console.warn('Coinbase API failed:', error);
    return null;
  }
}

/**
 * Fetch ETH price from Binance (backup)
 */
async function fetchFromBinance(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return parseFloat(data.price) || null;
  } catch (error) {
    console.warn('Binance API failed:', error);
    return null;
  }
}

/**
 * Get current ETH price in USD
 * Tries multiple sources - ALWAYS returns real-time data, no fallback
 * @returns ETH price in USD
 * @throws Error if all sources fail
 */
export async function getEthPrice(): Promise<number> {
  // Check cache first (1 second cache)
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.price;
  }

  // Try multiple sources in order
  const sources = [
    fetchFromCoinGecko,
    fetchFromCoinbase,
    fetchFromBinance,
  ];

  for (const fetchPrice of sources) {
    const price = await fetchPrice();
    if (price && price > 0) {
      // Update cache
      priceCache = {
        price,
        timestamp: Date.now(),
      };
      return price;
    }
  }

  // All sources failed - throw error, NO FALLBACK
  throw new Error('Unable to fetch real-time ETH price. Please check your internet connection and try again.');
}

/**
 * Convert USD amount to ETH using current price
 * @param usdAmount - Amount in USD
 * @returns Amount in ETH
 */
export async function usdToEth(usdAmount: number): Promise<number> {
  const ethPrice = await getEthPrice();
  return usdAmount / ethPrice;
}

/**
 * Convert ETH amount to USD using current price
 * @param ethAmount - Amount in ETH
 * @returns Amount in USD
 */
export async function ethToUsd(ethAmount: number): Promise<number> {
  const ethPrice = await getEthPrice();
  return ethAmount * ethPrice;
}

/**
 * Get cached price without fetching (for display purposes)
 * @returns Cached price or null if no cache available
 */
export function getCachedEthPrice(): number | null {
  return priceCache?.price || null;
}

/**
 * Clear price cache (useful for testing)
 */
export function clearPriceCache(): void {
  priceCache = null;
}
