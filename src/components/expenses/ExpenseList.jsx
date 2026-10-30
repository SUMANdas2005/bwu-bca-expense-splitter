import { useState, useMemo } from "react";
import { useExpenses } from "../../context/ExpenseContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Badge from "../common/Badge";
import Button from "../common/Button";
import "./ExpenseList.css";

function ExpenseList({ onOpenAddExpense }) {
  const { expenses, groups, members, categories, currentUser, deleteExpense } =
    useExpenses();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPayer, setSelectedPayer] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Dynamic Filtering using JavaScript array operations (.filter, .sort)
  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((item) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes) return false;
      }

      // 2. Group filter
      if (selectedGroup !== "ALL" && item.groupId !== selectedGroup) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }

      // 4. Payer filter
      if (selectedPayer !== "ALL" && item.paidById !== selectedPayer) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.date) - new Date(a.date);
      if (sortBy === "OLDEST") return new Date(a.date) - new Date(b.date);
      if (sortBy === "HIGHEST") return b.amount - a.amount;
      if (sortBy === "LOWEST") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, searchQuery, selectedGroup, selectedCategory, selectedPayer, sortBy]);

  // Aggregate stats using .reduce
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteExpense(id);
    }
  };

  return (
    <div className="expenses-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2>💸 All Shared Expenses</h2>
          <p>
            Filter, search, and audit all recorded shared costs across all groups
          </p>
        </div>
        <Button
          variant="primary"
          icon="➕"
          onClick={onOpenAddExpense}
        >
          Add New Expense
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="expense-filters-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search expense description or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-dropdowns-group">
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">📁 All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.icon} {g.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">🏷️ All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          {/* Payer Filter */}
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">👤 All Payers</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="NEWEST">📅 Date: Newest First</option>
            <option value="OLDEST">📅 Date: Oldest First</option>
            <option value="HIGHEST">💰 Amount: Highest</option>
            <option value="LOWEST">💰 Amount: Lowest</option>
          </select>
        </div>
      </div>

      {/* Filter Summary Metric Strip */}
      <div className="filter-stats-strip">
        <span>
          Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} expenses
        </span>
        <span className="filter-total-badge">
          Filtered Total: <strong>{formatCurrency(filteredTotal)}</strong>
        </span>
      </div>

      {/* Expenses Table View */}
      <div className="expenses-table-card">
        {filteredExpenses.length === 0 ? (
          <div className="no-expenses-box">
            <span className="no-exp-icon">🔍</span>
            <h4>No matching expenses found</h4>
            <p>Try clearing filters or search query to view all records.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedGroup("ALL");
                setSelectedCategory("ALL");
                setSelectedPayer("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Group</th>
                  <th>Paid By</th>
                  <th>Split Among</th>
                  <th>Total Amount</th>
                  <th>Your Share</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => {
                  const payer = members.find((m) => m.id === exp.paidById);
                  const group = groups.find((g) => g.id === exp.groupId);
                  const catObj = categories.find((c) => c.id === exp.category);
                  const isPayer = exp.paidById === currentUser.id;
                  const isParticipant = exp.splitBetween.includes(currentUser.id);
                  const perPerson = exp.amount / (exp.splitBetween.length || 1);

                  return (
                    <tr key={exp.id}>
                      <td className="date-cell">{formatDate(exp.date)}</td>
                      <td className="desc-cell">
                        <strong>{exp.title}</strong>
                        {exp.notes && <small className="exp-notes">{exp.notes}</small>}
                      </td>
                      <td>
                        <Badge color={catObj?.color} icon={catObj?.icon}>
                          {catObj?.label || exp.category}
                        </Badge>
                      </td>
                      <td>
                        <span className="table-group-pill">
                          {group?.icon} {group?.name}
                        </span>
                      </td>
                      <td>
                        <div className="payer-cell">
                          <span>{payer?.avatar}</span>
                          <span className={isPayer ? "text-primary-bold" : ""}>
                            {payer?.name.split(" ")[0]} {isPayer && "(You)"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="split-count-badge">
                          {exp.splitBetween.length} members
                        </span>
                      </td>
                      <td className="amount-cell">
                        <strong>{formatCurrency(exp.amount)}</strong>
                      </td>
                      <td>
                        {isParticipant ? (
                          <span
                            className={`share-pill ${
                              isPayer ? "lent" : "borrowed"
                            }`}
                          >
                            {isPayer
                              ? `+${formatCurrency(exp.amount - perPerson)}`
                              : `-${formatCurrency(perPerson)}`}
                          </span>
                        ) : (
                          <span className="share-pill neutral">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-del-btn"
                          title="Delete expense"
                          onClick={() => handleDelete(exp.id, exp.title)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseList;
