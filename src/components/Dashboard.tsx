import React, { useState, useEffect } from "react";
import { apiService, BloodInventory } from "../services/hybridApiService";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await apiService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: BloodInventory) => {
    if (item.units_available === 0) return "critical-stock";
    if (item.units_available <= item.low_stock_threshold) return "low-stock";
    return "";
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  const totalUnits = inventory.reduce(
    (sum, item) => sum + item.units_available,
    0
  );
  const criticalCount = inventory.filter(
    (item) => item.units_available === 0
  ).length;
  const lowStockCount = inventory.filter(
    (item) =>
      item.units_available > 0 &&
      item.units_available <= item.low_stock_threshold
  ).length;

  return (
    <div>
      <div className="nav-header">
        <h2>🩸 Blood Inventory Dashboard</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            fontSize: "0.9rem",
            color: "#64748b",
          }}
        >
          <span>
            Total Units: <strong>{totalUnits}</strong>
          </span>
          <span>
            Critical:{" "}
            <strong style={{ color: "var(--alert-red)" }}>
              {criticalCount}
            </strong>
          </span>
          <span>
            Low Stock:{" "}
            <strong style={{ color: "var(--warning-orange)" }}>
              {lowStockCount}
            </strong>
          </span>
        </div>
      </div>

      {/* Alert Banner for Critical Stock */}
      {criticalCount > 0 && (
        <div
          className="alert alert-error"
          style={{
            background:
              "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.05))",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "var(--border-radius)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          <strong>🚨 CRITICAL ALERT:</strong> {criticalCount} blood type(s) are
          completely out of stock!
        </div>
      )}

      <div className="blood-type-grid">
        {inventory.map((item) => (
          <div
            key={item.blood_type}
            className={`blood-type-card ${getStockStatus(item)}`}
          >
            <h3>{item.blood_type}</h3>
            <p>
              <strong>{item.units_available}</strong> units
            </p>
            {item.units_available <= item.low_stock_threshold &&
              item.units_available > 0 && (
                <p className="alert-text">⚠️ Low Stock</p>
              )}
            {item.units_available === 0 && (
              <p className="alert-text">🚨 Critical</p>
            )}

            {/* Mini progress bar */}
            <div
              style={{
                width: "100%",
                height: "4px",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
                marginTop: "0.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((item.units_available / 20) * 100, 100)}%`,
                  height: "100%",
                  background:
                    item.units_available === 0
                      ? "var(--alert-red)"
                      : item.units_available <= item.low_stock_threshold
                      ? "var(--warning-orange)"
                      : "var(--success-green)",
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <h3
          style={{
            textAlign: "center",
            marginBottom: "var(--spacing-lg)",
            color: "var(--primary-navy)",
          }}
        >
          Quick Actions
        </h3>
        <div className="action-buttons">
          <button
            className="btn btn-success"
            onClick={() => onNavigate("donation")}
          >
            <span style={{ marginRight: "0.5rem" }}>📝</span>
            Record Donation
          </button>
          <button className="btn" onClick={() => onNavigate("routine")}>
            <span style={{ marginRight: "0.5rem" }}>🏥</span>
            Routine Distribution
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onNavigate("emergency")}
          >
            <span style={{ marginRight: "0.5rem" }}>🚨</span>
            Emergency Distribution
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
