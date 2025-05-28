
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Team } from '@/types/team';
import { TeamCard } from '@/components/teams/TeamCard';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { EditTeamDialog } from '@/components/teams/EditTeamDialog';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_head:team_head_id(name, email),
          team_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeams: Team[] = data?.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description || '',
        teamHeadId: team.team_head?.email || '',
        members: [], // Will be populated when needed
        createdAt: new Date(team.created_at),
        color: team.color || '#008000'
      })) || [];

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'members'>) => {
    try {
      // Get team head user ID
      const { data: teamHeadData } = await supabase
        .from('cbcc_profiles')
        .select('id')
        .eq('email', teamData.teamHeadId)
        .single();

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          color: teamData.color,
          team_head_id: teamHeadData?.id,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team created successfully"
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      let teamHeadId = null;
      if (updates.teamHeadId) {
        const { data: teamHeadData } = await supabase
          .from('cbcc_profiles')
          .select('id')
          .eq('email', updates.teamHeadId)
          .single();
        teamHeadId = teamHeadData?.id;
      }

      const { error } = await supabase
        .from('teams')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          team_head_id: teamHeadId,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team updated successfully"
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cbcc-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbcc-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cbcc-background">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/2748bf15-4308-48e5-ae2e-d5f095dfa1a4.png" 
              alt="Campus Binge Logo" 
              className="h-8"
            />
            <h1 className="text-2xl font-bold text-cbcc-primary">Teams</h1>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-cbcc-primary hover:bg-cbcc-green-dark text-white rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-4">Create your first team to get started</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-cbcc-primary hover:bg-cbcc-green-dark text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <TeamCard 
                key={team.id} 
                team={team} 
                onClick={() => console.log('Team clicked:', team.name)}
                onEdit={setEditingTeam}
                onDelete={handleDeleteTeam}
              />
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />

      <CreateTeamDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      {editingTeam && (
        <EditTeamDialog
          team={editingTeam}
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          onUpdateTeam={handleUpdateTeam}
        />
      )}
    </div>
  );
};

export default Teams;
