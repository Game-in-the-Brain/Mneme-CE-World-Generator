import type { ViewMode } from '../types';
import { Home, Database, Settings } from 'lucide-react';
// @ts-ignore - lucide-react types

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Generator', icon: <Home size={20} /> },
    { id: 'log', label: 'Data Log', icon: <Database size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bg-[#141419] border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e53935] to-[#ff6b6b] flex items-center justify-center font-bold text-white">
              M
            </div>
            <span className="font-bold text-lg tracking-wider">
              MNEME <span className="text-[#e53935]">GENERATOR</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === item.id
                    ? 'bg-[#e53935] text-white'
                    : 'text-[#9e9e9e] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
