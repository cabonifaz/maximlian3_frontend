# Maximilian Web V3 - Project Overview

Maximilian Web V3 is a modern web application built with **React 19**, **TypeScript**, and **Vite**. It features a robust architecture designed for scalability, using **Tailwind CSS v4** for styling and **React Router v7** for navigation. The project is focused on a "Safety Report" system with a specialized administrative interface.

## 🚀 Building and Running

### Development
To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Build
To compile the project for production:
```bash
npm run build
```
This command runs type-checking (`tsc`) and then builds the assets using Vite.

### Linting
To check for code quality and style issues:
```bash
npm run lint
```

### Preview
To preview the production build locally:
```bash
npm run preview
```

## 🛠️ Technology Stack
- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using the new `@theme` API)
- **Routing:** React Router v7 (configured with `createBrowserRouter`)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Linting:** ESLint 9

## 📂 Architecture and Conventions

### Directory Structure
- `src/components/`: Reusable UI components (e.g., `Sidebar`, `Header`, `AdminLayout`).
- `src/hooks/`: Custom React hooks (e.g., `useAsyncService` for handling API calls with cancellation).
- `src/pages/`: Application views, organized by role/module (e.g., `src/pages/Admin/`).
- `src/router/`: Routing configuration, modularized by role (e.g., `admin.routes.tsx`).
- `src/services/`: API service configurations using Axios.
- `src/shared/`: Shared types, utilities, and constants.

### Key Conventions
- **Path Aliases:** Use `@maximilian/*` to reference the `src/` directory (configured in `tsconfig.app.json`).
- **Styling:** Tailwind CSS v4 is used with custom brand colors defined in `src/index.css`:
    - `--color-brand-wine`: `#722f37` (Primary actions)
    - `--color-brand-black`: `#000000`
    - `--color-brand-white`: `#ffffff`
- **Async Operations:** Prefer using the `useAsyncService` hook for API interactions to ensure proper loading states, error handling, and request cancellation via `AbortController`.
- **Routing:** Routes are modularized. Role-based routes should be defined in separate files within `src/router/` and imported into the main router in `src/router/index.tsx`.
- **Components:** Favor functional components with TypeScript interfaces for props. Use Lucide React for icons.

## 🧪 Testing and Validation
- Currently, the project uses ESLint for static analysis.
- Ensure all new components follow the established design language (Black/White/Wine Red).
- Verify that changes don't break the responsive layout of the `AdminLayout`.
