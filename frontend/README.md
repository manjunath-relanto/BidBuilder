# ProposalHub - Enterprise Proposal Management System

A comprehensive React-based application built with **Vite** for streamlining enterprise proposal generation and management for presales teams.

## 🚀 Features

- 🔐 **Authentication System** - Secure login with demo credentials
- 📊 **Analytics Dashboard** - Interactive charts and KPI tracking
- 📝 **Proposal Management** - Create, edit, and track proposals
- 📋 **Template System** - Reusable proposal templates
- 🔔 **Notifications** - Real-time activity notifications
- 👥 **Team Collaboration** - Comments and progress tracking
- 🎯 **Role-based Access** - Admin, Manager, and User roles
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5
- **State Management**: Redux Toolkit
- **UI Components**: Shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite (Fast HMR & Build)

## 📁 Project Structure

\`\`\`
src/
├── components/           # React components
│   ├── ui/              # Shadcn UI components
│   ├── LoginForm.jsx    # Authentication component
│   ├── AnalyticsDashboard.jsx
│   ├── ProposalList.jsx
│   ├── ProposalForm.jsx
│   └── ...
├── lib/                 # Utilities and store
│   ├── features/        # Redux slices
│   ├── hooks/          # Custom hooks
│   ├── store.js        # Redux store
│   └── utils.js        # Utility functions
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or extract the project**
2. **Navigate to the project directory**
3. **Install dependencies:**

\`\`\`bash
npm install
\`\`\`

4. **Start the development server:**

\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser and visit:** `http://localhost:3000`

## 🔐 Demo Login

Use these credentials to access the system:

- **Email:** `admin@gmail.com`
- **Password:** `1234`

*Click "Click here to auto-fill" on the login page for quick access*

## 📊 Dashboard Features

### **All Charts Now Working:**
- ✅ **Pie Chart** - Proposal status distribution
- ✅ **Bar Chart** - Priority level breakdown  
- ✅ **Area Chart** - Monthly trends with gradients
- ✅ **Line Chart** - Value trends over time

### **Interactive Elements:**
- 🖱️ **Hover tooltips** on all chart elements
- 📈 **Real-time data** updates
- 🎨 **Custom styling** and animations
- 📱 **Responsive** chart layouts

## 🛠️ Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## ⚡ Vite Benefits

- **⚡ Lightning Fast** - Instant server start
- **🔥 Hot Module Replacement** - See changes instantly
- **📦 Optimized Build** - Tree-shaking and code splitting
- **🎯 Modern Tooling** - ES modules, TypeScript support

## 🎨 Customization

The application uses Tailwind CSS for styling and can be easily customized by modifying:

- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles and CSS variables
- Component-level styling in individual files

## 🔧 Development

### **Hot Reload:**
Changes to any file will automatically reload the browser thanks to Vite's HMR.

### **Path Aliases:**
Use `@/` to import from the `src` directory:
\`\`\`jsx
import { Button } from "@/components/ui/button"
import { store } from "@/lib/store"
\`\`\`

## 📈 Performance

- **Fast Development** - Vite's dev server starts in milliseconds
- **Optimized Production** - Automatic code splitting and tree-shaking
- **Modern Browser Support** - ES2020+ features
- **Efficient Bundling** - Only load what you need

## 🚀 Deployment

### Build for Production:
\`\`\`bash
npm run build
\`\`\`

### Preview Production Build:
\`\`\`bash
npm run preview
\`\`\`

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Vite + React + Redux Toolkit**
