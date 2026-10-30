# Shared Expense Splitter & Settlement System

**Brainware University (BWU)**  
**Department of Computational Sciences (CSS)**  
**Bachelor of Computer Applications (BCA) — Final Project 2**  

---

### 👨‍🎓 Project Credits & Student Details
- **Student / Developer Name:** SUMAN KUMAR DAS
- **Student Code / University Roll:** `BWU/BCA/24/255`
- **Department:** Department of Computational Sciences (CSS)
- **Institution:** Brainware University, Barasat, Kolkata
- **Course:** Full Stack Web Development (Project 2)

---

## 📌 Project Overview & Objectives
The **Shared Expense Splitter** is a modern, responsive single-page web application designed to solve the real-world problem of tracking, splitting, and settling shared expenses among roommates, college trip groups, and project teams.

This project directly fulfills all core academic requirements:
1. **Component-Based Architecture**: Separation of concerns with modular, reusable components across `common/`, `dashboard/`, `groups/`, `expenses/`, `settlement/`, and `analytics/`.
2. **JSX Syntax**: Clean, declarative UI markup with conditional rendering, dynamic attributes, and semantic HTML5 elements.
3. **Props and State Management with React Hooks**:
   - `useState` for form controls, interactive modals, search queries, and dynamic filters.
   - `useEffect` for offline-first data persistence with `localStorage`.
   - `useMemo` for optimal real-time calculation of net balances, category breakdowns, and settlement graphs.
4. **Dynamic Rendering with JavaScript Array Operations**:
   - `.map()` for rendering feeds, group members, avatars, and progress bars.
   - `.filter()` for multi-condition filtering by group, category, payer, and search text.
   - `.reduce()` for calculating grand totals, member balances, and category expenditure shares.
5. **Reusable UI Components**:
   - `Button` with variants (`primary`, `secondary`, `success`, `danger`, `outline`, `ghost`).
   - `Card` container with header, subtitle, icon, and action slots.
   - `Badge` for colored category and status pills.
   - `Modal` accessible dialog with escape key and backdrop dismissal.
   - `StatCard` for key financial metrics.
6. **Client-Side Routing with React Router (v7)**:
   - `/` — Interactive Dashboard Overview
   - `/groups` — Dedicated Expense Group Management
   - `/expenses` — Filterable & Searchable Master Expense Ledger
   - `/settle` — Smart Min-Cash-Flow Debt Simplification
   - `/analytics` — Statistical Breakdown & Printable Audit Report
7. **Multiple Styling Approaches**:
   - Modern CSS system with `:root` CSS custom properties (variables) for theme consistency.
   - Scoped component stylesheets for style isolation.
   - Dynamic inline styles for real-time progress bar widths and positive/negative financial indicators.

---

## ⚡ Core Mathematical Feature: Min-Cash-Flow Algorithm
In standard expense splitting with $N$ people, there can be up to $N(N-1)/2$ pairwise debts.  
This application implements a **Greedy Minimum Cash Flow Algorithm** (`src/utils/settlementAlgorithm.js`):
1. Calculates net balance for every student ($Balance = TotalPaid - TotalShare$).
2. Classifies members into Creditors ($Balance > 0$) and Debtors ($Balance < 0$).
3. Iteratively settles the maximum debtor with the maximum creditor.
4. **Result:** Reduces 10+ confusing cross-payments down to the absolute minimum required transactions!

---

## 🗄️ Database Architecture (`expense_splitter_db.sql`)

The accompanying MySQL database schema includes 6 relational tables:

1. **`users`**: Stores student credentials, roll code, email, and avatar.
2. **`expense_groups`**: Groups like *BCA Final Project Group*, *Barasat Flat Roommates*, *Digha Tour*.
3. **`group_members`**: Many-to-many relationship mapping students to groups.
4. **`expenses`**: Master bills with amount, category, payer, date, and description.
5. **`expense_splits`**: Detailed breakdown of how much each member owes for a bill.
6. **`settlements`**: Cleared payments with timestamps and transaction remarks.

---

## 🚀 How to Run the Project Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your web browser.

### Step 3: Production Build
```bash
npm run build
```
Generates an optimized production build in the `dist/` directory.

---

## 💻 How to Import the Database in XAMPP / phpMyAdmin

1. Start **Apache** and **MySQL** in XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin` in your browser.
3. Click on the **Import** tab.
4. Choose the `expense_splitter_db.sql` file from this project folder.
5. Click **Import** (or **Go**). All 6 tables with relational constraints and seed data will be created!
