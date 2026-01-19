-- Tabela de encomendas/notificações de portaria
CREATE TABLE public.encomendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bloco TEXT NOT NULL,
  apartamento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'encomenda',
  retirada BOOLEAN NOT NULL DEFAULT false,
  retirada_em TIMESTAMP WITH TIME ZONE,
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pessoas autorizadas por apartamento
CREATE TABLE public.pessoas_autorizadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bloco TEXT NOT NULL,
  apartamento TEXT NOT NULL,
  nome TEXT NOT NULL,
  documento TEXT,
  telefone TEXT,
  email TEXT,
  parentesco TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de regras do condomínio
CREATE TABLE public.regras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  autor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bucket para imagens de notícias
INSERT INTO storage.buckets (id, name, public) VALUES ('noticias', 'noticias', true);

-- RLS para encomendas
ALTER TABLE public.encomendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem criar encomendas"
  ON public.encomendas FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins podem ver todas encomendas"
  ON public.encomendas FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Moradores podem ver encomendas do seu apt"
  ON public.encomendas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND bloco = encomendas.bloco 
      AND apartamento = encomendas.apartamento
    )
  );

CREATE POLICY "Admins podem atualizar encomendas"
  ON public.encomendas FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins podem deletar encomendas"
  ON public.encomendas FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS para pessoas autorizadas
ALTER TABLE public.pessoas_autorizadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar pessoas autorizadas"
  ON public.pessoas_autorizadas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Moradores podem ver pessoas do seu apt"
  ON public.pessoas_autorizadas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND bloco = pessoas_autorizadas.bloco 
      AND apartamento = pessoas_autorizadas.apartamento
    )
  );

-- RLS para regras
ALTER TABLE public.regras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver regras ativas"
  ON public.regras FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins podem gerenciar regras"
  ON public.regras FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para storage de noticias
CREATE POLICY "Imagens de notícias são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'noticias');

CREATE POLICY "Admins podem fazer upload de imagens"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'noticias' AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins podem deletar imagens"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'noticias' AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Triggers para updated_at
CREATE TRIGGER update_pessoas_autorizadas_updated_at
  BEFORE UPDATE ON public.pessoas_autorizadas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regras_updated_at
  BEFORE UPDATE ON public.regras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();