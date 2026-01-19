-- Adicionar campos que faltam na tabela regras
ALTER TABLE public.regras ADD COLUMN IF NOT EXISTS conteudo TEXT;
ALTER TABLE public.regras ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'texto';
ALTER TABLE public.regras ADD COLUMN IF NOT EXISTS arquivo_url TEXT;

-- Copiar dados de descricao para conteudo se existir
UPDATE public.regras SET conteudo = descricao WHERE conteudo IS NULL;