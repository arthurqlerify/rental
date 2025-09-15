import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LeasesPage from "./pages/LeasesPage";
import TurnoversPage from "./pages/TurnoversPage";
import InspectionsPage from "./pages/InspectionsPage";
import RenovationCasesPage from "./pages/RenovationCasesPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import ApartmentsPage from "./pages/ApartmentsPage";
import PropertiesPage from "./pages/PropertiesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />}>
            <Route index element={<Dashboard />} />
            <Route path="leases" element={<LeasesPage />} />
            <Route path="turnovers" element={<TurnoversPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="renovation-cases" element={<RenovationCasesPage />} />
            <Route path="work-orders" element={<WorkOrdersPage />} />
            <Route path="apartments" element={<ApartmentsPage />} />
            <Route path="properties" element={<PropertiesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
