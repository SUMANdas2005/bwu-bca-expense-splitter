import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpenseProvider } from "./context/ExpenseContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Dashboard from "./components/dashboard/Dashboard";
import GroupList from "./components/groups/GroupList";
import ExpenseList from "./components/expenses/ExpenseList";
import Settlement from "./components/settlement/Settlement";
import Analytics from "./components/analytics/Analytics";
import AddExpenseModal from "./components/expenses/AddExpenseModal";
import "./App.css";

function AppContent() {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <Navbar onOpenAddExpense={() => setIsAddExpenseModalOpen(true)} />

      {/* Main Content View based on React Router */}
      <main className="main-content-container">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              />
            }
          />
          <Route
            path="/groups"
            element={
              <GroupList
                onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              />
            }
          />
          <Route
            path="/expenses"
            element={
              <ExpenseList
                onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              />
            }
          />
          <Route path="/settle" element={<Settlement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />

      {/* Academic University Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </BrowserRouter>
  );
}

export default App;
