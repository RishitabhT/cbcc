
import React from 'react';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <TaskBoard />
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
