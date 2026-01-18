import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Megaphone,
  Plus,
  AlertTriangle,
  Bell,
  Pencil,
  Trash2,
  Loader2,
  Search,
} from 'lucide-react';

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'normal' | 'importante' | 'urgente';
  created_at: string;
  autor_id: string;
}

export default function Avisos() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'normal' as 'normal' | 'importante' | 'urgente',
  });

  const fetchAvisos = async () => {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .order('prioridade', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avisos:', error);
    } else {
      setAvisos((data as Aviso[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const filteredAvisos = avisos.filter((aviso) => {
    const matchSearch =
      aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrioridade = filterPrioridade === 'all' || aviso.prioridade === filterPrioridade;
    return matchSearch && matchPrioridade;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAviso) {
        const { error } = await supabase
          .from('avisos')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao,
            prioridade: formData.prioridade,
          })
          .eq('id', editingAviso.id);

        if (error) throw error;
        toast({ title: 'Aviso atualizado com sucesso!' });
      } else {
        const { error } = await supabase.from('avisos').insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          prioridade: formData.prioridade,
          autor_id: profile?.id,
        });

        if (error) throw error;
        toast({ title: 'Aviso criado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingAviso(null);
      setFormData({ titulo: '', descricao: '', prioridade: 'normal' });
      fetchAvisos();
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
    if (!confirm('Tem certeza que deseja excluir este aviso?')) return;

    const { error } = await supabase.from('avisos').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir aviso',
        description: error.message,
      });
    } else {
      toast({ title: 'Aviso excluído com sucesso!' });
      fetchAvisos();
    }
  };

  const openEditDialog = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setFormData({
      titulo: aviso.titulo,
      descricao: aviso.descricao,
      prioridade: aviso.prioridade,
    });
    setIsDialogOpen(true);
  };

  const getPriorityConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return {
          color: 'bg-destructive text-destructive-foreground',
          borderColor: 'border-l-destructive',
          icon: AlertTriangle,
          label: 'Urgente',
        };
      case 'importante':
        return {
          color: 'bg-warning text-warning-foreground',
          borderColor: 'border-l-warning',
          icon: Bell,
          label: 'Importante',
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground',
          borderColor: 'border-l-primary',
          icon: Megaphone,
          label: 'Normal',
        };
    }
  };

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
            <Megaphone className="h-8 w-8 text-primary" />
            Avisos e Comunicados
          </h1>
          <p className="text-muted-foreground mt-1">
            Fique por dentro das novidades do condomínio
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingAviso(null);
                  setFormData({ titulo: '', descricao: '', prioridade: 'normal' });
                }}
              >
                <Plus className="h-5 w-5" />
                Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAviso ? 'Editar Aviso' : 'Novo Aviso'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Título do aviso"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes do aviso..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value: 'normal' | 'importante' | 'urgente') =>
                      setFormData({ ...formData, prioridade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="importante">Importante</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {editingAviso ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar avisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="importante">Importante</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Avisos List */}
      {filteredAvisos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {searchTerm || filterPrioridade !== 'all'
                ? 'Nenhum aviso encontrado com os filtros aplicados'
                : 'Nenhum aviso cadastrado ainda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAvisos.map((aviso) => {
            const config = getPriorityConfig(aviso.prioridade);
            const Icon = config.icon;

            return (
              <Card
                key={aviso.id}
                className={`border-l-4 ${config.borderColor} shadow-sm hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(aviso.created_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={config.color}>{config.label}</Badge>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(aviso)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(aviso.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{aviso.descricao}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
