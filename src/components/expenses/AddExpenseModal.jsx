import { useState } from "react";
import { useExpenses } from "../../context/ExpenseContext";
import Modal from "../common/Modal";
import Button from "../common/Button";
import "./AddExpenseModal.css";

function AddExpenseModal({ isOpen, onClose }) {
  const { members, groups, categories, currentUser, addExpense } = useExpenses();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id || "g1");
  const [category, setCategory] = useState("Food");
  const [paidById, setPaidById] = useState(currentUser.id);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Get current selected group's members
  const currentGroup = groups.find((g) => g.id === groupId);
  const groupMemberIds = currentGroup?.members || [];
  const groupMembers = members.filter((m) => groupMemberIds.includes(m.id));

  // Custom split participants (defaults to all members of selected group)
  const [selectedParticipants, setSelectedParticipants] = useState(groupMemberIds);

  const handleGroupChange = (e) => {
    const newGroupId = e.target.value;
    setGroupId(newGroupId);
    const grp = groups.find((g) => g.id === newGroupId);
    if (grp) {
      setSelectedParticipants(grp.members);
      if (!grp.members.includes(paidById)) {
        setPaidById(grp.members[0] || currentUser.id);
      }
    }
  };

  const handleToggleParticipant = (memberId) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title or description for the expense.");
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount in ₹ (greater than 0).");
      return;
    }

    if (selectedParticipants.length === 0) {
      setError("Please select at least one person to split this expense with.");
      return;
    }

    addExpense({
      title: title.trim(),
      amount: numAmount,
      groupId,
      category,
      paidById,
      splitBetween: selectedParticipants,
      splitType: "EQUAL",
      date,
      notes: notes.trim(),
    });

    // Reset and close
    setTitle("");
    setAmount("");
    setNotes("");
    setError("");
    onClose();
  };

  const splitShare =
    selectedParticipants.length > 0 && Number(amount) > 0
      ? Math.round(Number(amount) / selectedParticipants.length)
      : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Shared Expense">
      <form onSubmit={handleSubmit} className="add-expense-form">
        {error && <div className="form-error-banner">{error}</div>}

        {/* Title */}
        <div className="form-group">
          <label>Expense Title / Description *</label>
          <input
            type="text"
            placeholder="e.g. Project Printouts, Canteen Snacks, Dinner..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Amount & Group */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Amount (₹) *</label>
            <div className="currency-input-wrap">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                min="1"
                step="any"
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group flex-1">
            <label>Select Group *</label>
            <select value={groupId} onChange={handleGroupChange}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Date */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Paid By */}
        <div className="form-group">
          <label>Paid By (Who paid upfront?) *</label>
          <select value={paidById} onChange={(e) => setPaidById(e.target.value)}>
            {groupMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name} {m.id === currentUser.id ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Split Between */}
        <div className="form-group">
          <div className="split-label-row">
            <label>Split Between ({selectedParticipants.length} people)</label>
            {splitShare > 0 && (
              <span className="split-share-pill">
                ₹{splitShare} per person
              </span>
            )}
          </div>
          <div className="participants-checkbox-list">
            {groupMembers.map((m) => {
              const isChecked = selectedParticipants.includes(m.id);
              return (
                <label
                  key={m.id}
                  className={`participant-pill-label ${
                    isChecked ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleParticipant(m.id)}
                  />
                  <span>{m.avatar}</span>
                  <span className="p-name">
                    {m.name.split(" ")[0]} {m.id === currentUser.id ? "(You)" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="form-group">
          <label>Notes / Memo (Optional)</label>
          <input
            type="text"
            placeholder="Add bill reference or extra remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Footer Actions */}
        <div className="form-actions-row">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon="💾">
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddExpenseModal;
