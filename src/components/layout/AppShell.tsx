import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from './Toast';
import { useAppStore } from '../../store/useAppStore';

export function AppShell() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
        }`}
      >
        <TopBar />
        <main className="p-4 lg:p-6 max-w-[1600px]">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
