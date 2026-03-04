import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Home, Megaphone, Newspaper, CalendarDays, FileText,
  User, LogOut, BookOpen, Package, Users, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/avisos', label: 'Avisos', icon: Megaphone },
  { path: '/noticias', label: 'Notícias', icon: Newspaper },
  { path: '/eventos', label: 'Eventos', icon: CalendarDays },
  { path: '/documentos', label: 'Documentos', icon: FileText },
  { path: '/regras', label: 'Regras', icon: BookOpen },
  { path: '/encomendas', label: 'Encomendas', icon: Package },
  { path: '/faq', label: 'Dúvidas', icon: HelpCircle },
  { path: '/pessoas-autorizadas', label: 'Autorizados', icon: Users, adminOnly: true },
  { path: '/perfil', label: 'Perfil', icon: User },
];

export const DesktopSidebar: React.FC = () => {
  const { isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          if ((item as any).adminOnly && !isAdmin) return null;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
