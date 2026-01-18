-- Tabela de regras do condomínio
CREATE TABLE public.regras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'arquivo')),
  arquivo_url TEXT,
  categoria TEXT,
  ordem INTEGER DEFAULT 0,
  autor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regras ENABLE ROW LEVEL SECURITY;

-- Políticas para regras
CREATE POLICY "Todos podem ver regras"
  ON public.regras FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem criar regras"
  ON public.regras FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins podem atualizar regras"
  ON public.regras FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins podem deletar regras"
  ON public.regras FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_regras_updated_at
BEFORE UPDATE ON public.regras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
