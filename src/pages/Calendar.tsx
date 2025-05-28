import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
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

const localizer = momentLocalizer(moment);

// Mock data for calendar events
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    start: new Date(2024, 11, 15, 10, 0), // December 15, 2024, 10:00 AM
    end: new Date(2024, 11, 15, 11, 0),   // December 15, 2024, 11:00 AM
    createdBy: 'John Doe',
    attendees: ['john@example.com', 'jane@example.com'],
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Deadline',
    description: 'Final submission due',
    start: new Date(2024, 11, 20, 14, 0), // December 20, 2024, 2:00 PM
    end: new Date(2024, 11, 20, 16, 0),   // December 20, 2024, 4:00 PM
    createdBy: 'Jane Smith',
    attendees: ['jane@example.com'],
    location: 'Online'
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Present quarterly results',
    start: new Date(2024, 11, 22, 9, 0),  // December 22, 2024, 9:00 AM
    end: new Date(2024, 11, 22, 10, 30),  // December 22, 2024, 10:30 AM
    createdBy: 'Mike Johnson',
    attendees: ['mike@example.com', 'client@example.com'],
    location: 'Main Office'
  },
  {
    id: '4',
    title: 'Holiday Party',
    description: 'Annual company holiday celebration',
    start: new Date(2024, 11, 24, 18, 0), // December 24, 2024, 6:00 PM
    end: new Date(2024, 11, 24, 22, 0),   // December 24, 2024, 10:00 PM
    createdBy: 'HR Team',
    attendees: ['all@company.com'],
    location: 'Company Lounge'
  },
  {
    id: '5',
    title: 'Code Review',
    description: 'Review new features implementation',
    start: new Date(2024, 11, 18, 15, 0), // December 18, 2024, 3:00 PM
    end: new Date(2024, 11, 18, 16, 30),  // December 18, 2024, 4:30 PM
    createdBy: 'Tech Lead',
    attendees: ['dev1@example.com', 'dev2@example.com'],
    location: 'Dev Room'
  }
];

// Mock fetch function to simulate API call
const fetchMockEvents = async (): Promise<CalendarEvent[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Fetching mock events:', mockEvents);
  return mockEvents;
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Try to fetch from Supabase first
        await fetchEvents();
      } else {
        // Load mock data for demo
        const mockData = await fetchMockEvents();
        setEvents(mockData);
        toast({
          title: "Demo Mode",
          description: "Showing mock events - login to see your actual events",
        });
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to mock data on error
      const mockData = await fetchMockEvents();
      setEvents(mockData);
      toast({
        title: "Using Mock Data",
        description: "Loaded sample events for demonstration",
      });
    } finally {
      setLoading(false);
    }
  };

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
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setSampleEvents();
        return;
      }

      const formattedEvents: CalendarEvent[] = data?.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        teamId: event.team_id,
        createdBy: 'User',
        attendees: parseAttendees(event.attendees),
        location: event.location,
        isGoogleEvent: event.is_google_event,
        googleEventId: event.google_event_id
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSampleEvents();
      toast({
        title: "Info",
        description: "Showing sample events - please set up authentication",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          start_time: newEvent.start.toISOString(),
          end_time: newEvent.end.toISOString(),
          team_id: newEvent.teamId,
          created_by: user?.id,
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update events",
        variant: "destructive"
      });
      return;
    }

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete events",
        variant: "destructive"
      });
      return;
    }

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
