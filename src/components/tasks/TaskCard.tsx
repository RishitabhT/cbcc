
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Edit, Trash2, Clock, CheckSquare } from 'lucide-react';
import { Task } from '@/types/team';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete }) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-cbcc-primary">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm line-clamp-2">{task.title}</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(task)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task.id)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>
          
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span className={cn(isOverdue && "text-red-600 font-medium")}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {task.dueTime && (
              <>
                <Clock className="h-3 w-3" />
                <span>{task.dueTime}</span>
              </>
            )}
          </div>
          
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckSquare className="h-3 w-3" />
              <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{task.assignedTo.split('@')[0]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
