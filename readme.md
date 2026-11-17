# Tempo LAB — Workforce & Shift Management Suite

**Tempo LAB** is a responsive, zero-dependency web application for hospitality and retail workforce scheduling, staff roster management, and leave tracking. Built with semantic HTML5, modular CSS3, and native ES6 JavaScript modules, it enforces Role-Based Access Control (RBAC) between Operations Managers and Floor Staff.

🔗 **Live Demo:** `https://moeez766.github.io/Tempo_scheduleManager/`

---

## ✨ Key Features

- **Authentication & Role-Based Access Control (RBAC):**  
  * Dedicated Sign-In and Account Registration flow with 1-click demo role presets.  
  * **Manager Role (`Virk`):** Full authority to create shifts (`+ New shift`), edit shift times and sites, assign or remove staff members, delete shifts, and approve leave requests.  
  * **Employee Role (`Carol Saragosa`):** Read-only schedule consultation across all views (shift editing/deletion locked) with self-service leave request submission.  
- **Dual-Mode Interactive Schedule:**  
  * **Shift View:** Hourly timeline grid (`08:00` – `17:00`) displaying color-coded shift cards, labor cost estimates, slot confirmation ratios, and open shift indicators.  
  * **Staff View:** Collapsible employee swimlanes showing weekly hours, projected pay, remaining leave balances, and shift/leave blocks.  
  * **Month Overview:** High-level monthly coverage summary grid.  
- **Dynamic Week Stepper & Custom Date Navigation:**  
  * Step backward or forward across working weeks (`‹ Current Week ›`) with live recalculation of column dates, ISO week codes (`W32`, `W33`, `W34`, ...), and weekly budget summaries.  
  * Jump directly to any past or future date via the **Advanced Filter** custom date picker or interactive mini-calendar.  
- **Multi-Criteria Filtering & Slide-Over Drawers:**  
  * Filter shifts and staff in real time by **Status** (`All`, `Confirmed`, `Conflict`, `Open`), **Team** (`Bar staff`, `Waiters/Waitresses`), and **Site** (`Oatley NSW`).  
  * Contextual slide-over drawers for **New Shift**, **Shift Details**, and **Request Leave** with live duration calculation (including automatic 30-minute break deductions).  
- **Responsive Layout:**  
  * Collapsible desktop navigation rail (`Minimize ←`), tablet icon-rail adaptation, and mobile off-canvas drawer menu.

---

## 🔐 Demo Credentials

Use the **1-Click Role Demo Sign-In** buttons on the login screen or enter the credentials below:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Operations Manager** | Virk | `virk@tempo-lab.io` | `password123` | Full Create, Read, Update, Delete & Publish authority |
| **Employee (Floor Staff)** | Carol Saragosa | `carol@tempo-lab.io` | `password123` | Read-only schedule access & Leave Request submission |

---

## 🗂️ Project Architecture

```text
tempo-lab/
├── index.html              # Semantic HTML5 shell, login screen outlet, toolbar & slide-over drawer
├── css/
│   ├── variables.css       # Design tokens (colors, typography, radii, elevation shadows)
│   ├── layout.css          # App shell grid, collapsible sidebar, responsive breakpoints
│   ├── components.css      # Timeline cards, swimlanes, filter drawer, FAB menu & week stepper
│   └── auth.css            # Login/registration screen and role badge styles
├── js/
│   ├── mockData.js         # Seed data for user accounts, sites, staff rosters & initial shifts
│   ├── store.js            # Centralized state store, RBAC guards, calendar math & CRUD mutations
│   ├── renderers.js        # Pure template renderers for all views, drawers & login UI
│   └── app.js              # Global event delegation, form handlers & UI synchronization
└── README.md               # Project documentation
```

---

## 🚀 Getting Started (Local Development)

Because Tempo LAB uses native ES6 modules (`<script type="module">`), it must be served over HTTP rather than opened directly via `file://`.

1. **Clone the repository:**

```sh
git clone [https://github.com/](https://github.com/)<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

2. **Start a local static server** (choose any method):  
   * **VS Code Live Server:** Right-click `index.html` and select **Open with Live Server**.  
   * **Python:**

```sh
python -m http.server 8080
```

   * **Node.js (`npx`):**

```sh
npx serve .
```

3. Open `http://localhost:8080` in your browser.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Properties, CSS Grid, Flexbox), Vanilla JavaScript (ES6+ Modules)  
- **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts  
- **Hosting:** GitHub Pages (Static Deployment)

---

