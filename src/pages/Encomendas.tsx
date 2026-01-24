import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, Plus, Loader2, Search, Check, Building2, Home } from 'lucide-react';

interface Encomenda {
  id: string;
  bloco: string;
  apartamento: string;
  descricao: string;
  tipo: string;
  retirada: boolean;
  retirada_em: string | null;
  created_at: string;
}

// Gera lista de blocos (1-30)
const blocos = Array.from({ length: 30 }, (_, i) => String(i + 1));

// Gera lista de apartamentos
const apartamentos = [
  '01', '02', '03', '04',
  '101', '102', '103', '104',
  '201', '202', '203', '204',
  '301', '302', '303', '304',
];

export default function Encomendas() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();

  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todas' | 'pendentes' | 'retiradas'>('pendentes');

  const [formData, setFormData] = useState({
    bloco: '',
    apartamento: '',
    descricao: '',
    tipo: 'encomenda',
  });

  const fetchEncomendas = async () => {
    let query = supabase
      .from('encomendas')
      .select('*')
      .order('created_at', { ascending: false });

    // Se não é admin, filtra pelo apt do usuário
    if (!isAdmin && profile) {
      query = query.eq('bloco', profile.bloco).eq('apartamento', profile.apartamento);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar encomendas:', error);
    } else {
      setEncomendas((data as Encomenda[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEncomendas();
  }, [isAdmin, profile]);

  const filteredEncomendas = encomendas.filter((enc) => {
    const matchesSearch =
      enc.bloco.includes(searchTerm) ||
      enc.apartamento.includes(searchTerm) ||
      enc.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'todas' ||
      (filterStatus === 'pendentes' && !enc.retirada) ||
      (filterStatus === 'retiradas' && enc.retirada);

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('encomendas').insert({
        bloco: formData.bloco,
        apartamento: formData.apartamento,
        descricao: formData.descricao,
        tipo: formData.tipo,
        criado_por: profile?.id,
      });

      if (error) throw error;

      toast({ 
        title: 'Encomenda registrada!',
        description: `Notificação enviada para Bloco ${formData.bloco} - Apt ${formData.apartamento}`,
      });

      setIsDialogOpen(false);
      setFormData({ bloco: '', apartamento: '', descricao: '', tipo: 'encomenda' });
      fetchEncomendas();
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

  const handleMarcarRetirada = async (id: string) => {
    try {
      const { error } = await supabase
        .from('encomendas')
        .update({ retirada: true, retirada_em: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Encomenda marcada como retirada!' });
      fetchEncomendas();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
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
            <Package className="h-8 w-8 text-primary" />
            Encomendas
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Gerencie as encomendas na portaria' : 'Suas encomendas pendentes'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Nova Encomenda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Encomenda</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloco" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Bloco
                    </Label>
                    <Select
                      value={formData.bloco}
                      onValueChange={(value) => setFormData({ ...formData, bloco: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bloco" />
                      </SelectTrigger>
                      <SelectContent>
                        {blocos.map((bloco) => (
                          <SelectItem key={bloco} value={bloco}>
                            Bloco {bloco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartamento" className="flex items-center gap-2">
                      <Home className="h-4 w-4" /> Apartamento
                    </Label>
                    <Select
                      value={formData.apartamento}
                      onValueChange={(value) => setFormData({ ...formData, apartamento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Apt" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartamentos.map((apt) => (
                          <SelectItem key={apt} value={apt}>
                            {apt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="encomenda">Encomenda</SelectItem>
                      <SelectItem value="correspondencia">Correspondência</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Caixa grande dos Correios, Mercado Livre..."
                    rows={3}
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
                  <Button type="submit" disabled={isSubmitting || !formData.bloco || !formData.apartamento}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por bloco, apt ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendentes">Pendentes</SelectItem>
            <SelectItem value="retiradas">Retiradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Encomendas List */}
      {filteredEncomendas.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {filterStatus === 'pendentes'
                ? 'Nenhuma encomenda pendente'
                : 'Nenhuma encomenda encontrada'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEncomendas.map((encomenda) => (
            <Card
              key={encomenda.id}
              className={`shadow-sm hover:shadow-md transition-shadow ${
                encomenda.retirada ? 'opacity-70' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Bloco {encomenda.bloco} - Apt {encomenda.apartamento}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(encomenda.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Badge variant={encomenda.retirada ? 'secondary' : 'default'}>
                    {encomenda.retirada ? 'Retirada' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">{encomenda.tipo}</span>
                  <p className="text-foreground mt-1">{encomenda.descricao}</p>
                </div>

                {encomenda.retirada && encomenda.retirada_em && (
                  <p className="text-sm text-muted-foreground">
                    Retirada em:{' '}
                    {format(new Date(encomenda.retirada_em), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}

                {isAdmin && !encomenda.retirada && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleMarcarRetirada(encomenda.id)}
                  >
                    <Check className="h-4 w-4" />
                    Marcar como Retirada
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 2b09e21 (novos ajustes)
