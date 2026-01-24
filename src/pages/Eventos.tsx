import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  MapPin,
  List,
  CalendarIcon,
} from 'lucide-react';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_evento: string;
  local: string;
  created_at: string;
  autor_id: string;
}

export default function Eventos() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    local: '',
  });

  const fetchEventos = async () => {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data_evento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const upcomingEventos = eventos.filter(
    (e) => new Date(e.data_evento) >= new Date()
  );

  const pastEventos = eventos.filter(
    (e) => new Date(e.data_evento) < new Date()
  );

  const eventDates = eventos.map((e) => new Date(e.data_evento));

  const selectedDateEventos = selectedDate
    ? eventos.filter((e) => isSameDay(new Date(e.data_evento), selectedDate))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingEvento) {
        const { error } = await supabase
          .from('eventos')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao,
            data_evento: formData.data_evento,
            local: formData.local,
          })
          .eq('id', editingEvento.id);

        if (error) throw error;
        toast({ title: 'Evento atualizado com sucesso!' });
      } else {
        const { error } = await supabase.from('eventos').insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          data_evento: formData.data_evento,
          local: formData.local,
          autor_id: profile?.id,
        });

        if (error) throw error;
        toast({ title: 'Evento criado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingEvento(null);
      setFormData({ titulo: '', descricao: '', data_evento: '', local: '' });
      fetchEventos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir evento',
        description: error.message,
      });
    } else {
      toast({ title: 'Evento excluído com sucesso!' });
      fetchEventos();
    }
  };

  const openEditDialog = (evento: Evento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao,
      data_evento: evento.data_evento.slice(0, 16),
      local: evento.local,
    });
    setIsDialogOpen(true);
  };

  const EventCard = ({ evento, isPast = false }: { evento: Evento; isPast?: boolean }) => (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{evento.titulo}</CardTitle>
          {isAdmin && !isPast && (
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEditDialog(evento)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(evento.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Clock className="h-4 w-4" />
          {format(new Date(evento.data_evento), "dd 'de' MMMM 'às' HH:mm", {
            locale: ptBR,
          })}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {evento.local}
        </div>
        <p className="text-foreground">{evento.descricao}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Eventos
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os próximos eventos do condomínio
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="gap-1"
            >
              <List className="h-4 w-4" /> Lista
            </Button>
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="gap-1"
            >
              <CalendarIcon className="h-4 w-4" /> Calendário
            </Button>
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setEditingEvento(null);
                    setFormData({ titulo: '', descricao: '', data_evento: '', local: '' });
                  }}
                >
                  <Plus className="h-5 w-5" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvento ? 'Editar Evento' : 'Novo Evento'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Nome do evento"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_evento">Data e Horário</Label>
                    <Input
                      id="data_evento"
                      type="datetime-local"
                      value={formData.data_evento}
                      onChange={(e) =>
                        setFormData({ ...formData, data_evento: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                      placeholder="Ex: Salão de Festas"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Detalhes do evento..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingEvento ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%',
                },
              }}
              className="mx-auto"
            />
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedDate
                ? `Eventos em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                : 'Selecione uma data'}
            </h3>
            {selectedDate && selectedDateEventos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento nesta data</p>
            ) : (
              selectedDateEventos.map((evento) => (
                <EventCard key={evento.id} evento={evento} />
              ))
            )}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              Próximos ({upcomingEventos.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              Passados ({pastEventos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingEventos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Nenhum evento programado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingEventos.map((evento) => (
                  <EventCard key={evento.id} evento={evento} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastEventos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-lg text-muted-foreground">
                    Nenhum evento passado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastEventos.map((evento) => (
                  <EventCard key={evento.id} evento={evento} isPast />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
