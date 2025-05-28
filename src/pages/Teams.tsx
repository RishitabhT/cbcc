
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Team } from '@/types/team';
import { TeamCard } from '@/components/teams/TeamCard';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const mockTeams: Team[] = [
  {
    id: 'content',
    name: 'Content Team',
    description: 'Responsible for creating engaging content for social media and marketing campaigns.',
    teamHeadId: 'sarah@campusbinge.com',
    members: ['john@campusbinge.com', 'jane@campusbinge.com', 'alex@campusbinge.com'],
    createdAt: new Date('2024-01-01'),
    color: '#FF6B6B',
  },
  {
    id: 'outreach',
    name: 'Outreach Team',
    description: 'Focuses on building partnerships with universities and organizing campus events.',
    teamHeadId: 'mike@campusbinge.com',
    members: ['emma@campusbinge.com', 'david@campusbinge.com'],
    createdAt: new Date('2024-01-02'),
    color: '#4ECDC4',
  },
  {
    id: 'events',
    name: 'Events Team',
    description: 'Plans and executes campus events, festivals, and student engagement activities.',
    teamHeadId: 'lisa@campusbinge.com',
    members: ['tom@campusbinge.com', 'amy@campusbinge.com', 'chris@campusbinge.com'],
    createdAt: new Date('2024-01-03'),
    color: '#45B7D1',
  },
];

const Teams: React.FC = () => {
  const [teams] = useState<Team[]>(mockTeams);

  const handleTeamClick = (team: Team) => {
    console.log('Team clicked:', team.name);
    // Navigate to team details or open team management modal
  };

  return (
    <div className="min-h-screen bg-cbcc-background">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cbcc-primary">Teams</h1>
          <Button className="gradient-primary rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Teams;
