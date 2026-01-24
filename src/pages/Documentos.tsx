import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  Search,
  FolderOpen,
  File,
  FileSpreadsheet,
  ScrollText,
} from 'lucide-react';

interface Documento {
  id: string;
  titulo: string;
  categoria: 'regimento' | 'atas' | 'prestacao_contas' | 'outros';
  arquivo_url: string;
  created_at: string;
  autor_id: string;
}

const categorias = {
  regimento: { label: 'Regimento Interno', icon: ScrollText },
  atas: { label: 'Atas de Reunião', icon: FileText },
  prestacao_contas: { label: 'Prestação de Contas', icon: FileSpreadsheet },
  outros: { label: 'Outros', icon: File },
};

export default function Documentos() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'outros' as Documento['categoria'],
  });

  const fetchDocumentos = async () => {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos:', error);
    } else {
      setDocumentos((data as Documento[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const filteredDocumentos = documentos.filter((doc) =>
    doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedDocumentos = Object.entries(categorias).reduce(
    (acc, [key]) => {
      acc[key as Documento['categoria']] = filteredDocumentos.filter(
        (doc) => doc.categoria === key
      );
      return acc;
    },
    {} as Record<Documento['categoria'], Documento[]>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Selecione um arquivo',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${formData.categoria}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase.from('documentos').insert({
        titulo: formData.titulo,
        categoria: formData.categoria,
        arquivo_url: urlData.publicUrl,
        autor_id: profile?.id,
      });

      if (dbError) throw dbError;

      toast({ title: 'Documento enviado com sucesso!' });
      setIsDialogOpen(false);
      setFormData({ titulo: '', categoria: 'outros' });
      setSelectedFile(null);
      fetchDocumentos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar documento',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doc: Documento) => {
    toast({
      title: 'Excluir documento?',
      description: 'Essa ação não poderá ser desfeita.',
      variant: 'destructive',
      action: (
        <button
          className="inline-flex h-8 items-center justify-center rounded-md border border-white/20 px-3 text-sm font-medium"
          onClick={async () => {
            try {
              const { error: dbError } = await supabase
                .from('documentos')
                .delete()
                .eq('id', doc.id);

              if (dbError) throw dbError;

              toast({ title: 'Documento excluído com sucesso!' });
              fetchDocumentos();
            } catch (error: any) {
              toast({
                variant: 'destructive',
                title: 'Erro ao excluir documento',
                description: error.message,
              });
            }
          }}
        >
          Confirmar
        </button>
      ),
    });
  };


  const DocumentCard = ({ doc }: { doc: Documento }) => {
    const catConfig = categorias[doc.categoria];
    const Icon = catConfig.icon;

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{doc.titulo}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(doc.arquivo_url, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
            <FileText className="h-8 w-8 text-primary" />
            Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Acesse os documentos oficiais do condomínio
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-5 w-5" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Documento</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Ata da Assembleia de Janeiro 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: Documento['categoria']) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categorias).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arquivo">Arquivo</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, TXT
                  </p>
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
                    Enviar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos ({filteredDocumentos.length})</TabsTrigger>
          {Object.entries(categorias).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              {config.label} ({groupedDocumentos[key as Documento['categoria']].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredDocumentos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchTerm
                    ? 'Nenhum documento encontrado'
                    : 'Nenhum documento cadastrado'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocumentos.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </TabsContent>

        {Object.entries(categorias).map(([key, config]) => (
          <TabsContent key={key} value={key} className="mt-4">
            {groupedDocumentos[key as Documento['categoria']].length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Nenhum documento nesta categoria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedDocumentos[key as Documento['categoria']].map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
