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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Upload,
    FileText,
    Calendar,
    Download,
    X,
} from 'lucide-react';

interface Regra {
    id: string;
    titulo: string;
    conteudo: string;
    tipo: 'texto' | 'arquivo';
    arquivo_url: string | null;
    categoria: string | null;
    ordem: number;
    created_at: string;
    autor_id: string;
}

export default function Rules() {
    const { isAdmin, profile } = useAuth();
    const { toast } = useToast();

    const [regras, setRegras] = useState<Regra[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingRegra, setEditingRegra] = useState<Regra | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'texto' | 'arquivo'>('texto');

    const [formData, setFormData] = useState({
        titulo: '',
        conteudo: '',
        categoria: '',
    });

    const fetchRegras = async () => {
        const { data, error } = await supabase
            .from('regras')
            .select('*')
            .order('ordem', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar regras:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao buscar regras',
            });
        } else {
            setRegras((data as Regra[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRegras();
    }, []);

    const filteredRegras = regras.filter((regra) =>
        regra.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regra.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    variant: 'destructive',
                    title: 'Arquivo muito grande',
                    description: 'O arquivo não pode exceder 10MB',
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const uploadFile = async (file: File): Promise<string> => {
        const fileName = `regras/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('documentos')
            .upload(fileName, file);

        if (error) {
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from('documentos')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.titulo.trim()) {
            toast({
                variant: 'destructive',
                title: 'Título é obrigatório',
            });
            return;
        }

        if (activeTab === 'texto' && !formData.conteudo.trim()) {
            toast({
                variant: 'destructive',
                title: 'Conteúdo é obrigatório',
            });
            return;
        }

        if (activeTab === 'arquivo' && !selectedFile && !editingRegra) {
            toast({
                variant: 'destructive',
                title: 'Selecione um arquivo',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let arquivo_url = editingRegra?.arquivo_url || null;

            if (activeTab === 'arquivo' && selectedFile) {
                arquivo_url = await uploadFile(selectedFile);
            }

            const dados = {
                titulo: formData.titulo,
                conteudo: activeTab === 'texto' ? formData.conteudo : '',
                descricao: activeTab === 'texto' ? formData.conteudo : formData.titulo,
                tipo: activeTab,
                arquivo_url,
                categoria: formData.categoria || 'geral',
            };

            if (editingRegra) {
                const { error } = await supabase
                    .from('regras')
                    .update(dados)
                    .eq('id', editingRegra.id);

                if (error) throw error;

                toast({
                    title: 'Regra atualizada',
                    description: 'A regra foi atualizada com sucesso',
                });
            } else {
                const { error } = await supabase
                    .from('regras')
                    .insert([dados]);

                if (error) throw error;

                toast({
                    title: 'Regra criada',
                    description: 'A regra foi adicionada com sucesso',
                });
            }

            setIsDialogOpen(false);
            setEditingRegra(null);
            setFormData({ titulo: '', conteudo: '', categoria: '' });
            setSelectedFile(null);
            setActiveTab('texto');
            fetchRegras();
        } catch (error) {
            console.error('Erro ao salvar regra:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar a regra',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (regra: Regra) => {
        setEditingRegra(regra);
        setFormData({
            titulo: regra.titulo,
            conteudo: regra.conteudo,
            categoria: regra.categoria || '',
        });
        setActiveTab(regra.tipo);
        setIsDialogOpen(true);
    };

    const handleDelete = async (reg: Regra) => {

        toast({
            title: 'Deletando regra?',
            description: 'Esta ação não pode ser desfeita',
            variant: 'destructive',
            action: (
                <button
                    className="inline-flex h-8 items-center justify-center rounded-md border border-white/20 px-3 text-sm font-medium"
                    onClick={async () => {
                        try {
                            const { error: dbError } = await supabase
                                .from('regras')
                                .delete()
                                .eq('id', reg.id);

                            if (dbError) throw dbError;

                            toast({ title: 'Regra excluída com sucesso!' });
                            fetchRegras();
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

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingRegra(null);
        setFormData({ titulo: '', conteudo: '', categoria: '' });
        setSelectedFile(null);
        setActiveTab('texto');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Regras do Condomínio</h1>
                        <p className="text-muted-foreground">
                            {filteredRegras.length} {filteredRegras.length === 1 ? 'regra' : 'regras'}
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Regra
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingRegra ? 'Editar Regra' : 'Adicionar Nova Regra'}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Título */}
                                <div className="space-y-2">
                                    <Label htmlFor="titulo">Título *</Label>
                                    <Input
                                        id="titulo"
                                        placeholder="Ex: Horário de Silêncio"
                                        value={formData.titulo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, titulo: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Categoria */}
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoria (opcional)</Label>
                                    <Input
                                        id="categoria"
                                        placeholder="Ex: Ruído, Limpeza, etc"
                                        value={formData.categoria}
                                        onChange={(e) =>
                                            setFormData({ ...formData, categoria: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Tabs para Tipo */}
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'texto' | 'arquivo')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="texto">Texto</TabsTrigger>
                                        <TabsTrigger value="arquivo">Arquivo</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="texto" className="space-y-2">
                                        <Label htmlFor="conteudo">Conteúdo da Regra *</Label>
                                        <Textarea
                                            id="conteudo"
                                            placeholder="Digite o conteúdo da regra..."
                                            value={formData.conteudo}
                                            onChange={(e) =>
                                                setFormData({ ...formData, conteudo: e.target.value })
                                            }
                                            disabled={isSubmitting}
                                            rows={6}
                                        />
                                    </TabsContent>

                                    <TabsContent value="arquivo" className="space-y-4">
                                        <div className="flex flex-col gap-4">
                                            <Label htmlFor="file">Selecione o Arquivo (PDF, DOC, etc) *</Label>
                                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                                                <div className="text-center">
                                                    {selectedFile ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <FileText className="h-8 w-8 text-primary" />
                                                            <p className="font-medium text-foreground">{selectedFile.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="mt-2"
                                                                onClick={() => setSelectedFile(null)}
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                Remover
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-sm font-medium text-foreground">
                                                                Clique ou arraste para selecionar
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Máximo 10MB
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="file"
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <Label htmlFor="file" className="cursor-pointer">
                                                <div className="w-full rounded-lg border border-border p-2 text-center text-sm text-muted-foreground hover:bg-secondary cursor-pointer">
                                                    Selecionar arquivo
                                                </div>
                                            </Label>
                                            {selectedFile && (
                                                <p className="text-sm text-muted-foreground">
                                                    Se deixar vazio ao editar, mantém o arquivo anterior
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseDialog}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {editingRegra ? 'Atualizar' : 'Adicionar'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar regras por título ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Regras List */}
            <div className="space-y-4">
                {filteredRegras.length === 0 ? (
                    <Card className="border-border bg-card/50">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-center">
                                {searchTerm
                                    ? 'Nenhuma regra encontrada com esses critérios'
                                    : 'Nenhuma regra adicionada ainda'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRegras.map((regra) => (
                        <Card key={regra.id} className="border-border hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <CardTitle className="text-xl text-foreground">
                                            {regra.titulo}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                {regra.tipo === 'texto' ? 'Texto' : 'Arquivo'}
                                            </span>
                                            {regra.categoria && (
                                                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                                    {regra.categoria}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(regra.created_at), "dd 'de' MMMM 'de' yyyy", {
                                                    locale: ptBR,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(regra)}
                                                className="text-primary hover:bg-primary/10"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(regra)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {regra.tipo === 'texto' ? (
                                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                        {regra.conteudo}
                                    </p>
                                ) : (
                                    <a
                                        href={regra.arquivo_url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        Baixar Documento
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
