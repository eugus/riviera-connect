import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Megaphone,
  Newspaper,
  CalendarDays,
  FileText,
  BookOpen,
  Package,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const primaryTabs = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/avisos', label: 'Avisos', icon: Megaphone },
  { path: '/noticias', label: 'Notícias', icon: Newspaper },
  { path: '/eventos', label: 'Eventos', icon: CalendarDays },
];

const moreItems = [
  { path: '/documentos', label: 'Documentos', icon: FileText },
  { path: '/regras', label: 'Regras', icon: BookOpen },
  { path: '/encomendas', label: 'Encomendas', icon: Package },
  { path: '/faq', label: 'Dúvidas Frequentes', icon: HelpCircle },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isMoreActive = moreItems.some((item) => isActive(item.path));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        {/* Safe area for notch devices */}
        <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px]',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px]',
                  isMoreActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <MoreHorizontal className={cn('h-5 w-5', isMoreActive && 'text-primary')} />
                <span>Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]">
              <SheetHeader className="px-4 pb-2">
                <SheetTitle>Mais opções</SheetTitle>
              </SheetHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium leading-tight">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};
