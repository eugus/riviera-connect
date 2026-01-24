import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aviso {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: 'normal' | 'importante' | 'urgente';
    created_at: string;
}

export default function AvisosDetalhes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [aviso, setAviso] = useState<Aviso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAviso = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('avisos')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                setAviso(data as Aviso);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAviso();
        }
    }, [id]);

    const getPriorityColor = (prioridade: string) => {
        switch (prioridade) {
            case 'urgente':
                return 'bg-destructive text-destructive-foreground';
            case 'importante':
                return 'bg-warning text-warning-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !aviso) {
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
                            {error || 'Aviso não encontrado'}
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
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-3xl">{aviso.titulo}</CardTitle>
                        <Badge className={getPriorityColor(aviso.prioridade)}>
                            {aviso.prioridade.toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Publicado em {format(new Date(aviso.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                            locale: ptBR,
                        })}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {aviso.descricao}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
