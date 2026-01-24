import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
=======
>>>>>>> 2b09e21 (novos ajustes)
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Building2,
  Home,
  Phone,
  Mail,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';

interface PessoaAutorizada {
  id: string;
  bloco: string;
  apartamento: string;
  nome: string;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  parentesco: string | null;
  ativo: boolean;
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

export default function PessoasAutorizadas() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();

<<<<<<< HEAD
=======


>>>>>>> 2b09e21 (novos ajustes)
  const [pessoas, setPessoas] = useState<PessoaAutorizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<PessoaAutorizada | null>(null);
<<<<<<< HEAD
  const [filterBloco, setFilterBloco] = useState('');
  const [filterApt, setFilterApt] = useState('');
=======
  const [filterBloco, setFilterBloco] = useState('all');
  const [filterApt, setFilterApt] = useState('all');
>>>>>>> 2b09e21 (novos ajustes)

  const [formData, setFormData] = useState({
    bloco: '',
    apartamento: '',
    nome: '',
    documento: '',
    telefone: '',
    email: '',
    parentesco: '',
    ativo: true,
  });

  const fetchPessoas = async () => {
    let query = supabase
      .from('pessoas_autorizadas')
      .select('*')
      .order('bloco', { ascending: true })
      .order('apartamento', { ascending: true })
      .order('nome', { ascending: true });

    const { data, error } = await query;

    if (error) {
<<<<<<< HEAD
      console.error('Erro ao buscar pessoas autorizadas:', error);
=======
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
>>>>>>> 2b09e21 (novos ajustes)
    } else {
      setPessoas((data as PessoaAutorizada[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPessoas();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const filteredPessoas = pessoas.filter((pessoa) => {
    const matchesSearch =
      pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.documento?.includes(searchTerm) ||
      pessoa.telefone?.includes(searchTerm);

<<<<<<< HEAD
    const matchesBloco = !filterBloco || pessoa.bloco === filterBloco;
    const matchesApt = !filterApt || pessoa.apartamento === filterApt;
=======
    const matchesBloco = filterBloco === 'all' || !filterBloco || pessoa.bloco === filterBloco;
    const matchesApt = filterApt === 'all' || !filterApt || pessoa.apartamento === filterApt;
>>>>>>> 2b09e21 (novos ajustes)

    return matchesSearch && matchesBloco && matchesApt;
  });

  const resetForm = () => {
    setFormData({
      bloco: '',
      apartamento: '',
      nome: '',
      documento: '',
      telefone: '',
      email: '',
      parentesco: '',
      ativo: true,
    });
    setEditingPessoa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dados = {
        bloco: formData.bloco,
        apartamento: formData.apartamento,
        nome: formData.nome,
        documento: formData.documento || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        parentesco: formData.parentesco || null,
        ativo: formData.ativo,
        criado_por: profile?.id,
      };

      if (editingPessoa) {
        const { error } = await supabase
          .from('pessoas_autorizadas')
          .update(dados)
          .eq('id', editingPessoa.id);

        if (error) throw error;
        toast({ title: 'Pessoa atualizada com sucesso!' });
      } else {
        const { error } = await supabase.from('pessoas_autorizadas').insert(dados);

        if (error) throw error;
        toast({ title: 'Pessoa cadastrada com sucesso!' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPessoas();
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
    if (!confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    try {
      const { error } = await supabase.from('pessoas_autorizadas').delete().eq('id', id);

      if (error) throw error;
      toast({ title: 'Pessoa excluída com sucesso!' });
      fetchPessoas();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message,
      });
    }
  };

  const handleToggleAtivo = async (pessoa: PessoaAutorizada) => {
    try {
      const { error } = await supabase
        .from('pessoas_autorizadas')
        .update({ ativo: !pessoa.ativo })
        .eq('id', pessoa.id);

      if (error) throw error;
      toast({
        title: pessoa.ativo ? 'Pessoa desativada' : 'Pessoa ativada',
      });
      fetchPessoas();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const openEditDialog = (pessoa: PessoaAutorizada) => {
    setEditingPessoa(pessoa);
    setFormData({
      bloco: pessoa.bloco,
      apartamento: pessoa.apartamento,
      nome: pessoa.nome,
      documento: pessoa.documento || '',
      telefone: pessoa.telefone || '',
      email: pessoa.email || '',
      parentesco: pessoa.parentesco || '',
      ativo: pessoa.ativo,
    });
    setIsDialogOpen(true);
  };

<<<<<<< HEAD
=======
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }
    return numbers.slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

>>>>>>> 2b09e21 (novos ajustes)
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center">
          Apenas administradores podem gerenciar pessoas autorizadas.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

<<<<<<< HEAD
=======


>>>>>>> 2b09e21 (novos ajustes)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Pessoas Autorizadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie pessoas liberadas para cada apartamento
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Pessoa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPessoa ? 'Editar Pessoa' : 'Cadastrar Pessoa Autorizada'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloco" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Bloco *
                  </Label>
                  <Select
<<<<<<< HEAD
                    value={formData.bloco}
=======
                    value={formData.bloco ?? undefined}
>>>>>>> 2b09e21 (novos ajustes)
                    onValueChange={(value) => setFormData({ ...formData, bloco: value })}
                    required
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
                    <Home className="h-4 w-4" /> Apartamento *
                  </Label>
                  <Select
                    value={formData.apartamento}
                    onValueChange={(value) => setFormData({ ...formData, apartamento: value })}
                    required
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
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Nome Completo *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da pessoa autorizada"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
<<<<<<< HEAD
                  <Label htmlFor="documento">Documento (RG/CPF)</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="000.000.000-00"
=======
                  <Label htmlFor="documento">Documento (CPF)</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
>>>>>>> 2b09e21 (novos ajustes)
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> E-mail (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentesco">Parentesco/Relação</Label>
                <Input
                  id="parentesco"
                  value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  placeholder="Ex: Mãe, Filho, Empregada, etc."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <Label htmlFor="ativo" className="text-base">Pessoa Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Pessoas inativas não terão acesso liberado
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.bloco || !formData.apartamento || !formData.nome}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingPessoa ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterBloco} onValueChange={setFilterBloco}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Bloco" />
          </SelectTrigger>
          <SelectContent>
<<<<<<< HEAD
            <SelectItem value="">Todos os Blocos</SelectItem>
=======
            <SelectItem value="all">Todos os Blocos</SelectItem>
>>>>>>> 2b09e21 (novos ajustes)
            {blocos.map((bloco) => (
              <SelectItem key={bloco} value={bloco}>
                Bloco {bloco}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterApt} onValueChange={setFilterApt}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Apt" />
          </SelectTrigger>
          <SelectContent>
<<<<<<< HEAD
            <SelectItem value="">Todos os Apts</SelectItem>
=======
            <SelectItem value="all">Todos os Apts</SelectItem>
>>>>>>> 2b09e21 (novos ajustes)
            {apartamentos.map((apt) => (
              <SelectItem key={apt} value={apt}>
                {apt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {filteredPessoas.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhuma pessoa autorizada cadastrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPessoas.map((pessoa) => (
            <Card
              key={pessoa.id}
<<<<<<< HEAD
              className={`shadow-sm hover:shadow-md transition-shadow ${
                !pessoa.ativo ? 'opacity-60' : ''
              }`}
=======
              className={`shadow-sm hover:shadow-md transition-shadow ${!pessoa.ativo ? 'opacity-60' : ''
                }`}
>>>>>>> 2b09e21 (novos ajustes)
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
<<<<<<< HEAD
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      pessoa.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
=======
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${pessoa.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
>>>>>>> 2b09e21 (novos ajustes)
                      {pessoa.ativo ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pessoa.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Bloco {pessoa.bloco} - Apt {pessoa.apartamento}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(pessoa)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(pessoa.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {pessoa.parentesco && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Relação:</span> {pessoa.parentesco}
                  </p>
                )}
                {pessoa.documento && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Documento:</span> {pessoa.documento}
                  </p>
                )}
                {pessoa.telefone && (
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" /> {pessoa.telefone}
                  </p>
                )}
                {pessoa.email && (
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" /> {pessoa.email}
                  </p>
                )}

                <div className="pt-2">
                  <Badge variant={pessoa.ativo ? 'default' : 'secondary'}>
                    {pessoa.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleToggleAtivo(pessoa)}
                >
                  {pessoa.ativo ? 'Desativar' : 'Ativar'} Acesso
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
