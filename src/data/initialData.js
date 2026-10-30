// =====================================================================
// BRAINWARE UNIVERSITY (BWU) - DEPARTMENT OF COMPUTATIONAL SCIENCES (CSS)
// PROJECT 2: SHARED EXPENSE SPLITTER APPLICATION
// DEVELOPER: SUMAN KUMAR DAS (STUDENT CODE: BWU/BCA/24/255)
// INITIAL SEED DATA FOR DEMO & TESTING
// =====================================================================

export const INITIAL_MEMBERS = [
  {
    id: "m1",
    name: "Suman Kumar Das",
    code: "BWU/BCA/24/255",
    email: "suman.das@bwu.ac.in",
    avatar: "👨‍💻",
    isCurrentUser: true,
  },
  {
    id: "m2",
    name: "Rahul Sharma",
    code: "BWU/BCA/24/101",
    email: "rahul.bca24@bwu.ac.in",
    avatar: "🧑‍🎓",
    isCurrentUser: false,
  },
  {
    id: "m3",
    name: "Priya Mukherjee",
    code: "BWU/BCA/24/102",
    email: "priya.bca24@bwu.ac.in",
    avatar: "👩‍🎓",
    isCurrentUser: false,
  },
  {
    id: "m4",
    name: "Sneha Dutta",
    code: "BWU/BCA/24/103",
    email: "sneha.bca24@bwu.ac.in",
    avatar: "👩‍💻",
    isCurrentUser: false,
  },
  {
    id: "m5",
    name: "Aniket Banerjee",
    code: "BWU/BCA/24/104",
    email: "aniket.bca24@bwu.ac.in",
    avatar: "🧑‍💻",
    isCurrentUser: false,
  },
];

export const INITIAL_GROUPS = [
  {
    id: "g1",
    name: "BCA Final Project Group",
    category: "Academic",
    description: "Full Stack project expenses, cloud hosting, and printouts",
    icon: "🎓",
    members: ["m1", "m2", "m3", "m4"],
    createdAt: "2026-10-15",
  },
  {
    id: "g2",
    name: "Barasat Flat 402 Roommates",
    category: "Living",
    description: "Monthly apartment rent, groceries, WiFi and electricity",
    icon: "🏠",
    members: ["m1", "m2", "m5"],
    createdAt: "2026-10-01",
  },
  {
    id: "g3",
    name: "Digha Weekend Tour",
    category: "Travel",
    description: "College friends weekend beach tour, resort and transport",
    icon: "🏖️",
    members: ["m1", "m2", "m3", "m4", "m5"],
    createdAt: "2026-10-20",
  },
];

export const EXPENSE_CATEGORIES = [
  { id: "Food", label: "Food & Dining", icon: "🍔", color: "#f59e0b" },
  { id: "Travel", label: "Travel & Transport", icon: "🚕", color: "#3b82f6" },
  { id: "Living", label: "Rent & Housing", icon: "🏠", color: "#8b5cf6" },
  { id: "Utilities", label: "Bills & Utilities", icon: "💡", color: "#10b981" },
  { id: "Academic", label: "College & Project", icon: "📚", color: "#0d6efd" },
  { id: "Entertainment", label: "Entertainment & Fun", icon: "🎬", color: "#ec4899" },
  { id: "Other", label: "General & Miscellaneous", icon: "📦", color: "#64748b" },
];

export const INITIAL_EXPENSES = [
  {
    id: "exp-1",
    title: "Project Report & Spiral Binding",
    amount: 800,
    category: "Academic",
    groupId: "g1",
    paidById: "m1", // Suman
    splitBetween: ["m1", "m2", "m3", "m4"],
    splitType: "EQUAL",
    date: "2026-10-22",
    notes: "Printed 4 copies of project reports at college stationary shop",
  },
  {
    id: "exp-2",
    title: "WiFi & Broadband Monthly Bill",
    amount: 1200,
    category: "Utilities",
    groupId: "g2",
    paidById: "m2", // Rahul
    splitBetween: ["m1", "m2", "m5"],
    splitType: "EQUAL",
    date: "2026-10-24",
    notes: "100 Mbps broadband renewal for Barasat flat",
  },
  {
    id: "exp-3",
    title: "Weekend Team Dinner at Barasat",
    amount: 2400,
    category: "Food",
    groupId: "g1",
    paidById: "m3", // Priya
    splitBetween: ["m1", "m2", "m3", "m4"],
    splitType: "EQUAL",
    date: "2026-10-25",
    notes: "Project celebration dinner with group members",
  },
  {
    id: "exp-4",
    title: "Digha Hotel Room Advance",
    amount: 4500,
    category: "Travel",
    groupId: "g3",
    paidById: "m1", // Suman
    splitBetween: ["m1", "m2", "m3", "m4", "m5"],
    splitType: "EQUAL",
    date: "2026-10-26",
    notes: "Hotel Sea Hawk advance booking for 5 students",
  },
  {
    id: "exp-5",
    title: "Flat Groceries & Vegetables",
    amount: 1500,
    category: "Living",
    groupId: "g2",
    paidById: "m5", // Aniket
    splitBetween: ["m1", "m2", "m5"],
    splitType: "EQUAL",
    date: "2026-10-27",
    notes: "Spices, oil, rice and fresh vegetables from local market",
  },
  {
    id: "exp-6",
    title: "College Canteen Snacks & Coffee",
    amount: 360,
    category: "Food",
    groupId: "g1",
    paidById: "m4", // Sneha
    splitBetween: ["m1", "m2", "m3", "m4"],
    splitType: "EQUAL",
    date: "2026-10-28",
    notes: "Coffee and sandwich during project lab hours",
  },
];

export const INITIAL_SETTLEMENTS = [
  {
    id: "set-1",
    fromMemberId: "m2", // Rahul
    toMemberId: "m1",   // Suman
    amount: 500,
    date: "2026-10-29",
    notes: "UPI payment via GPay for project binding share",
  },
];
