import { type RouteObject } from "react-router";
import { GuestGuard } from "@maximilian/components/auth/GuestGuard";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    lazy: () =>
      import("@maximilian/pages/Auth/LoginPage").then((m) => ({
        Component: () => (
          <GuestGuard>
            <m.default />
          </GuestGuard>
        ),
      })),
  },
  {
    path: "forgot-password",
    lazy: () =>
      import("@maximilian/pages/Auth/ForgotPasswordPage").then((m) => ({
        Component: () => (
          <GuestGuard>
            <m.default />
          </GuestGuard>
        ),
      })),
  },
  {
    path: "select-role",
    lazy: () =>
      import("@maximilian/pages/Auth/RoleSelectionPage").then((m) => ({
        Component: m.default,
      })),
  },
];
