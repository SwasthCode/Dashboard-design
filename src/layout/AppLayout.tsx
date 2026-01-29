import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, Navigate } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useSelector } from 'react-redux';

const LayoutContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // Simple check for token validity
  // Ideally use Redux selector, but consistent with authSlice logic
  const token = useSelector((state: any) => state.auth.token) || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
