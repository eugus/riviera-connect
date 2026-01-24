import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Home,
  Megaphone,
  Newspaper,
  CalendarDays,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sun,
  BookOpen,
  Package,
  Users,
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
  { path: '/pessoas-autorizadas', label: 'Autorizados', icon: Users, adminOnly: true },
  { path: '/perfil', label: 'Perfil', icon: User },
];

export const AppLayout: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center ">
              <Sun className="h-6 w-6 text-primary-foreground" />
              <img src="img-riviera.jpeg" alt="" />
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:inline-block">
              Riviera
            </span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar avisos, notícias, documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
          </form>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">{profile?.nome}</p>
              <p className="text-xs text-muted-foreground">
                Bloco {profile?.bloco} - Apt {profile?.apartamento}
                {isAdmin && <span className="ml-2 text-primary font-semibold">(Admin)</span>}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              className="hidden md:flex"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden border-t border-border px-4 py-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              // Oculta itens adminOnly para não-admins
              if ((item as any).adminOnly && !isAdmin) {
                return null;
              }

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
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar shadow-xl animate-slide-in pt-16">
              <div className="p-4 border-b border-sidebar-border">
                <p className="font-medium text-foreground">{profile?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Bloco {profile?.bloco} - Apt {profile?.apartamento}
                </p>
                {isAdmin && (
                  <span className="inline-block mt-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Administrador
                  </span>
                )}
              </div>

              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  // Oculta itens adminOnly para não-admins
                  if ((item as any).adminOnly && !isAdmin) {
                    return null;
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
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
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
