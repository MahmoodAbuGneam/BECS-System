import { useState, useEffect } from "react";
import { apiService } from "../services/hybridApiService";

interface EmergencyDistributionProps {
  onNavigate: (page: string) => void;
}

const EmergencyDistribution: React.FC<EmergencyDistributionProps> = ({
  onNavigate,
}) => {
  const [oNegativeStock, setONegativeStock] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    unitsProvided?: number;
  } | null>(null);

  useEffect(() => {
    loadONegativeStock();
  }, []);

  const loadONegativeStock = async () => {
    try {
      const inventory = await apiService.getInventory();
      const oNegative = inventory.find((item) => item.blood_type === "O-");
      setONegativeStock(oNegative?.units_available || 0);
    } catch (error) {
      console.error("Failed to load O- stock:", error);
    }
  };

  const handleEmergencyDispense = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.requestEmergencyDistribution();
      setResult(response);

      if (response.success) {
        setONegativeStock(0); // All units dispensed
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process emergency distribution",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = () => {
    if (oNegativeStock === 0) return "var(--alert-red)";
    if (oNegativeStock <= 5) return "var(--warning-orange)";
    return "var(--success-green)";
  };

  const getStockStatusText = () => {
    if (oNegativeStock === 0) return "CRITICAL - NO STOCK";
    if (oNegativeStock <= 5) return "LOW STOCK WARNING";
    return "STOCK AVAILABLE";
  };

  return (
    <div>
      <div className="nav-header">
        <h2>🚨 Emergency Distribution</h2>
        <button className="btn" onClick={() => onNavigate("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
        {/* Emergency Protocol Header */}
        <div
          style={{
            padding: "var(--spacing-lg)",
            background:
              "linear-gradient(135deg, var(--alert-red), var(--alert-red-light))",
            color: "var(--medical-white)",
            borderRadius: "var(--border-radius-xl)",
            marginBottom: "var(--spacing-lg)",
            boxShadow: "0 0 30px rgba(225, 29, 72, 0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0" }}>⚡ EMERGENCY PROTOCOL</h3>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>
            Universal Donor Blood (O-) Only
          </p>
        </div>

        {/* O- Stock Display */}
        <div
          style={{
            padding: "2rem",
            border: `3px solid ${getStockStatusColor()}`,
            borderRadius: "12px",
            background:
              oNegativeStock === 0
                ? "linear-gradient(135deg, rgba(225, 29, 72, 0.1), rgba(244, 63, 94, 0.05))"
                : oNegativeStock <= 5
                ? "linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(251, 146, 60, 0.05))"
                : "linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(52, 211, 153, 0.05))",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", color: getStockStatusColor() }}>
            O- BLOOD STOCK
          </h2>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: getStockStatusColor(),
            }}
          >
            {oNegativeStock}
          </div>
          <div style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
            Units Available
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              color: getStockStatusColor(),
              marginTop: "1rem",
            }}
          >
            {getStockStatusText()}
          </div>
        </div>

        {/* Emergency Dispense Button */}
        <button
          onClick={handleEmergencyDispense}
          disabled={loading || oNegativeStock === 0}
          className="btn btn-danger"
          style={{
            fontSize: "1.5rem",
            padding: "1rem 2rem",
            width: "100%",
            marginBottom: "2rem",
            opacity: oNegativeStock === 0 ? 0.5 : 1,
          }}
        >
          {loading
            ? "DISPENSING..."
            : oNegativeStock === 0
            ? "NO STOCK AVAILABLE"
            : `🩸 DISPENSE ALL O- UNITS (${oNegativeStock})`}
        </button>

        {/* Result Message */}
        {result && (
          <div
            className={`alert ${
              result.success ? "alert-success" : "alert-error"
            }`}
          >
            <strong>{result.message}</strong>
            {result.unitsProvided && (
              <div style={{ marginTop: "0.5rem" }}>
                Units Dispensed: <strong>{result.unitsProvided}</strong>
              </div>
            )}
          </div>
        )}

        {/* Emergency Protocol Information */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(37, 99, 235, 0.05)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h4>🚨 Emergency Protocol Guidelines:</h4>
          <ul style={{ margin: "0.5rem 0" }}>
            <li>
              <strong>O- Blood Only:</strong> Universal donor, safe for all
              patients
            </li>
            <li>
              <strong>All Available Units:</strong> Dispenses maximum available
              stock
            </li>
            <li>
              <strong>No Compatibility Testing:</strong> Immediate dispensing
              for critical situations
            </li>
            <li>
              <strong>Mass Casualty Events:</strong> Use when multiple patients
              need immediate transfusion
            </li>
          </ul>

          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem",
              background: "rgba(234, 88, 12, 0.1)",
              borderRadius: "var(--border-radius)",
              border: "1px solid rgba(234, 88, 12, 0.3)",
              borderLeft: "4px solid var(--warning-orange)",
            }}
          >
            <strong>⚠️ Warning:</strong> Emergency distribution depletes O-
            stock completely. Coordinate with blood collection centers for
            immediate restocking.
          </div>
        </div>

        {/* Refresh Stock Button */}
        <button
          onClick={loadONegativeStock}
          className="btn"
          style={{ marginTop: "1rem" }}
        >
          🔄 Refresh Stock Status
        </button>
      </div>
    </div>
  );
};

export default EmergencyDistribution;
