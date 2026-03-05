import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LogOut, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MobileHeader: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
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
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex h-14 items-center justify-between px-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="img-riviera.jpeg" alt="Riviera" className="h-8 w-8 rounded-md object-cover" />
          <span className="text-lg font-bold text-foreground">Riviera</span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="text-right mr-1">
            <p className="text-xs font-medium text-foreground leading-tight truncate max-w-[100px]">
              {profile?.nome?.split(' ')[0]}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              B{profile?.bloco} Apt{profile?.apartamento}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                Meu Perfil
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/pessoas-autorizadas')}>
                  Autorizados
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-secondary text-sm"
            />
          </div>
        </form>
      </div>
    </header>
  );
};
