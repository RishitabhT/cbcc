
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
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEvents();
      checkGoogleConnection();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          team:teams(name, color),
          creator:created_by(name)
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        teamId: event.team_id,
        createdBy: event.creator?.name || '',
        attendees: event.attendees || [],
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

  const checkGoogleConnection = async () => {
    // Check if user has connected Google Calendar
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('integration_type', 'google_calendar')
        .single();

      if (data && !error) {
        setIsGoogleConnected(true);
      }
    } catch (error) {
      console.log('No Google Calendar connection found');
    }
  };

  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy'>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start.toISOString(),
          end_time: eventData.end.toISOString(),
          team_id: eventData.teamId,
          created_by: user?.id,
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
        .from('calendar_events')
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
        .from('calendar_events')
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

  const connectGoogleCalendar = async () => {
    try {
      // Call Google OAuth endpoint
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'connect' }
      });

      if (error) throw error;

      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
        toast({
          title: "Redirecting to Google",
          description: "Please authorize CBCC to access your Google Calendar"
        });
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive"
      });
    }
  };

  const upcomingEvents = events.filter(event => event.start > new Date()).slice(0, 3);

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
            <h1 className="text-2xl font-bold text-cbcc-primary">Calendar</h1>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-cbcc-primary hover:bg-cbcc-green-dark text-white rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        <Card className="shadow-cbcc border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cbcc-primary">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.start.toLocaleDateString()} at {event.start.toLocaleTimeString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500">{event.location}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-cbcc border-0">
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Google Calendar Integration</h3>
            {isGoogleConnected ? (
              <div>
                <p className="text-green-600 mb-4">✓ Google Calendar is connected</p>
                <Button variant="outline" className="rounded-xl">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Calendar
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Connect your Google Calendar to sync events and meetings</p>
                <Button 
                  onClick={connectGoogleCalendar}
                  className="bg-cbcc-primary hover:bg-cbcc-green-dark text-white rounded-xl"
                >
                  Connect Google Calendar
                </Button>
              </div>
            )}
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
