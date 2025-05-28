import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/types/team';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
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

  const parseAttendees = (attendees: any): string[] => {
    if (!attendees) return [];
    if (Array.isArray(attendees)) {
      return attendees.map(item => String(item));
    }
    return [];
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          team:teams(name, color),
          creator:profiles!events_created_by_fkey(name)
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
          attendees: parseAttendees(event.attendees),
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
        createdBy: (event.creator as any)?.name || 'Unknown User',
        attendees: parseAttendees(event.attendees),
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

  const handleCreateEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          start_time: newEvent.start.toISOString(),
          end_time: newEvent.end.toISOString(),
          team_id: newEvent.teamId,
          created_by: profile?.id,
          location: newEvent.location,
          attendees: newEvent.attendees || []
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
          location: updates.location,
          attendees: updates.attendees,
          updated_at: new Date().toISOString()
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
  };

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
          <h1 className="text-3xl font-bold text-emerald-800">Calendar</h1>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            popup
            eventPropGetter={() => ({
              style: {
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
              },
            })}
          />
        </div>

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
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default CalendarPage;
