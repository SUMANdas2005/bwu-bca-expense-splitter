import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  INITIAL_MEMBERS,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  EXPENSE_CATEGORIES,
} from "../data/initialData";
import {
  calculateNetBalances,
  computeSimplifiedDebts,
} from "../utils/settlementAlgorithm";

const ExpenseContext = createContext();

const AVATAR_POOL = ["👤", "🧑‍💻", "👩‍💻", "🧑‍🎓", "👩‍🎓", "🧑", "👩", "👨"];

export const ExpenseProvider = ({ children }) => {
  // 1. Members State (Empty by default - added dynamically by users)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Current active user (defaults to first member or 'You')
  const currentUser = useMemo(() => {
    if (members.length > 0) {
      return members.find((m) => m.isCurrentUser) || members[0];
    }
    return {
      id: "user-default",
      name: "You",
      code: "BWU/BCA",
      avatar: "👤",
      isCurrentUser: true,
    };
  }, [members]);

  // 2. Groups State (Empty by default)
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_groups");
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  // 3. Expenses State (Empty by default)
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_items");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // 4. Settlements State (Empty by default)
  const [settlements, setSettlements] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_settlements");
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("bwu_expense_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("bwu_expense_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("bwu_expense_items", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("bwu_expense_settlements", JSON.stringify(settlements));
  }, [settlements]);

  // Derived Calculations using JavaScript Array Operations (.reduce, .map, .filter)
  const netBalances = useMemo(
    () => calculateNetBalances(members, expenses, settlements),
    [members, expenses, settlements]
  );

  const simplifiedDebts = useMemo(
    () => computeSimplifiedDebts(members, netBalances),
    [members, netBalances]
  );

  // Current User specific metrics
  const currentUserMetrics = useMemo(() => {
    const userBalance = netBalances[currentUser.id] || 0;

    const debtsOwedToYou = simplifiedDebts
      .filter((d) => d.toMember.id === currentUser.id)
      .reduce((sum, d) => sum + d.amount, 0);

    const debtsYouOwe = simplifiedDebts
      .filter((d) => d.fromMember.id === currentUser.id)
      .reduce((sum, d) => sum + d.amount, 0);

    const totalPaidByUser = expenses
      .filter((e) => e.paidById === currentUser.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const grandTotalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    return {
      netBalance: userBalance,
      youAreOwed: debtsOwedToYou,
      youOwe: debtsYouOwe,
      totalPaid: totalPaidByUser,
      grandTotal: grandTotalExpenses,
    };
  }, [currentUser.id, netBalances, simplifiedDebts, expenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const grandTotal =
      expenses.reduce((sum, e) => sum + Number(e.amount), 0) || 1;

    return EXPENSE_CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...cat,
        total,
        count: catExpenses.length,
        percentage: Math.round((total / grandTotal) * 100),
      };
    });
  }, [expenses]);

  // Dynamic Member Creation
  const addMember = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    // Check if member already exists
    const existing = members.find(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      code: `MEMBER-${members.length + 1}`,
      avatar: AVATAR_POOL[members.length % AVATAR_POOL.length],
      isCurrentUser: members.length === 0, // First added person is current user
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Add Expense
  const addExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: expenseData.date || new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  // Delete Expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Group
  const addGroup = (groupData) => {
    const newGroup = {
      ...groupData,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      icon: groupData.icon || "👥",
      members: groupData.members || [],
    };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  // Add Settlement
  const addSettlement = (settlementData) => {
    const newSettlement = {
      ...settlementData,
      id: `set-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  // Clear / Reset All Data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data and start completely fresh?")) {
      setMembers([]);
      setGroups([]);
      setExpenses([]);
      setSettlements([]);
      localStorage.removeItem("bwu_expense_members");
      localStorage.removeItem("bwu_expense_groups");
      localStorage.removeItem("bwu_expense_items");
      localStorage.removeItem("bwu_expense_settlements");
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        members,
        currentUser,
        groups,
        expenses,
        settlements,
        categories: EXPENSE_CATEGORIES,
        netBalances,
        simplifiedDebts,
        currentUserMetrics,
        categoryBreakdown,
        addMember,
        addExpense,
        deleteExpense,
        addGroup,
        addSettlement,
        clearAllData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
