
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEvent } from '@/types/team';

interface EditEventDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
}

export const EditEventDialog: React.FC<EditEventDialogProps> = ({
  event,
  isOpen,
  onClose,
  onUpdateEvent,
}) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    startDate: event.start.toISOString().split('T')[0],
    startTime: event.start.toTimeString().slice(0, 5),
    endDate: event.end.toISOString().split('T')[0],
    endTime: event.end.toTimeString().slice(0, 5),
    location: event.location || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.start.toISOString().split('T')[0],
        startTime: event.start.toTimeString().slice(0, 5),
        endDate: event.end.toISOString().split('T')[0],
        endTime: event.end.toTimeString().slice(0, 5),
        location: event.location || ''
      });
    }
  }, [isOpen, event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    onUpdateEvent(event.id, {
      title: formData.title,
      description: formData.description,
      start: startDateTime,
      end: endDateTime,
      location: formData.location
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-cbcc-primary">Edit Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the event"
              rows={3}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Event location"
              className="rounded-xl"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-cbcc-primary hover:bg-cbcc-green-dark text-white rounded-xl">
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
