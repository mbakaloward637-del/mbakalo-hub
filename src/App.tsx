import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import News from "./pages/News";
import Funerals from "./pages/Funerals";
import Gossip from "./pages/Gossip";
import Events from "./pages/Events";
import Leaders from "./pages/Leaders";
import Youth from "./pages/Youth";
import Gallery from "./pages/Gallery";
import Fundraising from "./pages/Fundraising";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/funerals" element={<Funerals />} />
            <Route path="/gossip" element={<Gossip />} />
            <Route path="/events" element={<Events />} />
            <Route path="/leaders" element={<Leaders />} />
            <Route path="/youth" element={<Youth />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/fundraising" element={<Fundraising />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
