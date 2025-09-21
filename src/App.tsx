import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import DonationIntake from "./components/DonationIntake";
import RoutineDistribution from "./components/RoutineDistribution";
import EmergencyDistribution from "./components/EmergencyDistribution";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "donation":
        return <DonationIntake onNavigate={setCurrentPage} />;
      case "routine":
        return <RoutineDistribution onNavigate={setCurrentPage} />;
      case "emergency":
        return <EmergencyDistribution onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🩸 BECS - Blood Establishment Computer Software</h1>
        <p>Blood Bank Management System</p>
      </header>

      <main>
        <div className="glass-card">{renderCurrentPage()}</div>
      </main>

      <footer>
        <p>BECS v1.0 - Blood Establishment Computer Software</p>
        <p>Donation Intake • Routine Distribution • Emergency Distribution</p>
      </footer>
    </div>
  );
}

export default App;
