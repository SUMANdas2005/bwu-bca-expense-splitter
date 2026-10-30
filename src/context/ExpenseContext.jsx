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

export const ExpenseProvider = ({ children }) => {
  // 1. Members State
  const [members] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Current logged in student (Suman Kumar Das)
  const currentUser = useMemo(
    () => members.find((m) => m.isCurrentUser) || members[0],
    [members]
  );

  // 2. Groups State
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_groups");
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  // 3. Expenses State
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("bwu_expense_items");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // 4. Settlements State
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

    // What others owe you
    const debtsOwedToYou = simplifiedDebts
      .filter((d) => d.toMember.id === currentUser.id)
      .reduce((sum, d) => sum + d.amount, 0);

    // What you owe others
    const debtsYouOwe = simplifiedDebts
      .filter((d) => d.fromMember.id === currentUser.id)
      .reduce((sum, d) => sum + d.amount, 0);

    // Total spent by current user
    const totalPaidByUser = expenses
      .filter((e) => e.paidById === currentUser.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Total expenses across all groups
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

  // Category wise spending breakdown using array reduce
  const categoryBreakdown = useMemo(() => {
    const breakdown = EXPENSE_CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...cat,
        total,
        count: catExpenses.length,
      };
    });

    const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0) || 1;
    return breakdown.map((cat) => ({
      ...cat,
      percentage: Math.round((cat.total / grandTotal) * 100),
    }));
  }, [expenses]);

  // Actions
  const addExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: expenseData.date || new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addGroup = (groupData) => {
    const newGroup = {
      ...groupData,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      icon: groupData.icon || "👥",
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const addSettlement = (settlementData) => {
    const newSettlement = {
      ...settlementData,
      id: `set-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  const resetToInitialData = () => {
    if (window.confirm("Are you sure you want to reset all data to Brainware University sample demo?")) {
      setGroups(INITIAL_GROUPS);
      setExpenses(INITIAL_EXPENSES);
      setSettlements(INITIAL_SETTLEMENTS);
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
        addExpense,
        deleteExpense,
        addGroup,
        addSettlement,
        resetToInitialData,
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
