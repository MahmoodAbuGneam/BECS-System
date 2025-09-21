// Real API service for BECS backend integration

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface BloodInventory {
  blood_type: string;
  units_available: number;
  units_reserved: number;
  low_stock_threshold: number;
  last_updated: string;
}

export interface Donor {
  donor_id: string;
  full_name: string;
  blood_type: string;
  donation_date?: string;
}

export interface Transaction {
  transaction_type: string;
  blood_type: string;
  units: number;
  timestamp: string;
  notes?: string;
}

export interface RoutineRequest {
  blood_type: string;
  units: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  alternatives?: { blood_type: string; available: number }[];
  units_provided?: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request("/health");
  }

  // Get current inventory
  async getInventory(): Promise<BloodInventory[]> {
    return this.request("/api/inventory");
  }

  // Record a donation
  async recordDonation(donor: Donor): Promise<ApiResponse<any>> {
    return this.request("/api/donations", {
      method: "POST",
      body: JSON.stringify({
        donor_id: donor.donor_id,
        full_name: donor.full_name,
        blood_type: donor.blood_type,
        donation_date: donor.donation_date || new Date().toISOString(),
        units_collected: 1,
      }),
    });
  }

  // Request routine distribution
  async requestRoutineDistribution(
    bloodType: string,
    units: number
  ): Promise<ApiResponse<any>> {
    return this.request("/api/distribute/routine", {
      method: "POST",
      body: JSON.stringify({
        blood_type: bloodType,
        units: units,
      }),
    });
  }

  // Request emergency distribution
  async requestEmergencyDistribution(): Promise<ApiResponse<any>> {
    return this.request("/api/distribute/emergency", {
      method: "POST",
    });
  }

  // Get recent transactions
  async getTransactions(): Promise<Transaction[]> {
    return this.request("/api/transactions");
  }
}

export const apiService = new ApiService();
