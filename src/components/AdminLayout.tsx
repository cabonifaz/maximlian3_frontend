import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-white/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
