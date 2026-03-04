import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LogOut } from 'lucide-react';

export const DesktopHeader: React.FC = () => {
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="img-riviera.jpeg" alt="Riviera" className="h-10 w-10 rounded-md object-cover" />
          <span className="text-xl font-bold text-foreground">Riviera</span>
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 max-w-md mx-8">
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

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{profile?.nome}</p>
            <p className="text-xs text-muted-foreground">
              Bloco {profile?.bloco} - Apt {profile?.apartamento}
              {isAdmin && <span className="ml-2 text-primary font-semibold">(Admin)</span>}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={handleSignOut} title="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
