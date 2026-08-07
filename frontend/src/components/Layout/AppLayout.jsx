import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { SidebarProvider } from "./SidebarContext";

export default function AppLayout() {
  const location = useLocation();
  const isChat = location.pathname.startsWith("/chat");

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-base">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main
            className={`flex-1 overflow-y-auto ${
              isChat ? "overflow-hidden p-0" : "p-4 sm:p-6 lg:p-8"
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
