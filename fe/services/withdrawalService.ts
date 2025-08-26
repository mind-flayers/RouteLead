import { Config } from '@/constants/Config';

// Use the same API base URL as the main apiService
const API_BASE_URL = Config.API_BASE;

// Withdrawal-related interfaces
export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode?: string;
  swiftCode?: string;
}

export interface WithdrawalRequest {
  driverId: string;
  amount: number;
  bankDetails: BankDetails;
}

export interface WithdrawalHistory {
  id: string;
  driverId: string;
  amount: number;
  bankDetails: BankDetails;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  driverName?: string;
}

export interface AvailableBalanceResponse {
  availableBalance: number;
}

// Withdrawal API methods
export class WithdrawalAPI {
  /**
   * Get available balance for withdrawal
   */
  static async getAvailableBalance(driverId: string): Promise<AvailableBalanceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/driver/${driverId}/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get available balance');
      }
    } catch (error) {
      console.error('Error getting available balance:', error);
      throw error;
    }
  }

  /**
   * Create a new withdrawal request
   */
  static async createWithdrawal(withdrawalRequest: WithdrawalRequest): Promise<WithdrawalHistory> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create withdrawal');
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal history for a driver
   */
  static async getWithdrawalHistory(driverId: string): Promise<WithdrawalHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/driver/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get withdrawal history');
      }
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal by ID
   */
  static async getWithdrawal(withdrawalId: string): Promise<WithdrawalHistory> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/${withdrawalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get withdrawal');
      }
    } catch (error) {
      console.error('Error getting withdrawal:', error);
      throw error;
    }
  }
}

// Bank Details API methods
export class BankDetailsAPI {
  /**
   * Get bank details for a driver
   */
  static async getBankDetails(driverId: string): Promise<BankDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${driverId}/bank-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No bank details found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return Object.keys(data.data).length === 0 ? null : data.data;
      } else {
        throw new Error(data.message || 'Failed to get bank details');
      }
    } catch (error) {
      console.error('Error getting bank details:', error);
      throw error;
    }
  }

  /**
   * Update bank details for a driver
   */
  static async updateBankDetails(driverId: string, bankDetails: BankDetails): Promise<BankDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${driverId}/bank-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankDetails),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update bank details');
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  }
}
