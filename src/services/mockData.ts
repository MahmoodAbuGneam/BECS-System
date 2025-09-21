// Mock data service for BECS frontend-only version

export interface BloodInventory {
  bloodType: string;
  unitsAvailable: number;
  lowStockThreshold: number;
}

export interface Donor {
  donorId: string;
  fullName: string;
  bloodType: string;
  donationDate: string;
}

export interface Transaction {
  id: string;
  type: "donation" | "routine" | "emergency";
  bloodType: string;
  units: number;
  timestamp: string;
  notes?: string;
}

// Mock inventory data
let mockInventory: BloodInventory[] = [
  { bloodType: "A+", unitsAvailable: 25, lowStockThreshold: 5 },
  { bloodType: "A-", unitsAvailable: 8, lowStockThreshold: 5 },
  { bloodType: "B+", unitsAvailable: 15, lowStockThreshold: 5 },
  { bloodType: "B-", unitsAvailable: 3, lowStockThreshold: 5 },
  { bloodType: "AB+", unitsAvailable: 12, lowStockThreshold: 5 },
  { bloodType: "AB-", unitsAvailable: 2, lowStockThreshold: 5 },
  { bloodType: "O+", unitsAvailable: 30, lowStockThreshold: 5 },
  { bloodType: "O-", unitsAvailable: 7, lowStockThreshold: 5 },
];

let mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "donation",
    bloodType: "O+",
    units: 1,
    timestamp: new Date().toISOString(),
    notes: "Regular donation",
  },
];

let mockDonors: Donor[] = [
  {
    donorId: "123456789",
    fullName: "John Doe",
    bloodType: "O+",
    donationDate: new Date().toISOString().split("T")[0],
  },
];

// Blood compatibility matrix
const COMPATIBILITY_MATRIX: Record<string, string[]> = {
  "A+": ["A+", "AB+"],
  "A-": ["A+", "A-", "AB+", "AB-"],
  "B+": ["B+", "AB+"],
  "B-": ["B+", "B-", "AB+", "AB-"],
  "AB+": ["AB+"],
  "AB-": ["AB+", "AB-"],
  "O+": ["A+", "B+", "AB+", "O+"],
  "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
};

const RARITY_ORDER = ["O-", "AB-", "A-", "B-", "AB+", "B+", "A+", "O+"];

// Mock API functions
export const mockAPI = {
  // Get current inventory
  getInventory: (): Promise<BloodInventory[]> => {
    return Promise.resolve([...mockInventory]);
  },

  // Record a donation
  recordDonation: (
    donor: Omit<Donor, "donationDate">
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Add donor to list
        const newDonor: Donor = {
          ...donor,
          donationDate: new Date().toISOString().split("T")[0],
        };
        mockDonors.push(newDonor);

        // Update inventory
        const inventoryItem = mockInventory.find(
          (item) => item.bloodType === donor.bloodType
        );
        if (inventoryItem) {
          inventoryItem.unitsAvailable += 1;
        }

        // Add transaction
        const transaction: Transaction = {
          id: Date.now().toString(),
          type: "donation",
          bloodType: donor.bloodType,
          units: 1,
          timestamp: new Date().toISOString(),
          notes: `Donation from ${donor.fullName}`,
        };
        mockTransactions.push(transaction);

        resolve({ success: true, message: "Donation recorded successfully!" });
      }, 500);
    });
  },

  // Request routine distribution
  requestRoutineDistribution: (
    bloodType: string,
    units: number
  ): Promise<{
    success: boolean;
    message: string;
    unitsProvided?: number;
    alternatives?: { bloodType: string; available: number }[];
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const inventoryItem = mockInventory.find(
          (item) => item.bloodType === bloodType
        );

        if (!inventoryItem) {
          resolve({ success: false, message: "Invalid blood type" });
          return;
        }

        if (inventoryItem.unitsAvailable >= units) {
          // Sufficient stock available
          inventoryItem.unitsAvailable -= units;

          const transaction: Transaction = {
            id: Date.now().toString(),
            type: "routine",
            bloodType: bloodType,
            units: units,
            timestamp: new Date().toISOString(),
            notes: `Routine distribution`,
          };
          mockTransactions.push(transaction);

          resolve({
            success: true,
            message: `Successfully distributed ${units} units of ${bloodType}`,
            unitsProvided: units,
          });
        } else {
          // Insufficient stock - suggest alternatives
          const alternatives = getCompatibleAlternatives(bloodType);
          resolve({
            success: false,
            message: `Insufficient stock. Only ${inventoryItem.unitsAvailable} units available.`,
            alternatives,
          });
        }
      }, 500);
    });
  },

  // Emergency distribution (O- only)
  requestEmergencyDistribution: (): Promise<{
    success: boolean;
    message: string;
    unitsProvided?: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const oNegativeItem = mockInventory.find(
          (item) => item.bloodType === "O-"
        );

        if (!oNegativeItem || oNegativeItem.unitsAvailable === 0) {
          resolve({
            success: false,
            message: "No O- blood available for emergency distribution!",
          });
          return;
        }

        const unitsToDispense = oNegativeItem.unitsAvailable;
        oNegativeItem.unitsAvailable = 0;

        const transaction: Transaction = {
          id: Date.now().toString(),
          type: "emergency",
          bloodType: "O-",
          units: unitsToDispense,
          timestamp: new Date().toISOString(),
          notes: "Emergency distribution",
        };
        mockTransactions.push(transaction);

        resolve({
          success: true,
          message: `Emergency distribution: ${unitsToDispense} units of O- blood dispensed`,
          unitsProvided: unitsToDispense,
        });
      }, 300);
    });
  },

  // Get recent transactions
  getTransactions: (): Promise<Transaction[]> => {
    return Promise.resolve([...mockTransactions].reverse().slice(0, 10));
  },
};

// Helper function to get compatible alternatives
function getCompatibleAlternatives(
  requestedType: string
): { bloodType: string; available: number }[] {
  const alternatives: { bloodType: string; available: number }[] = [];

  // Find which blood types can donate to the requested type
  for (const [donorType, canDonateTo] of Object.entries(COMPATIBILITY_MATRIX)) {
    if (canDonateTo.includes(requestedType)) {
      const inventory = mockInventory.find(
        (item) => item.bloodType === donorType
      );
      if (inventory && inventory.unitsAvailable > 0) {
        alternatives.push({
          bloodType: donorType,
          available: inventory.unitsAvailable,
        });
      }
    }
  }

  // Sort by rarity (rarest first for better conservation)
  alternatives.sort((a, b) => {
    const rarityA = RARITY_ORDER.indexOf(a.bloodType);
    const rarityB = RARITY_ORDER.indexOf(b.bloodType);
    return rarityA - rarityB;
  });

  return alternatives;
}
