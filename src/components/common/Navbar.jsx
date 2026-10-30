import { NavLink } from "react-router-dom";
import { useExpenses } from "../../context/ExpenseContext";
import Button from "./Button";
import "./Navbar.css";

function Navbar({ onOpenAddExpense }) {
  const { currentUser, clearAllData, members, expenses } = useExpenses();

  const hasData = members.length > 0 || expenses.length > 0;

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <NavLink to="/" className="navbar-brand">
          <div className="brand-logo-badge">₹</div>
          <div className="brand-text">
            <span className="brand-title">BWU Splitter</span>
            <span className="brand-sub">Shared Expense Management</span>
          </div>
        </NavLink>

        {/* Navigation Links with Active States */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            👥 Groups
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            💸 Expenses
          </NavLink>

          <NavLink
            to="/settle"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            🤝 Smart Settlement
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            📈 Analytics
          </NavLink>
        </nav>

        {/* Right Actions: Add Expense, Clear Data, User Avatar */}
        <div className="navbar-actions">
          <Button
            variant="primary"
            size="sm"
            icon="➕"
            onClick={onOpenAddExpense}
          >
            Add Expense
          </Button>

          {hasData && (
            <button
              type="button"
              className="reset-demo-btn"
              title="Clear all entered data to start fresh"
              onClick={clearAllData}
            >
              🗑️ Clear
            </button>
          )}

          {/* Current User Badge */}
          <div className="user-profile-pill">
            <span className="user-avatar">{currentUser.avatar || "👤"}</span>
            <div className="user-info">
              <strong className="user-name">
                {currentUser.name || "Student"}
              </strong>
              <small className="user-code">BWU/BCA/24/255</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
