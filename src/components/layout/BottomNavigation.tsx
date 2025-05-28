
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User, Calendar, CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard' },
  { icon: Users, label: 'Teams', href: '/teams' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                isActive
                  ? "text-cbcc-primary bg-green-50"
                  : "text-gray-500 hover:text-cbcc-primary"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
