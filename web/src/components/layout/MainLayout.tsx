import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import ProPlanModal from '../modals/ProPlanModal';
import { useErrorStore } from '../../utils/errorHandler';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { showProModal, closeProModal } = useErrorStore();

  return (
    <div className="min-h-screen bg-dashboard-gray dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <main className="ml-64 p-8 bg-dashboard-gray dark:bg-gray-900 min-h-screen">
        <Header />
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Modal Global para Plan Pro */}
      <ProPlanModal 
        isOpen={showProModal} 
        onClose={closeProModal} 
      />
    </div>
  );
}
