
export interface Team {
  id: string;
  name: string;
  description: string;
  teamHeadId: string;
  members: string[];
  createdAt: Date;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  assignedTo: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
