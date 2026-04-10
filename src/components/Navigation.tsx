import type { ViewMode } from '../types';
import { Home, Settings, Sun, Moon, Smartphone, BookOpen } from 'lucide-react';
// @ts-ignore - lucide-react types

export type Theme = 'dark' | 'day' | 'phone';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const THEME_CYCLE: Theme[] = ['dark', 'day', 'phone'];

const THEME_ICON: Record<Theme, React.ReactNode> = {
  dark:  <Moon  size={16} />,
  day:   <Sun   size={16} />,
  phone: <Smartphone size={16} />,
};

const THEME_LABEL: Record<Theme, string> = {
  dark:  'Dark',
  day:   'Day',
  phone: 'Phone',
};

export function Navigation({ currentView, onViewChange, theme, onThemeChange }: NavigationProps) {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Generator', icon: <Home size={20} /> },
    { id: 'glossary',  label: 'Glossary',  icon: <BookOpen size={20} /> },
    { id: 'settings',  label: 'Settings',  icon: <Settings size={20} /> },
  ];

  const base = import.meta.env.BASE_URL;

  return (
    <nav style={{ backgroundColor: 'var(--bg-card)' }} className="border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e53935] to-[#ff6b6b] flex items-center justify-center font-bold text-white">
              M
            </div>
            <span className="font-bold text-lg tracking-wider">
              MNEME <span className="text-[#e53935]">CE</span>
            </span>
          </div>

          {/* Nav items */}
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

            {/* Theme selector — three always-visible icon buttons (QA-005) */}
            <div className="flex items-center gap-0.5">
              {THEME_CYCLE.map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  title={`${THEME_LABEL[t]} theme`}
                  className={`p-2 rounded-lg transition-all ${
                    theme === t
                      ? 'bg-[#e53935] text-white'
                      : 'text-[#9e9e9e] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {THEME_ICON[t]}
                </button>
              ))}
            </div>

            {/* GI7B logo (QA-002) */}
            <a
              href="https://github.com/Game-in-the-Brain"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center opacity-70 hover:opacity-100 transition-opacity"
              title="Game in the Brain on GitHub"
            >
              <img
                src={`${base}gitb_gi7b_logo_512.png`}
                alt="Game in the Brain"
                className="h-8 w-8 rounded"
              />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
