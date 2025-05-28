
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
  dueTime?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  assignedTo: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  teamId?: string;
  createdBy: string;
  attendees?: string[];
  location?: string;
  isGoogleEvent?: boolean;
  googleEventId?: string;
}
