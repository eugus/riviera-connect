import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Noticia {
    id: string;
    titulo: string;
    conteudo: string;
    imagem_url: string | null;
    created_at: string;
}

export default function NoticiasDetalhes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [noticia, setNoticia] = useState<Noticia | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageExpanded, setImageExpanded] = useState(false);

    useEffect(() => {
        const fetchNoticia = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('noticias')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                setNoticia(data as Noticia);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNoticia();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !noticia) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-center">
                            {error || 'Notícia não encontrada'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{noticia.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Publicado em {format(new Date(noticia.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                            locale: ptBR,
                        })}
                    </p>
                </CardHeader>
                {noticia.imagem_url && (
                    <div
                        className="w-full h-54 bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onDoubleClick={() => setImageExpanded(true)}
                    >
                        <img
                            src={noticia.imagem_url}
                            alt={noticia.titulo}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {noticia.conteudo}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Imagem Expandida */}
            {imageExpanded && noticia.imagem_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setImageExpanded(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={() => setImageExpanded(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <img
                            src={noticia.imagem_url}
                            alt={noticia.titulo}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
