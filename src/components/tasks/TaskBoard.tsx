
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task } from '@/types/team';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new IG post template',
    description: 'Create a modern template for Instagram posts',
    dueDate: new Date('2024-01-15'),
    priority: 'High',
    status: 'To Do',
    assignedTo: 'john@campusbinge.com',
    teamId: 'content',
    createdBy: 'admin@campusbinge.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Plan campus event outreach',
    description: 'Coordinate with universities for upcoming events',
    dueDate: new Date('2024-01-20'),
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'jane@campusbinge.com',
    teamId: 'outreach',
    createdBy: 'admin@campusbinge.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Update team documentation',
    description: 'Update the team handbook with new processes',
    dueDate: new Date('2024-01-10'),
    priority: 'Low',
    status: 'Done',
    assignedTo: 'mike@campusbinge.com',
    teamId: 'content',
    createdBy: 'admin@campusbinge.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const statusColumns = [
  { id: 'To Do', title: 'To Do', color: 'bg-gray-100' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'Done', title: 'Done', color: 'bg-green-100' },
  { id: 'Blocked', title: 'Blocked', color: 'bg-red-100' },
];

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [...prev, task]);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date() }
        : task
    ));
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cbcc-primary">Task Board</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gradient-primary rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map(column => (
          <Card key={column.id} className="shadow-cbcc border-0">
            <CardHeader className={`rounded-t-lg ${column.color}`}>
              <CardTitle className="text-lg font-semibold text-center">
                {column.title}
                <span className="ml-2 text-sm bg-white text-gray-600 px-2 py-1 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 min-h-96">
              {getTasksByStatus(column.id).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};
