// =====================================================================
// SMART DEBT SIMPLIFICATION ALGORITHM (Min-Cash-Flow)
// Demonstrates advanced JavaScript array operations (.reduce, .map, .filter)
// =====================================================================

/**
 * Calculates net balance for every member across all expenses and settlements.
 * Net balance > 0 => Member is owed money (Creditor)
 * Net balance < 0 => Member owes money (Debtor)
 * Net balance = 0 => All settled
 */
export const calculateNetBalances = (members, expenses, settlements = [], filterGroupId = null) => {
  // 1. Initialize balance map with 0 for each member
  const balances = members.reduce((acc, m) => {
    acc[m.id] = 0;
    return acc;
  }, {});

  // 2. Filter expenses by group if filterGroupId is provided
  const relevantExpenses = filterGroupId
    ? expenses.filter((e) => e.groupId === filterGroupId)
    : expenses;

  // 3. Process expenses
  relevantExpenses.forEach((exp) => {
    const totalAmount = Number(exp.amount) || 0;
    const splitCount = exp.splitBetween?.length || 1;
    const perPersonShare = totalAmount / splitCount;

    // Payer is credited the full amount
    if (balances[exp.paidById] !== undefined) {
      balances[exp.paidById] += totalAmount;
    }

    // Each participant in the split is debited their share
    exp.splitBetween?.forEach((memberId) => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= perPersonShare;
      }
    });
  });

  // 4. Process recorded settlements (only when evaluating overall or if settlement is group-agnostic)
  if (!filterGroupId && settlements.length > 0) {
    settlements.forEach((set) => {
      const amount = Number(set.amount) || 0;
      // fromMember paid money -> their debt decreases (+balance)
      if (balances[set.fromMemberId] !== undefined) {
        balances[set.fromMemberId] += amount;
      }
      // toMember received money -> their credit decreases (-balance)
      if (balances[set.toMemberId] !== undefined) {
        balances[set.toMemberId] -= amount;
      }
    });
  }

  // 5. Round to nearest 2 decimal places to avoid float precision bugs
  Object.keys(balances).forEach((id) => {
    balances[id] = Math.round(balances[id] * 100) / 100;
  });

  return balances;
};

/**
 * Greedy Minimum Cash Flow Algorithm:
 * Converts complex multi-party debts into the minimum number of transactions.
 */
export const computeSimplifiedDebts = (members, netBalances) => {
  // Separate into debtors (< 0) and creditors (> 0)
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([memberId, balance]) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    if (balance < -0.5) {
      debtors.push({ member, amount: -balance });
    } else if (balance > 0.5) {
      creditors.push({ member, amount: balance });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0.5) {
      transactions.push({
        id: `tx-${debtor.member.id}-${creditor.member.id}-${transactions.length + 1}`,
        fromMember: debtor.member,
        toMember: creditor.member,
        amount: Math.round(settledAmount),
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount <= 0.5) i++;
    if (creditor.amount <= 0.5) j++;
  }

  return transactions;
};
