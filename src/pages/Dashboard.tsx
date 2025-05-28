
import React from 'react';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-cbcc-background">
      <TaskBoard />
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
