
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  onClick: () => void;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick, onEdit, onDelete }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 shadow-cbcc border-0 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-cbcc-primary">{team.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(team);
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(team.id);
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div 
              className="w-4 h-4 rounded-full ml-2" 
              style={{ backgroundColor: team.color }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3" onClick={onClick}>
        <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{team.members.length} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(team.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          Team Head: {team.teamHeadId.split('@')[0]}
        </Badge>
      </CardContent>
    </Card>
  );
};
