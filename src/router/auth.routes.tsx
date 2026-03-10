import { type RouteObject } from "react-router";
import LoginPage from "@maximilian/pages/Auth/LoginPage";
import RoleSelectionPage from "@maximilian/pages/Auth/RoleSelectionPage";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "select-role",
    element: <RoleSelectionPage />,
  },
];
