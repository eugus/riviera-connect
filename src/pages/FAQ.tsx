import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

const categorias = [
  { value: 'geral', label: 'Geral' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'areas_comuns', label: 'Áreas Comuns' },
  { value: 'regras', label: 'Regras' },
  { value: 'seguranca', label: 'Segurança' },
];

const FAQ: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    pergunta: '',
    resposta: '',
    categoria: 'geral',
  });
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('categoria')
        .order('ordem');

      if (error) throw error;
      return data as FAQ[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('faq').insert({
        pergunta: data.pergunta,
        resposta: data.resposta,
        categoria: data.categoria,
        autor_id: profile?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({ title: 'Dúvida adicionada com sucesso!' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Erro ao adicionar dúvida', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('faq')
        .update({
          pergunta: data.pergunta,
          resposta: data.resposta,
          categoria: data.categoria,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({ title: 'Dúvida atualizada com sucesso!' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar dúvida', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faq').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast({ title: 'Dúvida removida com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover dúvida', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ pergunta: '', resposta: '', categoria: 'geral' });
    setEditingFaq(null);
    setDialogOpen(false);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      pergunta: faq.pergunta,
      resposta: faq.resposta,
      categoria: faq.categoria,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pergunta.trim() || !formData.resposta.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const faqsFiltradas = faqs?.filter(
    (faq) => filtroCategoria === 'todas' || faq.categoria === filtroCategoria
  );

  const faqsPorCategoria = faqsFiltradas?.reduce((acc, faq) => {
    if (!acc[faq.categoria]) {
      acc[faq.categoria] = [];
    }
    acc[faq.categoria].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const getCategoriaLabel = (value: string) => {
    return categorias.find((c) => c.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Dúvidas Frequentes
          </h1>
          <p className="text-muted-foreground">
            Encontre respostas para as perguntas mais comuns
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Dúvida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingFaq ? 'Editar Dúvida' : 'Nova Dúvida'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pergunta">Pergunta</Label>
                  <Input
                    id="pergunta"
                    value={formData.pergunta}
                    onChange={(e) =>
                      setFormData({ ...formData, pergunta: e.target.value })
                    }
                    placeholder="Digite a pergunta..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resposta">Resposta</Label>
                  <Textarea
                    id="resposta"
                    value={formData.resposta}
                    onChange={(e) =>
                      setFormData({ ...formData, resposta: e.target.value })
                    }
                    placeholder="Digite a resposta..."
                    rows={5}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingFaq ? 'Salvar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtro por categoria */}
      <div className="flex items-center gap-2">
        <Label>Filtrar por:</Label>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de FAQs */}
      {!faqsFiltradas?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {filtroCategoria === 'todas'
                ? 'Nenhuma dúvida frequente cadastrada ainda.'
                : 'Nenhuma dúvida nesta categoria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(faqsPorCategoria || {}).map(([categoria, items]) => (
            <Card key={categoria}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {getCategoriaLabel(categoria)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {items.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="flex-1 pr-4">{faq.pergunta}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {faq.resposta}
                          </p>
                          {isAdmin && (
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(faq)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(faq.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQ;
