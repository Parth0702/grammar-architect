# Grammar Architect 📐 🌸

**The Grammar Architect** is a formal, interactive educational tool designed to help students master **Theory of Automata and Formal Languages (TAFL)**. 

This tool provides a step-by-step visualization of context-free grammar (CFG) transformations into **Chomsky Normal Form (CNF)** and **Greibach Normal Form (GNF)**, along with string membership testing using the **CYK Algorithm**.

---

## 🚀 How to Run Locally

If you've cloned this repository and want to run it on your machine, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/Parth0702/grammar-architect.git
cd grammar-architect
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧠 Key Features

- **Grammar Cleaning**: Automatic $\epsilon$-removal, Unit-removal, and Useless-symbol removal.
- **CNF Conversion**: Transforms grammars into Chomsky Normal Form with visual terminal isolation and binary reduction.
- **GNF Conversion**: Advanced Greibach Normal Form conversion with variable ranking, left recursion elimination, and back-substitution.
- **String Tester**: Interactive CYK table visualization to test if a string belongs to the grammar's language.
- **Formal Theory Focus**: Designed with rigorous academic terminology for TAFL students and teachers.

## 🛠️ Tech Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS / Vanilla CSS
- **Icons**: Google Material Symbols

---

**Happy Designing!** 📐
