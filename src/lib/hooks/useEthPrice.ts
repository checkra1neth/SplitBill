import { useState, useEffect } from 'react';
import { getEthPrice, getCachedEthPrice } from '@/lib/utils/priceOracle';

/**
 * Hook to get current ETH price in USD
 * Automatically refreshes EVERY SECOND for real-time updates
 * @returns Object with price, loading state, and error
 */
export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(getCachedEthPrice());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        const newPrice = await getEthPrice();
        
        if (isMounted) {
          setPrice(newPrice);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchPrice();

    // Refresh EVERY SECOND for real-time updates
    const interval = setInterval(fetchPrice, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, isLoading, error };
}
