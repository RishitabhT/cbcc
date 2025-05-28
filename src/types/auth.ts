
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Master' | 'Team Head' | 'Member';
  teams: string[];
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
