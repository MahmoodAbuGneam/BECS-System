// Hybrid API service that works with both real backend and mock data for GitHub Pages

import { mockAPI } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const USE_MOCK_DATA = !API_BASE_URL; // Use mock data if no API URL is set

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

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  alternatives?: { blood_type: string; available: number }[];
  units_provided?: number;
}

class HybridApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If no API URL is configured, use mock data
    if (USE_MOCK_DATA) {
      console.log("🔄 Using mock data (GitHub Pages mode)");
      return this.handleMockRequest<T>(endpoint, options);
    }

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
      console.log("🔄 Falling back to mock data");
      return this.handleMockRequest<T>(endpoint, options);
    }
  }

  private async handleMockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Route to appropriate mock API method based on endpoint
    switch (endpoint) {
      case "/health":
        return {
          status: "healthy",
          service: "becs-mock",
          database: "mock",
        } as T;

      case "/api/inventory":
        return mockAPI.getInventory() as T;

      case "/api/donations":
        if (options.method === "POST") {
          const body = JSON.parse(options.body as string);
          return mockAPI.recordDonation({
            donorId: body.donor_id,
            fullName: body.full_name,
            bloodType: body.blood_type,
          }) as T;
        }
        break;

      case "/api/distribute/routine":
        if (options.method === "POST") {
          const body = JSON.parse(options.body as string);
          return mockAPI.requestRoutineDistribution(
            body.blood_type,
            body.units
          ) as T;
        }
        break;

      case "/api/distribute/emergency":
        if (options.method === "POST") {
          return mockAPI.requestEmergencyDistribution() as T;
        }
        break;

      case "/api/transactions":
        return mockAPI.getTransactions() as T;

      default:
        throw new Error(`Mock endpoint not implemented: ${endpoint}`);
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`);
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

export const apiService = new HybridApiService();
