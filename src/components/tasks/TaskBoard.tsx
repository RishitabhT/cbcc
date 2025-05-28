
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task } from '@/types/team';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const statusColumns = [
  { id: 'To Do', title: 'To Do', color: 'bg-gray-100' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'Done', title: 'Done', color: 'bg-green-100' },
  { id: 'Blocked', title: 'Blocked', color: 'bg-red-100' },
];

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const parseSubtasks = (subtasks: any): Array<{ id: string; title: string; completed: boolean; }> => {
    if (!subtasks) return [];
    if (Array.isArray(subtasks)) {
      return subtasks.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: item.id || String(Date.now()),
            title: item.title || '',
            completed: Boolean(item.completed)
          };
        }
        return {
          id: String(Date.now()),
          title: String(item),
          completed: false
        };
      });
    }
    return [];
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks' as any)
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_to_fkey(name, username),
          team:teams(name, color),
          creator:profiles!tasks_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        // Fallback query without joins if relationships fail
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('tasks' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        const formattedTasks: Task[] = fallbackData?.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          dueDate: new Date(task.due_date),
          dueTime: task.due_time || undefined,
          priority: task.priority as 'Low' | 'Medium' | 'High',
          status: task.status as 'To Do' | 'In Progress' | 'Done' | 'Blocked',
          assignedTo: 'Unknown User',
          teamId: task.team_id || '',
          createdBy: 'Unknown User',
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          subtasks: parseSubtasks(task.subtasks)
        })) || [];

        setTasks(formattedTasks);
        return;
      }

      const formattedTasks: Task[] = data?.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        dueDate: new Date(task.due_date),
        dueTime: task.due_time || undefined,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        status: task.status as 'To Do' | 'In Progress' | 'Done' | 'Blocked',
        assignedTo: task.assigned_user?.username || 'Unknown User',
        teamId: task.team_id || '',
        createdBy: (task.creator as any)?.name || 'Unknown User',
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        subtasks: parseSubtasks(task.subtasks)
      })) || [];

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('id')
        .eq('id', user?.id)
        .single();

      const { data: assignedProfile } = await supabase
        .from('profiles' as any)
        .select('id')
        .eq('username', newTask.assignedTo)
        .single();

      const { data, error } = await supabase
        .from('tasks' as any)
        .insert({
          title: newTask.title,
          description: newTask.description,
          due_date: newTask.dueDate.toISOString().split('T')[0],
          due_time: newTask.dueTime,
          priority: newTask.priority,
          status: newTask.status,
          assigned_to: assignedProfile?.id,
          team_id: newTask.teamId,
          created_by: profile?.id,
          subtasks: newTask.subtasks || []
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task created successfully"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks' as any)
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate?.toISOString().split('T')[0],
          due_time: updates.dueTime,
          priority: updates.priority,
          status: updates.status,
          subtasks: updates.subtasks,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks' as any)
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/2748bf15-4308-48e5-ae2e-d5f095dfa1a4.png" 
            alt="Campus Binge Logo" 
            className="h-10"
          />
          <h1 className="text-3xl font-bold text-emerald-800">Task Board</h1>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map(column => (
          <Card key={column.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
                  onStatusChange={(taskId, newStatus) => handleUpdateTask(taskId, { status: newStatus })}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
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

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
};
