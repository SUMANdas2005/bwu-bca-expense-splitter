import { useExpenses } from "../../context/ExpenseContext";
import { formatCurrency } from "../../utils/formatters";
import Card from "../common/Card";
import Button from "../common/Button";
import "./Analytics.css";

function Analytics() {
  const { expenses, groups, members, categoryBreakdown, currentUserMetrics } =
    useExpenses();

  const grandTotal = currentUserMetrics.grandTotal || 1;

  // Member contributions using array operations (.map, .reduce, .sort)
  const memberSpending = members
    .map((m) => {
      const totalPaid = expenses
        .filter((e) => e.paidById === m.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        member: m,
        totalPaid,
        percentage: Math.round((totalPaid / grandTotal) * 100),
      };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid);

  // Group spending breakdown
  const groupSpending = groups
    .map((g) => {
      const total = expenses
        .filter((e) => e.groupId === g.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        group: g,
        total,
        percentage: Math.round((total / grandTotal) * 100),
      };
    })
    .sort((a, b) => b.total - a.total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2>📈 Expense Analytics & Audit Report</h2>
          <p>
            Statistical breakdown of shared expenditures across categories, members, and groups
          </p>
        </div>
        <Button variant="outline" icon="🖨️" onClick={handlePrint}>
          Print Summary Report
        </Button>
      </div>

      {/* Top 3 Summary Highlight Cards */}
      <div className="analytics-summary-cards">
        <div className="summary-stat-pill">
          <span className="stat-label">Total Volume</span>
          <strong>{formatCurrency(grandTotal)}</strong>
          <small>{expenses.length} total bills</small>
        </div>

        <div className="summary-stat-pill">
          <span className="stat-label">Top Category</span>
          <strong>{categoryBreakdown[0]?.label || "N/A"}</strong>
          <small>{formatCurrency(categoryBreakdown[0]?.total || 0)}</small>
        </div>

        <div className="summary-stat-pill">
          <span className="stat-label">Top Contributor</span>
          <strong>{memberSpending[0]?.member.name || "N/A"}</strong>
          <small>{formatCurrency(memberSpending[0]?.totalPaid || 0)}</small>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Category Breakdown Card */}
        <Card
          title="🏷️ Spending by Category"
          subtitle="Percentage distribution of expenses across categories"
        >
          <div className="progress-items-list">
            {categoryBreakdown.map((cat) => (
              <div key={cat.id} className="analytics-progress-item">
                <div className="progress-info-row">
                  <div className="cat-name-icon">
                    <span>{cat.icon}</span>
                    <strong>{cat.label}</strong>
                    <small>({cat.count} bills)</small>
                  </div>
                  <div className="cat-amount-percent">
                    <strong>{formatCurrency(cat.total)}</strong>
                    <span className="pct-badge">{cat.percentage}%</span>
                  </div>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.max(cat.percentage, 2)}%`,
                      backgroundColor: cat.color || "#0d6efd",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Member Contribution Card */}
        <Card
          title="👥 Upfront Spending by Student"
          subtitle="Who paid how much out of pocket for the group"
        >
          <div className="progress-items-list">
            {memberSpending.map(({ member, totalPaid, percentage }) => (
              <div key={member.id} className="analytics-progress-item">
                <div className="progress-info-row">
                  <div className="cat-name-icon">
                    <span>{member.avatar}</span>
                    <strong>{member.name}</strong>
                    <small>({member.code})</small>
                  </div>
                  <div className="cat-amount-percent">
                    <strong>{formatCurrency(totalPaid)}</strong>
                    <span className="pct-badge">{percentage}%</span>
                  </div>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: "#10b981",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Group Spending Breakdown Card */}
      <Card
        title="📁 Spending by Expense Circle"
        subtitle="Compare total budgets spent in each group"
      >
        <div className="groups-spending-table-wrap">
          <table className="groups-spending-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Category</th>
                <th>Members</th>
                <th>Total Spent</th>
                <th>Share of Total</th>
              </tr>
            </thead>
            <tbody>
              {groupSpending.map(({ group, total, percentage }) => (
                <tr key={group.id}>
                  <td>
                    <span style={{ marginRight: "8px" }}>{group.icon}</span>
                    <strong>{group.name}</strong>
                  </td>
                  <td>{group.category}</td>
                  <td>{group.members.length} students</td>
                  <td>
                    <strong>{formatCurrency(total)}</strong>
                  </td>
                  <td>
                    <div className="table-pct-cell">
                      <span>{percentage}%</span>
                      <div className="mini-track">
                        <div
                          className="mini-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
