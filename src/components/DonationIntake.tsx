import { useState } from "react";
import { apiService } from "../services/hybridApiService";

interface DonationIntakeProps {
  onNavigate: (page: string) => void;
}

const DonationIntake: React.FC<DonationIntakeProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    donorId: "",
    fullName: "",
    bloodType: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.donorId || !formData.fullName || !formData.bloodType) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await apiService.recordDonation({
        donor_id: formData.donorId,
        full_name: formData.fullName,
        blood_type: formData.bloodType,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Donation recorded successfully!",
        });
        setFormData({ donorId: "", fullName: "", bloodType: "" });
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to record donation",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to record donation",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="nav-header">
        <h2>📝 Donation Intake</h2>
        <button className="btn" onClick={() => onNavigate("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
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
              <label htmlFor="donorId">
                <span style={{ marginRight: "0.5rem" }}>🆔</span>
                Donor ID
              </label>
              <input
                type="text"
                id="donorId"
                name="donorId"
                value={formData.donorId}
                onChange={handleInputChange}
                placeholder="Enter donor ID (e.g., 123456789)"
                required
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                <span style={{ marginRight: "0.5rem" }}>👤</span>
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter donor's full name"
                required
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bloodType">
                <span style={{ marginRight: "0.5rem" }}>🩸</span>
                Blood Type
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

            <button
              type="submit"
              className="btn btn-success"
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
                  Recording Donation...
                </>
              ) : (
                <>
                  <span style={{ marginRight: "0.5rem" }}>✅</span>
                  Record Donation
                </>
              )}
            </button>
          </form>
        </div>

        {message && (
          <div
            className={`alert ${
              message.type === "success" ? "alert-success" : "alert-error"
            }`}
            style={{
              borderRadius: "var(--border-radius)",
              backdropFilter: "blur(10px)",
            }}
          >
            {message.text}
          </div>
        )}

        <div className="compatibility-info">
          <h4>
            <span style={{ marginRight: "0.5rem" }}>📋</span>
            Donation Protocol
          </h4>
          <ul
            style={{
              textAlign: "left",
              paddingLeft: "var(--spacing-md)",
              lineHeight: "1.6",
            }}
          >
            <li>Verify donor ID matches official documentation</li>
            <li>Confirm blood type with laboratory test results</li>
            <li>Ensure donor meets all eligibility requirements</li>
            <li>Each donation adds 1 unit to inventory automatically</li>
            <li>System maintains complete audit trail</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DonationIntake;
