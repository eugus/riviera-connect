import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Avisos from "./pages/Avisos";
import AvisosDetalhes from "./pages/AvisosDetalhes";
import Noticias from "./pages/Noticias";
import NoticiasDetalhes from "./pages/NoticiasDetalhes";
import Eventos from "./pages/Eventos";
import EventosDetalhes from "./pages/EventosDetalhes";
import Documentos from "./pages/Documentos";
import Perfil from "./pages/Perfil";
import Rules from "./pages/Rules";
import Encomendas from "./pages/Encomendas";
import PessoasAutorizadas from "./pages/PessoasAutorizadas";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/avisos" element={<Avisos />} />
              <Route path="/avisos/:id" element={<AvisosDetalhes />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/noticias/:id" element={<NoticiasDetalhes />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/eventos/:id" element={<EventosDetalhes />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/regras" element={<Rules />} />
              <Route path="/encomendas" element={<Encomendas />} />
              <Route path="/pessoas-autorizadas" element={<PessoasAutorizadas />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
