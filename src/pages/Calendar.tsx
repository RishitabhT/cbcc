
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const Calendar: React.FC = () => {
  return (
    <div className="min-h-screen bg-cbcc-background">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cbcc-primary">Calendar</h1>
          <Button className="gradient-primary rounded-xl">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Team Standup</h3>
                  <p className="text-sm text-gray-600">Content Team • Today 2:00 PM</p>
                </div>
                <div className="text-sm text-cbcc-primary font-medium">In 2 hours</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Campus Event Planning</h3>
                  <p className="text-sm text-gray-600">Events Team • Tomorrow 10:00 AM</p>
                </div>
                <div className="text-sm text-gray-500">Tomorrow</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Monthly Review</h3>
                  <p className="text-sm text-gray-600">All Teams • Jan 15, 3:00 PM</p>
                </div>
                <div className="text-sm text-gray-500">Jan 15</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-cbcc border-0">
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Google Calendar Integration</h3>
            <p className="text-gray-600 mb-4">Connect your Google Calendar to sync events and meetings</p>
            <Button variant="outline" className="rounded-xl">
              Connect Google Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Calendar;
