import { type RouteObject } from "react-router";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    lazy: () =>
      import("@maximilian/pages/Auth/LoginPage").then((m) => ({
        Component: m.default,
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
