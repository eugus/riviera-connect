import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sun, Loader2, Building2, Home } from 'lucide-react';
import { z } from 'zod';

// Validação - Senha de 6 dígitos numéricos
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().length(6, 'Senha deve ter 6 dígitos').regex(/^\d{6}$/, 'Senha deve conter apenas números'),
});

const signupSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  bloco: z.string().min(1, 'Selecione o bloco'),
  apartamento: z.string().min(1, 'Selecione o apartamento'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  password: z.string().length(6, 'Senha deve ter 6 dígitos').regex(/^\d{6}$/, 'Senha deve conter apenas números'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Gera lista de blocos (1-30)
const blocos = Array.from({ length: 30 }, (_, i) => String(i + 1));

// Gera lista de apartamentos (01-04 no térreo, 101-104, 201-204, 301-304)
const apartamentos = [
  '01', '02', '03', '04',
  '101', '102', '103', '104',
  '201', '202', '203', '204',
  '301', '302', '303', '304',
];

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    nome: '',
    bloco: '',
    apartamento: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redireciona se já está logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validData = loginSchema.parse(loginData);
      const { error } = await signIn(validData.email, validData.password);

      if (error) {
        let errorMessage = 'Erro ao entrar. Verifique suas credenciais.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.';
        }
        toast({
          variant: 'destructive',
          title: 'Erro no login',
          description: errorMessage,
        });
      } else {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Dados inválidos',
          description: error.errors[0].message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validData = signupSchema.parse(signupData);

      const { error } = await signUp(
        validData.email,
        validData.password,
        validData.nome,
        validData.bloco,
        validData.apartamento
      );

      if (error) {
        let errorMessage = 'Erro ao criar conta. Tente novamente.';

        if (error.message.includes('already registered')) {
          errorMessage = 'Este e-mail já está cadastrado.';
        }

        toast({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: errorMessage,
        });
        return;
      }

      toast({
        title: 'Conta criada!',
        description: 'Cadastro realizado com sucesso. Bem-vindo ao Riviera!',
      });

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Dados inválidos',
          description: error.errors[0].message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary mb-4 shadow-lg">
            <Sun className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Condomínio Riviera</h1>
          <p className="text-muted-foreground mt-2">Portal do Morador</p>
        </div>

        <Card className="shadow-xl border-2">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="text-base">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-base">Cadastrar</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-base">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-base">Senha (6 dígitos)</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      value={loginData.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setLoginData({ ...loginData, password: value });
                      }}
                      className="h-12 text-base text-center tracking-widest"
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome" className="text-base">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      placeholder="Seu nome"
                      value={signupData.nome}
                      onChange={(e) => setSignupData({ ...signupData, nome: e.target.value })}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-bloco" className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Bloco
                      </Label>
                      <Select
                        value={signupData.bloco}
                        onValueChange={(value) => setSignupData({ ...signupData, bloco: value })}
                      >
                        <SelectTrigger className="h-12 text-base">
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
                      <Label htmlFor="signup-apt" className="text-base flex items-center gap-2">
                        <Home className="h-4 w-4" /> Apartamento
                      </Label>
                      <Select
                        value={signupData.apartamento}
                        onValueChange={(value) => setSignupData({ ...signupData, apartamento: value })}
                      >
                        <SelectTrigger className="h-12 text-base">
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
                    <Label htmlFor="signup-email" className="text-base">E-mail (opcional)</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-base">Senha (6 dígitos numéricos)</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••"
                      value={signupData.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setSignupData({ ...signupData, password: value });
                      }}
                      className="h-12 text-base text-center tracking-widest"
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-base">Confirmar Senha</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setSignupData({ ...signupData, confirmPassword: value });
                      }}
                      className="h-12 text-base text-center tracking-widest"
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Portal exclusivo para moradores do Condomínio Riviera
        </p>
      </div>
    </div>
  );
}
