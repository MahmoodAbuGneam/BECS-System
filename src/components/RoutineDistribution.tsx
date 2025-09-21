import React, { useState } from "react";
import { apiService } from "../services/apiService";

interface RoutineDistributionProps {
  onNavigate: (page: string) => void;
}

const RoutineDistribution: React.FC<RoutineDistributionProps> = ({
  onNavigate,
}) => {
  const [formData, setFormData] = useState({
    bloodType: "",
    units: 1,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    alternatives?: { bloodType: string; available: number }[];
  } | null>(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "units" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bloodType || formData.units < 1) {
      setResult({
        success: false,
        message: "Please select blood type and valid unit count",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.requestRoutineDistribution(
        formData.bloodType,
        formData.units
      );
      setResult(response);

      if (response.success) {
        setFormData({ bloodType: "", units: 1 });
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process distribution request",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativeRequest = async (bloodType: string) => {
    setLoading(true);
    try {
      const response = await apiService.requestRoutineDistribution(
        bloodType,
        formData.units
      );
      setResult(response);
      if (response.success) {
        setFormData({ bloodType: "", units: 1 });
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process alternative request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="nav-header">
        <h2>🏥 Routine Distribution</h2>
        <button className="btn" onClick={() => onNavigate("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(13, 148, 136, 0.05)",
            border: "1px solid rgba(13, 148, 136, 0.2)",
            borderRadius: "var(--border-radius)",
            padding: "var(--spacing-lg)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bloodType">
                <span style={{ marginRight: "0.5rem" }}>🩸</span>
                Requested Blood Type
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                required
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <option value="">Select blood type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="units">
                <span style={{ marginRight: "0.5rem" }}>📊</span>
                Number of Units
              </label>
              <input
                type="number"
                id="units"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                min="1"
                max="20"
                required
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                fontSize: "1.1rem",
                marginTop: "var(--spacing-md)",
              }}
            >
              {loading ? (
                <>
                  <span style={{ marginRight: "0.5rem" }}>⏳</span>
                  Processing Request...
                </>
              ) : (
                <>
                  <span style={{ marginRight: "0.5rem" }}>🔄</span>
                  Request Blood Units
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div
            className={`alert ${
              result.success ? "alert-success" : "alert-error"
            }`}
            style={{
              borderRadius: "var(--border-radius)",
              backdropFilter: "blur(10px)",
            }}
          >
            {result.message}
          </div>
        )}

        {result &&
          !result.success &&
          result.alternatives &&
          result.alternatives.length > 0 && (
            <div
              style={{
                marginTop: "var(--spacing-md)",
                padding: "var(--spacing-lg)",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--border-radius)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h4
                style={{
                  color: "var(--warning-amber)",
                  marginBottom: "var(--spacing-md)",
                }}
              >
                <span style={{ marginRight: "0.5rem" }}>🔄</span>
                Compatible Alternatives Available
              </h4>
              <p
                style={{
                  marginBottom: "var(--spacing-md)",
                  color: "var(--primary-navy)",
                }}
              >
                The following compatible blood types are available:
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-sm)",
                }}
              >
                {result.alternatives.map((alt) => (
                  <div
                    key={alt.bloodType}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "var(--spacing-md)",
                      background: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "var(--border-radius)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      <strong style={{ color: "var(--accent-teal)" }}>
                        {alt.bloodType}
                      </strong>{" "}
                      - {alt.available} units available
                    </span>
                    <button
                      className={`btn ${
                        alt.available >= formData.units ? "btn-success" : ""
                      }`}
                      onClick={() => handleAlternativeRequest(alt.bloodType)}
                      disabled={loading || alt.available < formData.units}
                      style={{ minWidth: "120px" }}
                    >
                      {alt.available >= formData.units
                        ? "Use This Type"
                        : "Insufficient"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="compatibility-info">
          <h4>
            <span style={{ marginRight: "0.5rem" }}>🧬</span>
            Blood Compatibility Guide
          </h4>
          <div
            style={{
              textAlign: "left",
              fontSize: "0.95rem",
              lineHeight: "1.6",
            }}
          >
            <p>
              <strong>Universal Recipients:</strong> AB+ (can receive all types)
            </p>
            <p>
              <strong>Universal Donors:</strong> O- (can donate to all types)
            </p>
            <p>
              <strong>Rh Factor:</strong> Rh- can receive Rh- only, Rh+ can
              receive both
            </p>
            <p>
              <strong>Priority:</strong> System recommends rarest compatible
              types first for conservation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineDistribution;
