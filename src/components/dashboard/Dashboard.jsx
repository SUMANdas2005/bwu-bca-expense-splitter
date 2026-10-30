import { useExpenses } from "../../context/ExpenseContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatCard from "../common/StatCard";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard({ onOpenAddExpense }) {
  const {
    currentUser,
    currentUserMetrics,
    expenses,
    groups,
    members,
    categories,
    netBalances,
    simplifiedDebts,
  } = useExpenses();

  const { netBalance, youAreOwed, youOwe, grandTotal } = currentUserMetrics;

  const isPositive = netBalance > 0;
  const isZero = Math.abs(netBalance) <= 0.5;

  const debtsOwedToYouList = simplifiedDebts.filter(
    (d) => d.toMember.id === currentUser.id
  );

  const debtsYouOweList = simplifiedDebts.filter(
    (d) => d.fromMember.id === currentUser.id
  );

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="uni-sub-badge">
            Brainware University • CSS Department
          </span>
          <h1>
            {members.length > 0 && currentUser.name !== "You"
              ? `Welcome back, ${currentUser.name}! 👨‍💻`
              : "Shared Expense Splitter 💸"}
          </h1>
          <p>
            Track shared project costs, room expenses, and tour bills with friends. Type names and calculate smart settlements!
          </p>
        </div>
        <div className="welcome-actions">
          <Button
            variant="primary"
            size="md"
            icon="➕"
            onClick={onOpenAddExpense}
          >
            Add New Expense
          </Button>
          <Link to="/settle">
            <Button variant="secondary" size="md" icon="🤝">
              Settle Debts
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Metrics */}
      <div className="stats-grid">
        <StatCard
          title="Overall Balance"
          value={
            isZero
              ? "All Settled Up"
              : `${isPositive ? "+" : ""}${formatCurrency(netBalance)}`
          }
          subtitle={
            isZero
              ? "No pending debts"
              : isPositive
              ? "Overall you are owed"
              : "Overall you owe"
          }
          icon={isZero ? "✨" : isPositive ? "📈" : "📉"}
          variant={isZero ? "primary" : isPositive ? "success" : "danger"}
        />

        <StatCard
          title="You Are Owed"
          value={formatCurrency(youAreOwed)}
          subtitle={
            debtsOwedToYouList.length > 0
              ? `From ${debtsOwedToYouList.length} member(s)`
              : "Nobody owes you right now"
          }
          icon="💰"
          variant="success"
        />

        <StatCard
          title="You Owe"
          value={formatCurrency(youOwe)}
          subtitle={
            debtsYouOweList.length > 0
              ? `To ${debtsYouOweList.length} member(s)`
              : "You owe nothing"
          }
          icon="💳"
          variant="danger"
        />

        <StatCard
          title="Total Group Spending"
          value={formatCurrency(grandTotal)}
          subtitle={`Across ${groups.length} active group(s)`}
          icon="📊"
          variant="primary"
        />
      </div>

      {/* Main Grid: Left Recent Expenses, Right Member Balances & Groups */}
      <div className="dashboard-main-grid">
        {/* Left Column: Recent Expenses Feed */}
        <div className="grid-left-col">
          <Card
            title="🕒 Recent Shared Expenses"
            subtitle="Latest split transactions added by group members"
            action={
              expenses.length > 0 ? (
                <Link to="/expenses" className="card-link-action">
                  View All ({expenses.length}) →
                </Link>
              ) : null
            }
          >
            {expenses.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">🧾</span>
                <p>No expenses added yet!</p>
                <small>
                  Click the button below to add your first expense and type your friends' names!
                </small>
                <div style={{ marginTop: "14px" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="➕"
                    onClick={onOpenAddExpense}
                  >
                    Add First Expense
                  </Button>
                </div>
              </div>
            ) : (
              <div className="expense-feed-list">
                {recentExpenses.map((exp) => {
                  const payer = members.find((m) => m.id === exp.paidById);
                  const group = groups.find((g) => g.id === exp.groupId);
                  const categoryObj = categories.find((c) => c.id === exp.category);
                  const isPayer = exp.paidById === currentUser.id;
                  const isParticipant = exp.splitBetween.includes(currentUser.id);
                  const share = exp.amount / (exp.splitBetween.length || 1);

                  return (
                    <div key={exp.id} className="expense-feed-item">
                      <div
                        className="expense-category-avatar"
                        style={{ backgroundColor: `${categoryObj?.color || "#3b82f6"}18` }}
                      >
                        <span>{categoryObj?.icon || "📦"}</span>
                      </div>

                      <div className="expense-feed-info">
                        <strong className="expense-feed-title">{exp.title}</strong>
                        <div className="expense-feed-meta">
                          <Badge color={categoryObj?.color}>
                            {categoryObj?.label || exp.category}
                          </Badge>
                          <span>•</span>
                          <span className="group-name-tag">{group?.name || "General"}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                        </div>
                      </div>

                      <div className="expense-feed-amounts">
                        <span className="total-expense-amt">
                          {formatCurrency(exp.amount)}
                        </span>
                        <div className="payer-sub-info">
                          <span>Paid by {payer?.name || "Member"}</span>
                        </div>
                        {isParticipant && !isPayer && (
                          <small className="user-borrow-pill">
                            Your share: {formatCurrency(share)}
                          </small>
                        )}
                        {isPayer && exp.splitBetween.length > 1 && (
                          <small className="user-lent-pill">
                            You lent: {formatCurrency(exp.amount - share)}
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Member Net Balances & Active Groups */}
        <div className="grid-right-col">
          {/* Member Balances Widget */}
          <Card
            title="👥 Friends & Group Balances"
            subtitle="Overall net standings calculated automatically"
            action={
              members.length > 0 ? (
                <Link to="/settle" className="card-link-action">
                  Smart Settle →
                </Link>
              ) : null
            }
          >
            {members.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">👥</span>
                <p>No members added yet</p>
                <small>When you add expenses and type names, balances will appear here!</small>
              </div>
            ) : (
              <div className="member-balance-list">
                {members.map((m) => {
                  const bal = netBalances[m.id] || 0;
                  const isUser = m.id === currentUser.id;
                  const isZeroBal = Math.abs(bal) <= 0.5;

                  return (
                    <div key={m.id} className="member-balance-row">
                      <div className="member-info-col">
                        <span className="member-avatar-circle">{m.avatar}</span>
                        <div>
                          <strong className="member-row-name">
                            {m.name} {isUser && "(You)"}
                          </strong>
                        </div>
                      </div>

                      <div className="member-balance-badge">
                        {isZeroBal ? (
                          <span className="balance-pill settled">Settled</span>
                        ) : bal > 0 ? (
                          <span className="balance-pill positive">
                            Gets back {formatCurrency(bal)}
                          </span>
                        ) : (
                          <span className="balance-pill negative">
                            Owes {formatCurrency(-bal)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Active Groups Widget */}
          <Card
            title="📁 Active Groups"
            subtitle="Organized expense circles"
            action={
              <Link to="/groups" className="card-link-action">
                View All →
              </Link>
            }
          >
            {groups.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">📁</span>
                <p>No groups created yet</p>
                <small>Create groups for tours, room rent, or college projects!</small>
              </div>
            ) : (
              <div className="groups-widget-list">
                {groups.map((g) => {
                  const groupExpenseTotal = expenses
                    .filter((e) => e.groupId === g.id)
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                  return (
                    <div key={g.id} className="group-widget-item">
                      <div className="group-widget-head">
                        <span className="group-widget-icon">{g.icon}</span>
                        <div>
                          <strong>{g.name}</strong>
                          <small>{g.members.length} members</small>
                        </div>
                      </div>
                      <span className="group-widget-total">
                        {formatCurrency(groupExpenseTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
