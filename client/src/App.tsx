import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import About from "@/pages/About";
import DonateBlood from "@/pages/DonateBlood";
import RequestBlood from "@/pages/RequestBlood";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/login";
import SignUpPage from "./pages/SignUp";
import Layout from "./components/layout";
import DonorView from "./components/DonorsView";
import RequestsView from "./components/RequestsView";
import DonorForm from "./components/DonorForm";
import HospitalsView from "./components/HospitalsView";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/donate" component={DonateBlood} />
      <Route path="/request" component={RequestBlood} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/admin"> <Layout> <> <Dashboard /> </> </Layout> </Route>
      <Route path="/admin/donors"> <Layout> <> <DonorView/> </> </Layout> </Route>
      <Route path="/admin/donors/add"> <Layout> <> <DonorForm/> </> </Layout> </Route>
      <Route path="/admin/hospitals"> <Layout> <> <HospitalsView/> </> </Layout> </Route>
      <Route path="/admin/requests"> <Layout> <> <RequestsView/> </> </Layout> </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
