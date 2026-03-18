# Maximilian Web V3

Maximilian Web V3 is a modern web application built for a "Safety Report" system with a specialized administrative interface. It is designed for scalability and performance.

## 🛠️ Technology Stack

- **Frontend Framework:** [React 19](https://react.dev/)
- **Node.js:** v24
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Language:** TypeScript (~5.9.3)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State/Data Management:** [@tanstack/react-query](https://tanstack.com/query/latest)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Authentication:** [AWS Amplify](https://docs.amplify.aws/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

The codebase is organized in `src/` as follows:

```text
src/
├── components/   # Reusable UI components (e.g., Sidebar, Header, AdminLayout)
├── config/       # Configuration setup (e.g., AWS config)
├── hooks/        # Custom React hooks (e.g., API calls, form handling)
├── pages/        # Application views, organized by role/module (e.g., Admin)
├── router/       # Routing configuration, modularized by role
├── schemas/      # Zod validation schemas
├── services/     # API service configurations using Axios
└── shared/       # Shared types, utilities, and constants
```

## ⚙️ Environment Configuration

Create a `.env` file in the root of the project to set up your environment variables.

### `.env` Example

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
VITE_COGNITO_CLIENT_ID=your_cognito_client_id
VITE_API_URL=https://your-api-url.com
VITE_DEBOUNCE_MS=1000
```

## 🚀 How to Run the Project

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will start the Vite dev server with Hot Module Replacement (HMR).

## 🏗️ How to Build

To compile the project for production, run:

```bash
npm run build
```

This command runs type-checking (`tsc -b`) and then builds the assets using Vite. The output will be inside the `dist` folder.

To preview the production build locally:

```bash
npm run preview
```

## 🧪 Linting

To check for code quality and style issues, run:

```bash
npm run lint
```
