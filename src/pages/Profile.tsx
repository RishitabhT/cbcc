
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Users, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cbcc-background to-green-50">
      <div className="p-4 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src="/lovable-uploads/2748bf15-4308-48e5-ae2e-d5f095dfa1a4.png" 
            alt="Campus Binge Logo" 
            className="h-8"
          />
          <h1 className="text-2xl font-bold text-cbcc-primary">Profile</h1>
        </div>

        <Card className="shadow-2xl border-0 mb-6 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cbcc-primary to-cbcc-green-light rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <Badge className="mt-1 bg-cbcc-primary text-white" variant="secondary">
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.teams.length} Teams</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 mb-6 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-cbcc-primary">0</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Active Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={logout}
          variant="outline" 
          className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50 bg-white/95 backdrop-blur-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
