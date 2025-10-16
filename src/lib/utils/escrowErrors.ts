/**
 * Escrow error handling utilities
 * Provides user-friendly error messages and error parsing
 */

import { BaseError, ContractFunctionRevertedError } from 'viem';

export interface EscrowError {
  title: string;
  message: string;
  action?: string;
}

/**
 * Parse contract revert errors into user-friendly messages
 */
export function parseContractError(error: unknown): EscrowError {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError,
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? '';
      const args = revertError.data?.args as unknown[];

      // Handle specific contract errors
      switch (errorName) {
        case 'BillExists':
          return {
            title: 'Bill Already Exists',
            message:
              'This bill has already been created in the escrow contract.',
            action: 'Please use a different bill or proceed with direct payment.',
          };

        case 'AlreadyPaid':
          return {
            title: 'Already Paid',
            message: 'You have already paid your share for this bill.',
            action: 'No further action needed.',
          };

        case 'NotParticipant':
          return {
            title: 'Not a Participant',
            message: 'You are not listed as a participant in this bill.',
            action: 'Please contact the bill creator.',
          };

        case 'IncorrectAmount':
          if (args && args.length >= 2) {
            const expected = args[0];
            const actual = args[1];
            return {
              title: 'Incorrect Payment Amount',
              message: `Expected ${expected} wei but received ${actual} wei.`,
              action: 'Please pay the exact amount specified.',
            };
          }
          return {
            title: 'Incorrect Payment Amount',
            message: 'The payment amount does not match your share.',
            action: 'Please pay the exact amount specified.',
          };

        case 'BillNotFound':
          return {
            title: 'Bill Not Found',
            message: 'This bill does not exist in the escrow contract.',
            action: 'Please verify the bill ID or create a new bill.',
          };

        default:
          return {
            title: 'Contract Error',
            message: errorName || 'The smart contract rejected the transaction.',
            action: 'Please try again or contact support.',
          };
      }
    }

    // Handle user rejection
    if (error.message.includes('User rejected') || error.message.includes('rejected')) {
      return {
        title: 'Transaction Rejected',
        message: 'You rejected the transaction in your wallet.',
        action: 'Click the button again to retry.',
      };
    }

    // Handle insufficient funds
    if (error.message.includes('insufficient funds')) {
      return {
        title: 'Insufficient Funds',
        message: 'You do not have enough ETH to cover the transaction and gas fees.',
        action: 'Please add more ETH to your wallet.',
      };
    }

    // Handle network errors
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to the blockchain network.',
        action: 'Please check your connection and try again.',
      };
    }
  }

  // Generic error fallback
  return {
    title: 'Transaction Failed',
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
    action: 'Please try again.',
  };
}

/**
 * Check if wallet is connected
 */
export function validateWalletConnection(address?: string): void {
  if (!address) {
    throw new Error('Please connect your wallet to continue.');
  }
}

/**
 * Check if user is on the correct network
 */
export function validateNetwork(chainId?: number, expectedChainId?: number): void {
  if (!chainId) {
    throw new Error('Unable to detect network. Please check your wallet connection.');
  }

  if (expectedChainId && chainId !== expectedChainId) {
    throw new Error(
      `Wrong network. Please switch to Base Sepolia (Chain ID: ${expectedChainId}).`,
    );
  }
}

/**
 * Estimate if user has sufficient balance for transaction
 */
export function validateSufficientBalance(
  balance?: bigint,
  amount?: bigint,
  estimatedGas?: bigint,
): void {
  if (balance === undefined || amount === undefined) {
    return; // Skip validation if data not available
  }

  const totalRequired = amount + (estimatedGas || BigInt(0));

  if (balance < totalRequired) {
    throw new Error(
      'Insufficient balance. You need more ETH to cover the payment and gas fees.',
    );
  }
}
