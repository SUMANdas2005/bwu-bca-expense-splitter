import { useState } from "react";
import { useExpenses } from "../../context/ExpenseContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { calculateNetBalances } from "../../utils/settlementAlgorithm";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import "./GroupList.css";

function GroupList({ onOpenAddExpense }) {
  const { groups, members, expenses, addGroup, addMember } = useExpenses();

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // New Group Form state
  const [groupName, setGroupName] = useState("");
  const [category, setCategory] = useState("Academic");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("👥");
  const [memberInput, setMemberInput] = useState("");
  const [groupMemberNames, setGroupMemberNames] = useState([]);
  const [formError, setFormError] = useState("");

  const handleAddMemberName = () => {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    if (!groupMemberNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setGroupMemberNames((prev) => [...prev, trimmed]);
    }
    setMemberInput("");
  };

  const handleRemoveMemberName = (name) => {
    setGroupMemberNames((prev) => prev.filter((n) => n !== name));
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    setFormError("");

    if (!groupName.trim()) {
      setFormError("Please enter a group name.");
      return;
    }

    if (groupMemberNames.length < 2) {
      setFormError("Please add at least 2 member names for a shared group.");
      return;
    }

    // Resolve or create members
    const memberObjects = groupMemberNames.map((name) => addMember(name));
    const memberIds = memberObjects.map((m) => m.id);

    addGroup({
      name: groupName.trim(),
      category,
      description: description.trim(),
      icon,
      members: memberIds,
    });

    setGroupName("");
    setDescription("");
    setGroupMemberNames([]);
    setIsNewGroupModalOpen(false);
  };

  return (
    <div className="groups-page">
      {/* Header Bar */}
      <div className="page-header-row">
        <div>
          <h2>👥 Expense Groups</h2>
          <p>Organize shared expenses into dedicated circles (e.g. project, flat, tour)</p>
        </div>
        <Button
          variant="primary"
          icon="➕"
          onClick={() => setIsNewGroupModalOpen(true)}
        >
          Create New Group
        </Button>
      </div>

      {/* Groups Grid or Empty State */}
      {groups.length === 0 ? (
        <div className="empty-groups-state">
          <span className="empty-groups-icon">📁</span>
          <h3>No groups created yet</h3>
          <p>
            Create your first group (e.g. "College Project", "Roommates", "Trip") and add friends' names!
          </p>
          <Button
            variant="primary"
            icon="➕"
            onClick={() => setIsNewGroupModalOpen(true)}
          >
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => {
            const groupExpenses = expenses.filter((e) => e.groupId === group.id);
            const totalSpent = groupExpenses.reduce(
              (sum, e) => sum + Number(e.amount),
              0
            );
            const groupMembers = members.filter((m) =>
              group.members.includes(m.id)
            );

            const groupBalances = calculateNetBalances(
              groupMembers,
              groupExpenses,
              [],
              group.id
            );

            return (
              <div key={group.id} className="group-card">
                <div className="group-card-header">
                  <div className="group-avatar-wrap">
                    <span>{group.icon}</span>
                  </div>
                  <div className="group-header-text">
                    <h3>{group.name}</h3>
                    <div className="group-badge-line">
                      <Badge color="#0d6efd">{group.category}</Badge>
                      <small>Created {formatDate(group.createdAt)}</small>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="group-card-desc">{group.description}</p>
                )}

                <div className="group-metric-bar">
                  <div className="group-stat">
                    <span>Total Spent</span>
                    <strong>{formatCurrency(totalSpent)}</strong>
                  </div>
                  <div className="group-stat">
                    <span>Expenses</span>
                    <strong>{groupExpenses.length} bills</strong>
                  </div>
                  <div className="group-stat">
                    <span>Members</span>
                    <strong>{groupMembers.length} people</strong>
                  </div>
                </div>

                {/* Members Avatars with Tooltip */}
                <div className="group-members-row">
                  <span className="members-label">Members:</span>
                  <div className="member-avatar-stack">
                    {groupMembers.map((m) => (
                      <span
                        key={m.id}
                        className="stacked-avatar"
                        title={m.name}
                      >
                        {m.avatar}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="group-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedGroup({
                        group,
                        groupMembers,
                        groupBalances,
                        groupExpenses,
                        totalSpent,
                      })
                    }
                  >
                    View Balances
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="➕"
                    onClick={onOpenAddExpense}
                  >
                    Add Bill
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create New Group */}
      <Modal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        title="➕ Create New Shared Group"
      >
        <form onSubmit={handleCreateGroup} className="new-group-form">
          {formError && <div className="form-error-banner">{formError}</div>}

          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              placeholder="e.g. Goa Tour, Flat Rent, Hackathon Team..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Icon / Emoji</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                <option value="🎓">🎓 College Project</option>
                <option value="🏠">🏠 Apartment / Flat</option>
                <option value="🏖️">🏖️ Tour & Travel</option>
                <option value="🍔">🍔 Food & Dining</option>
                <option value="🎉">🎉 Event & Celebration</option>
                <option value="👥">👥 General Group</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Academic">Academic / College</option>
                <option value="Living">Living / Roommates</option>
                <option value="Travel">Travel & Tour</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="Short note about what this group is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Member Name Input (Dynamic) */}
          <div className="form-group">
            <label>Add Members / Friends (Type names) *</label>
            <div className="add-member-input-row">
              <input
                type="text"
                placeholder="Type member name (e.g. Suman, Rahul, Priya...)"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMemberName();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                icon="➕"
                onClick={handleAddMemberName}
              >
                Add
              </Button>
            </div>

            {/* Display Added Member Tags */}
            <div className="added-member-tags">
              {groupMemberNames.length === 0 ? (
                <small className="no-members-hint">
                  No members added yet. Type at least 2 names above!
                </small>
              ) : (
                groupMemberNames.map((name) => (
                  <span key={name} className="member-name-tag">
                    👤 {name}
                    <button
                      type="button"
                      onClick={() => handleRemoveMemberName(name)}
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="form-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsNewGroupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon="💾">
              Create Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Group Balances Detail Modal */}
      {selectedGroup && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedGroup(null)}
          title={`${selectedGroup.group.icon} ${selectedGroup.group.name} — Balance Sheet`}
          maxWidth="640px"
        >
          <div className="group-detail-modal-body">
            <div className="group-detail-meta">
              <span>Category: <strong>{selectedGroup.group.category}</strong></span>
              <span>Total Spending: <strong>{formatCurrency(selectedGroup.totalSpent)}</strong></span>
            </div>

            <h4>Member Standings in this Group</h4>
            <div className="group-member-standing-list">
              {selectedGroup.groupMembers.map((m) => {
                const bal = selectedGroup.groupBalances[m.id] || 0;
                const isZero = Math.abs(bal) <= 0.5;

                return (
                  <div key={m.id} className="standing-row">
                    <div className="standing-user">
                      <span className="s-avatar">{m.avatar}</span>
                      <div>
                        <strong>{m.name}</strong>
                      </div>
                    </div>
                    <div className="standing-badge">
                      {isZero ? (
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

            <div className="modal-actions-right" style={{ marginTop: "20px" }}>
              <Button variant="primary" onClick={() => setSelectedGroup(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default GroupList;
