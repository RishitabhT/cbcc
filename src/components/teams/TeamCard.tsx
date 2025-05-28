
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';
import { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  onClick: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 shadow-cbcc border-0 hover:scale-105"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-cbcc-primary">{team.name}</CardTitle>
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: team.color }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
