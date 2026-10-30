import { useState } from "react";
import { useExpenses } from "../../context/ExpenseContext";
import Modal from "../common/Modal";
import Button from "../common/Button";
import "./AddExpenseModal.css";

function AddExpenseModal({ isOpen, onClose }) {
  const { members, groups, categories, addMember, addGroup, addExpense } =
    useExpenses();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Group selection or new group input
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "new");
  const [newGroupName, setNewGroupName] = useState("");

  // Payer state
  const [payerName, setPayerName] = useState(members[0]?.name || "");

  // Participants / People to split with
  const [participantInput, setParticipantInput] = useState("");
  const [participantsList, setParticipantsList] = useState(() =>
    members.map((m) => m.name)
  );
  const [selectedSplitNames, setSelectedSplitNames] = useState(() =>
    members.map((m) => m.name)
  );

  // Sync if members change
  const handleAddParticipant = () => {
    const trimmed = participantInput.trim();
    if (!trimmed) return;

    if (!participantsList.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setParticipantsList((prev) => [...prev, trimmed]);
      setSelectedSplitNames((prev) => [...prev, trimmed]);
      // If no payer yet, set this person as payer
      if (!payerName) {
        setPayerName(trimmed);
      }
    }
    setParticipantInput("");
  };

  const handleToggleSplit = (name) => {
    setSelectedSplitNames((prev) => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev; // At least one
        return prev.filter((n) => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const handleRemoveParticipant = (name) => {
    setParticipantsList((prev) => prev.filter((n) => n !== name));
    setSelectedSplitNames((prev) => prev.filter((n) => n !== name));
    if (payerName === name) {
      setPayerName(participantsList.find((n) => n !== name) || "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title / description for this expense.");
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount in ₹ (greater than 0).");
      return;
    }

    if (!payerName.trim()) {
      setError("Please specify who paid for this expense.");
      return;
    }

    if (selectedSplitNames.length === 0) {
      setError("Please add at least one person to split this expense with.");
      return;
    }

    // 1. Ensure all participants & payer exist as member objects
    const allNamesNeeded = Array.from(
      new Set([payerName.trim(), ...selectedSplitNames])
    );

    const resolvedMembers = allNamesNeeded.map((name) => addMember(name));

    const payerObj = resolvedMembers.find(
      (m) => m.name.toLowerCase() === payerName.trim().toLowerCase()
    );

    const splitMemberIds = selectedSplitNames.map((name) => {
      const found = resolvedMembers.find(
        (m) => m.name.toLowerCase() === name.toLowerCase()
      );
      return found?.id;
    }).filter(Boolean);

    // 2. Resolve Group
    let finalGroupId = selectedGroupId;
    if (selectedGroupId === "new" || !groups.some((g) => g.id === selectedGroupId)) {
      const gName = newGroupName.trim() || "General Shared Expenses";
      const createdGroup = addGroup({
        name: gName,
        category: category,
        description: `Group created for ${title.trim()}`,
        icon: "📁",
        members: splitMemberIds,
      });
      finalGroupId = createdGroup.id;
    }

    // 3. Save Expense
    addExpense({
      title: title.trim(),
      amount: numAmount,
      groupId: finalGroupId,
      category,
      paidById: payerObj.id,
      splitBetween: splitMemberIds,
      splitType: "EQUAL",
      date,
      notes: notes.trim(),
    });

    // Reset Form
    setTitle("");
    setAmount("");
    setNotes("");
    setError("");
    onClose();
  };

  const perPersonShare =
    selectedSplitNames.length > 0 && Number(amount) > 0
      ? Math.round(Number(amount) / selectedSplitNames.length)
      : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add Shared Expense" maxWidth="600px">
      <form onSubmit={handleSubmit} className="add-expense-form">
        {error && <div className="form-error-banner">{error}</div>}

        {/* 1. Title */}
        <div className="form-group">
          <label>Expense Title / Description *</label>
          <input
            type="text"
            placeholder="e.g. Project Printouts, Team Dinner, Room Rent..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* 2. Amount & Category */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Total Amount (₹) *</label>
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
            <label>Category</label>
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
        </div>

        {/* 3. Group Selection */}
        <div className="form-group">
          <label>Group</label>
          <div className="group-toggle-wrap">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
              <option value="new">+ Create / Name New Group...</option>
            </select>

            {selectedGroupId === "new" && (
              <input
                type="text"
                placeholder="Type new group name (e.g. Goa Trip, Flat 402)..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ marginTop: "8px" }}
              />
            )}
          </div>
        </div>

        {/* 4. Add People / Participants Dynamically */}
        <div className="form-group people-section-card">
          <label className="section-label">
            👥 Add Friends / Participants to this Bill *
          </label>
          <p className="people-hint">
            Type each person's name and press Enter or click <strong>+ Add</strong>
          </p>

          <div className="add-person-input-row">
            <input
              type="text"
              placeholder="Type person's name (e.g. Suman, Rahul, Priya...)"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddParticipant();
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              icon="➕"
              onClick={handleAddParticipant}
            >
              Add
            </Button>
          </div>

          {/* People Badges */}
          <div className="people-chips-container">
            {participantsList.length === 0 ? (
              <div className="no-people-notice">
                No people added yet. Type names above to add friends!
              </div>
            ) : (
              participantsList.map((name) => {
                const isSelected = selectedSplitNames.includes(name);
                const isPayer = payerName === name;

                return (
                  <div
                    key={name}
                    className={`person-chip ${isSelected ? "in-split" : ""}`}
                    onClick={() => handleToggleSplit(name)}
                    title="Click to include / exclude from split"
                  >
                    <span className="chip-check">
                      {isSelected ? "✓" : "○"}
                    </span>
                    <span className="chip-name">{name}</span>
                    {isPayer && <span className="payer-badge-tag">Payer</span>}
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveParticipant(name);
                      }}
                      title="Remove person"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {selectedSplitNames.length > 0 && perPersonShare > 0 && (
            <div className="split-calc-bar">
              <span>
                Splitting equally among <strong>{selectedSplitNames.length}</strong> people:
              </span>
              <strong className="split-calc-amount">
                ₹{perPersonShare} each
              </strong>
            </div>
          )}
        </div>

        {/* 5. Who Paid */}
        <div className="form-group">
          <label>Paid By (Who paid the total ₹{amount || "0"} upfront?) *</label>
          {participantsList.length > 0 ? (
            <select
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              required
            >
              {participantsList.map((name) => (
                <option key={name} value={name}>
                  💳 {name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Type payer's name..."
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              required
            />
          )}
        </div>

        {/* 6. Date & Notes */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group flex-1">
            <label>Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid via GPay, Cash..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
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
