import { useState } from "react";
import { useExpenses } from "../../context/ExpenseContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Card from "../common/Card";
import "./Settlement.css";

function Settlement() {
  const {
    members,
    currentUser,
    simplifiedDebts,
    netBalances,
    settlements,
    addSettlement,
  } = useExpenses();

  const [settleModalData, setSettleModalData] = useState(null);
  const [settleNotes, setSettleNotes] = useState("");

  const handleOpenSettle = (debt) => {
    setSettleModalData(debt);
    setSettleNotes(`Settled debt of ${formatCurrency(debt.amount)} via UPI`);
  };

  const handleConfirmSettlement = (e) => {
    e.preventDefault();
    if (!settleModalData) return;

    addSettlement({
      fromMemberId: settleModalData.fromMember.id,
      toMemberId: settleModalData.toMember.id,
      amount: settleModalData.amount,
      notes: settleNotes.trim(),
    });

    setSettleModalData(null);
    setSettleNotes("");
  };

  const isAllSettled = simplifiedDebts.length === 0;

  return (
    <div className="settlement-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2>🤝 Smart Debt Simplification & Settlements</h2>
          <p>
            Min-Cash-Flow algorithm simplifies multi-person debts into the lowest possible number of transactions
          </p>
        </div>
      </div>

      {/* Algorithm Explainer Box */}
      <div className="algorithm-info-banner">
        <div className="algo-badge">⚡ Min-Cash-Flow Engine</div>
        <p>
          Instead of every student transferring money to each other multiple times, this algorithm
          matches the biggest debtors directly with the biggest creditors.
        </p>
      </div>

      {/* Recommended Settlements Cards */}
      <div className="settlement-transactions-section">
        <h3>🎯 Recommended Settlement Transactions ({simplifiedDebts.length})</h3>

        {isAllSettled ? (
          <div className="all-settled-card">
            <span className="settled-large-icon">🎉</span>
            <h3>Everyone is completely settled up!</h3>
            <p>All members have a ₹0 net balance. No pending debts remaining.</p>
          </div>
        ) : (
          <div className="debts-cards-grid">
            {simplifiedDebts.map((debt, index) => {
              const isYouPaying = debt.fromMember.id === currentUser.id;
              const isYouReceiving = debt.toMember.id === currentUser.id;

              return (
                <div
                  key={debt.id || index}
                  className={`debt-transaction-card ${
                    isYouPaying ? "card-you-pay" : isYouReceiving ? "card-you-receive" : ""
                  }`}
                >
                  <div className="debt-card-header">
                    <span className="tx-index-pill">Payment #{index + 1}</span>
                    {isYouPaying && (
                      <span className="you-tag pay">You Need To Pay</span>
                    )}
                    {isYouReceiving && (
                      <span className="you-tag receive">You Will Receive</span>
                    )}
                  </div>

                  <div className="debt-flow-visual">
                    {/* Debtor */}
                    <div className="party-box from-party">
                      <span className="party-avatar">{debt.fromMember.avatar}</span>
                      <strong className="party-name">
                        {debt.fromMember.name.split(" ")[0]}
                      </strong>
                      <small className="party-code">{debt.fromMember.code}</small>
                      <span className="party-role-tag payer">Pays</span>
                    </div>

                    {/* Arrow & Amount */}
                    <div className="flow-amount-center">
                      <div className="flow-arrow">➔</div>
                      <div className="flow-amount-pill">
                        {formatCurrency(debt.amount)}
                      </div>
                    </div>

                    {/* Creditor */}
                    <div className="party-box to-party">
                      <span className="party-avatar">{debt.toMember.avatar}</span>
                      <strong className="party-name">
                        {debt.toMember.name.split(" ")[0]}
                      </strong>
                      <small className="party-code">{debt.toMember.code}</small>
                      <span className="party-role-tag receiver">Receives</span>
                    </div>
                  </div>

                  {/* Settle Action */}
                  <div className="debt-card-footer">
                    <Button
                      variant={isYouPaying ? "primary" : "success"}
                      size="sm"
                      icon="✓"
                      onClick={() => handleOpenSettle(debt)}
                    >
                      Record as Settled
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Columns: Net Balance Standings & Settlement History */}
      <div className="settlement-bottom-grid">
        {/* Left: Overall Net Balance Breakdown */}
        <Card
          title="📊 Individual Net Balances"
          subtitle="Positive balance means getting back, negative means owes money"
        >
          <div className="net-balances-table-wrap">
            <table className="net-balances-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Code</th>
                  <th>Net Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const bal = netBalances[m.id] || 0;
                  const isZero = Math.abs(bal) <= 0.5;

                  return (
                    <tr key={m.id}>
                      <td>
                        <span style={{ marginRight: "6px" }}>{m.avatar}</span>
                        <strong>{m.name}</strong> {m.id === currentUser.id && "(You)"}
                      </td>
                      <td>
                        <code>{m.code}</code>
                      </td>
                      <td>
                        <span
                          className={`balance-status-tag ${
                            isZero ? "settled" : bal > 0 ? "credit" : "debt"
                          }`}
                        >
                          {isZero ? "Settled" : bal > 0 ? "Creditor (+)" : "Debtor (-)"}
                        </span>
                      </td>
                      <td>
                        <strong
                          className={
                            isZero ? "" : bal > 0 ? "text-success" : "text-danger"
                          }
                        >
                          {isZero ? "₹0" : formatCurrency(Math.abs(bal))}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Past Settlement History */}
        <Card
          title="📜 Past Settlement History"
          subtitle="Audit log of cleared payments and transfers"
        >
          {settlements.length === 0 ? (
            <div className="empty-history-box">
              <span>🧾</span>
              <p>No settlements recorded yet</p>
            </div>
          ) : (
            <div className="settlement-history-list">
              {settlements.map((set) => {
                const fromM = members.find((m) => m.id === set.fromMemberId);
                const toM = members.find((m) => m.id === set.toMemberId);

                return (
                  <div key={set.id} className="history-item">
                    <div className="history-icon-circle">✓</div>
                    <div className="history-info">
                      <div className="history-text">
                        <strong>{fromM?.name.split(" ")[0]}</strong> paid{" "}
                        <strong>{toM?.name.split(" ")[0]}</strong>
                      </div>
                      <small className="history-date">
                        {formatDate(set.date)} {set.notes && `• ${set.notes}`}
                      </small>
                    </div>
                    <span className="history-amount">
                      {formatCurrency(set.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Settle Up Confirmation Modal */}
      {settleModalData && (
        <Modal
          isOpen={true}
          onClose={() => setSettleModalData(null)}
          title="🤝 Record Debt Settlement"
        >
          <form onSubmit={handleConfirmSettlement} className="settle-form">
            <div className="settle-summary-box">
              <div className="settle-flow-text">
                <strong>{settleModalData.fromMember.name}</strong> will pay{" "}
                <strong>{settleModalData.toMember.name}</strong>
              </div>
              <div className="settle-big-amount">
                {formatCurrency(settleModalData.amount)}
              </div>
            </div>

            <div className="form-group">
              <label>Payment Remarks / Notes</label>
              <input
                type="text"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                placeholder="e.g. Paid via PhonePe, Google Pay, Cash..."
                required
              />
            </div>

            <div className="form-actions-row">
              <Button
                variant="secondary"
                onClick={() => setSettleModalData(null)}
              >
                Cancel
              </Button>
              <Button variant="success" type="submit" icon="✓">
                Confirm & Mark Settled
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Settlement;
