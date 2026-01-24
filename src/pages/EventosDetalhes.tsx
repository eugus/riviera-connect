import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Evento {
    id: string;
    titulo: string;
    descricao: string;
    data_evento: string;
    local: string;
    created_at: string;
}

export default function EventosDetalhes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('eventos')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                setEvento(data as Evento);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvento();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !evento) {
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
                            {error || 'Evento não encontrado'}
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
                    <CardTitle className="text-3xl">{evento.titulo}</CardTitle>
                    <div className="flex flex-col gap-2 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <span>
                                {format(new Date(evento.data_evento), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                    locale: ptBR,
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-5 w-5" />
                            <span>{evento.local}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Publicado em {format(new Date(evento.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {evento.descricao}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
