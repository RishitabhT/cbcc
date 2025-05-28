
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { Task } from '@/types/team';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'Medium' as Task['priority'],
    assignedTo: '',
    teamId: '',
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.teamId) {
      fetchTeamMembers(formData.teamId);
    }
  }, [formData.teamId]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams' as any)
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members' as any)
        .select(`
          user:profiles(id, name, username)
        `)
        .eq('team_id', teamId);

      if (error) throw error;
      
      const members = data?.map((item: any) => ({
        id: item.user?.id || '',
        name: item.user?.name || '',
        email: item.user?.username || ''
      })).filter((member: any) => member.id) || [];
      
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false
      }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive"
      });
      return;
    }

    onCreateTask({
      ...formData,
      status: 'To Do',
      dueDate: new Date(formData.dueDate),
      dueTime: formData.dueTime || undefined,
      createdBy: 'current-user',
      subtasks
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      priority: 'Medium',
      assignedTo: '',
      teamId: '',
    });
    setSubtasks([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
              className="rounded-xl border-emerald-200 focus:border-emerald-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task"
              rows={3}
              className="rounded-xl border-emerald-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.teamId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value, assignedTo: '' }))}
            >
              <SelectTrigger className="rounded-xl border-emerald-200">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
                className="rounded-xl border-emerald-200 focus:border-emerald-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                className="rounded-xl border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Task['priority']) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="rounded-xl border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger className="rounded-xl border-emerald-200">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.email}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subtasks / Checklist</Label>
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="rounded-xl border-emerald-200 focus:border-emerald-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <Button type="button" onClick={addSubtask} size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {subtasks.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 bg-emerald-50 rounded border border-emerald-100">
                    <Checkbox 
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                    />
                    <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                      {subtask.title}
                    </span>
                    <Button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-emerald-200">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
