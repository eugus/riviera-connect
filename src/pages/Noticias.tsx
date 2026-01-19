import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Newspaper, Plus, Pencil, Trash2, Loader2, Search, Calendar } from 'lucide-react';

interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  imagem_url: string | null;
  created_at: string;
  autor_id: string;
}

export default function Noticias() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [expandedNoticia, setExpandedNoticia] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchNoticias = async () => {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notícias:', error);
    } else {
      setNoticias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const filteredNoticias = noticias.filter(
    (noticia) =>
      noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Imagem muito grande',
          description: 'A imagem não pode exceder 5MB',
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('noticias')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('noticias')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imagem_url = editingNoticia?.imagem_url || null;

      if (selectedImage) {
        imagem_url = await uploadImage(selectedImage);
      }

      if (editingNoticia) {
        const { error } = await supabase
          .from('noticias')
          .update({
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            imagem_url,
          })
          .eq('id', editingNoticia.id);

        if (error) throw error;
        toast({ title: 'Notícia atualizada com sucesso!' });
      } else {
        const { error } = await supabase.from('noticias').insert({
          titulo: formData.titulo,
          conteudo: formData.conteudo,
          imagem_url,
          autor_id: profile?.id,
        });

        if (error) throw error;
        toast({ title: 'Notícia publicada com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingNoticia(null);
      setFormData({ titulo: '', conteudo: '' });
      setSelectedImage(null);
      setImagePreview(null);
      fetchNoticias();
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
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;

    const { error } = await supabase.from('noticias').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir notícia',
        description: error.message,
      });
    } else {
      toast({ title: 'Notícia excluída com sucesso!' });
      fetchNoticias();
    }
  };

  const openEditDialog = (noticia: Noticia) => {
    setEditingNoticia(noticia);
    setFormData({
      titulo: noticia.titulo,
      conteudo: noticia.conteudo,
    });
    setImagePreview(noticia.imagem_url);
    setSelectedImage(null);
    setIsDialogOpen(true);
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
            <Newspaper className="h-8 w-8 text-primary" />
            Notícias do Condomínio
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as novidades da nossa comunidade
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingNoticia(null);
                  setFormData({ titulo: '', conteudo: '' });
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <Plus className="h-5 w-5" />
                Nova Notícia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNoticia ? 'Editar Notícia' : 'Nova Notícia'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Título da notícia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem (opcional)</Label>
                  <div className="space-y-3">
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Máximo 5MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    placeholder="Escreva o conteúdo da notícia..."
                    rows={8}
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
                    {editingNoticia ? 'Salvar' : 'Publicar'}
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
          placeholder="Buscar notícias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Noticias List */}
      {filteredNoticias.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {searchTerm
                ? 'Nenhuma notícia encontrada'
                : 'Nenhuma notícia publicada ainda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNoticias.map((noticia) => (
            <Card
              key={noticia.id}
              className="shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {noticia.imagem_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={noticia.imagem_url}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{noticia.titulo}</CardTitle>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(noticia)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(noticia.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(noticia.created_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <p
                  className={`text-foreground whitespace-pre-wrap ${
                    expandedNoticia === noticia.id ? '' : 'line-clamp-4'
                  }`}
                >
                  {noticia.conteudo}
                </p>
                {noticia.conteudo.length > 200 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() =>
                      setExpandedNoticia(expandedNoticia === noticia.id ? null : noticia.id)
                    }
                  >
                    {expandedNoticia === noticia.id ? 'Ver menos' : 'Ler mais'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
