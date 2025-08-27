
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CDNExample from "./pages/CDNExample";
import VoiceAgent from "./pages/VoiceAgent";
import Demo from "./pages/Demo";
import { Agent } from "./pages/Agent";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import SaaS from "./pages/SaaS";
import GoogleCallback from "./pages/GoogleCallback";
import IntegrationSuccess from "./pages/IntegrationSuccess";
import IntegrationFailure from "./pages/IntegrationFailure";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cdn-example" element={<CDNExample />} />
            <Route path="/voice-agent" element={<VoiceAgent />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/saas" element={<SaaS />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/integrations/success" element={<IntegrationSuccess />} />
            <Route path="/integrations/failure" element={<IntegrationFailure />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
