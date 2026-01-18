import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Newspaper,
  CalendarDays,
  FileText,
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'normal' | 'importante' | 'urgente';
  created_at: string;
}

interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
}

interface Evento {
  id: string;
  titulo: string;
  data_evento: string;
  local: string;
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar avisos recentes
        const { data: avisosData } = await supabase
          .from('avisos')
          .select('*')
          .order('prioridade', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);

        // Buscar notícias recentes
        const { data: noticiasData } = await supabase
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        // Buscar próximos eventos
        const { data: eventosData } = await supabase
          .from('eventos')
          .select('*')
          .gte('data_evento', new Date().toISOString())
          .order('data_evento', { ascending: true })
          .limit(3);

        setAvisos((avisosData as Aviso[]) || []);
        setNoticias(noticiasData || []);
        setEventos(eventosData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const urgentAvisos = avisos.filter((a) => a.prioridade === 'urgente');

  const getPriorityConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
      case 'importante':
        return { color: 'bg-warning text-warning-foreground', icon: Bell };
      default:
        return { color: 'bg-muted text-muted-foreground', icon: Megaphone };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Olá, {profile?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao Portal do Condomínio Riviera
        </p>
      </div>

      {/* Urgent Alerts Banner */}
      {urgentAvisos.length > 0 && (
        <Card className="border-destructive bg-destructive/10 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Avisos Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentAvisos.map((aviso) => (
              <Link
                key={aviso.id}
                to={`/avisos/${aviso.id}`}
                className="block p-3 bg-card rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold text-foreground">{aviso.titulo}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {aviso.descricao}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Avisos Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Avisos</CardTitle>
            </div>
            <Link to="/avisos">
              <Button variant="ghost" size="sm">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {avisos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum aviso no momento
              </p>
            ) : (
              <div className="space-y-3">
                {avisos.slice(0, 3).map((aviso) => {
                  const config = getPriorityConfig(aviso.prioridade);
                  return (
                    <Link
                      key={aviso.id}
                      to={`/avisos/${aviso.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {aviso.titulo}
                        </h4>
                        <Badge className={config.color} variant="secondary">
                          {aviso.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {aviso.descricao}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </div>
            <Link to="/eventos">
              <Button variant="ghost" size="sm">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum evento programado
              </p>
            ) : (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <Link
                    key={evento.id}
                    to={`/eventos/${evento.id}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h4 className="font-medium text-foreground">{evento.titulo}</h4>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(evento.data_evento), "dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evento.local}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas Notícias */}
        <Card className="shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Últimas Notícias</CardTitle>
            </div>
            <Link to="/noticias">
              <Button variant="ghost" size="sm">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {noticias.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma notícia publicada
              </p>
            ) : (
              <div className="space-y-3">
                {noticias.map((noticia) => (
                  <Link
                    key={noticia.id}
                    to={`/noticias/${noticia.id}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {noticia.titulo}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {noticia.conteudo}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {format(new Date(noticia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <Card className="shadow-md border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">
              Ações Rápidas (Administrador)
            </CardTitle>
            <CardDescription>
              Gerencie o conteúdo do portal do condomínio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/avisos/novo">
                <Button variant="outline" className="gap-2">
                  <Megaphone className="h-4 w-4" /> Novo Aviso
                </Button>
              </Link>
              <Link to="/noticias/nova">
                <Button variant="outline" className="gap-2">
                  <Newspaper className="h-4 w-4" /> Nova Notícia
                </Button>
              </Link>
              <Link to="/eventos/novo">
                <Button variant="outline" className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Novo Evento
                </Button>
              </Link>
              <Link to="/documentos/upload">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> Upload Documento
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
