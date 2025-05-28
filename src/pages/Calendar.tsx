
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { CalendarEvent } from '@/types/team';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          team:teams(name, color),
          creator:cbcc_profiles!events_created_by_fkey(name)
        `)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        // Fallback query without joins if relationships fail
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });

        if (fallbackError) throw fallbackError;

        const formattedEvents: CalendarEvent[] = fallbackData?.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          teamId: event.team_id,
          createdBy: 'Unknown User',
          attendees: Array.isArray(event.attendees) ? event.attendees as string[] : [],
          location: event.location,
          isGoogleEvent: event.is_google_event,
          googleEventId: event.google_event_id
        })) || [];

        setEvents(formattedEvents);
        return;
      }

      const formattedEvents: CalendarEvent[] = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        teamId: event.team_id,
        createdBy: event.creator?.name || 'Unknown User',
        attendees: Array.isArray(event.attendees) ? event.attendees as string[] : [],
        location: event.location,
        isGoogleEvent: event.is_google_event,
        googleEventId: event.google_event_id
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy'>) => {
    try {
      const { data: profile } = await supabase
        .from('cbcc_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start.toISOString(),
          end_time: eventData.end.toISOString(),
          team_id: eventData.teamId,
          created_by: profile?.id,
          attendees: eventData.attendees,
          location: eventData.location
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEvents();
      toast({
        title: "Success",
        description: "Event created successfully"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.start?.toISOString(),
          end_time: updates.end?.toISOString(),
          attendees: updates.attendees,
          location: updates.location
        })
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
      toast({
        title: "Success",
        description: "Event updated successfully"
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await fetchEvents();
      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const upcomingEvents = events.filter(event => event.start > new Date()).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/2748bf15-4308-48e5-ae2e-d5f095dfa1a4.png" 
              alt="Campus Binge Logo" 
              className="h-10"
            />
            <h1 className="text-3xl font-bold text-emerald-800">Calendar</h1>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        <Card className="shadow-xl border-0 mb-6 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-800">{event.title}</h3>
                      <p className="text-sm text-emerald-600">
                        {event.start.toLocaleDateString()} at {event.start.toLocaleTimeString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-emerald-500">{event.location}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingEvent(event)}
                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <CalendarIcon className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-emerald-800">Google Calendar Integration</h3>
            <div>
              <p className="text-gray-600 mb-6">Connect your Google Calendar to sync events and meetings</p>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Connect Google Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />

      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdateEvent={handleUpdateEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
