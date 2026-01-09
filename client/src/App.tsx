import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import About from "@/pages/About";
import DonateBlood from "@/pages/DonateBlood";
import RequestBlood from "@/pages/RequestBlood";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/login";
import SignUpPage from "./pages/SignUp";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { DonorsView } from "@/components/donors";
import { HospitalsView } from "@/components/hospitals";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalRequestForm from "./pages/HospitalRequestForm";
import HospitalForgotPassword from "./pages/HospitalForgotPassword";
import HospitalResetPassword from "./pages/HospitalResetPassword";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/donate" component={DonateBlood} />
      <Route path="/request" component={RequestBlood} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/admin">
        {" "}
        <Layout>
          {" "}
          <ProtectedRoute>
            {" "}
            <Dashboard />{" "}
          </ProtectedRoute>{" "}
        </Layout>{" "}
      </Route>
      <Route path="/admin/donors">
        {" "}
        <Layout>
          {" "}
          <ProtectedRoute>
            {" "}
            <DonorsView />{" "}
          </ProtectedRoute>{" "}
        </Layout>{" "}
      </Route>
      <Route path="/admin/hospitals">
        {" "}
        <Layout>
          {" "}
          <ProtectedRoute>
            {" "}
            <HospitalsView />{" "}
          </ProtectedRoute>{" "}
        </Layout>{" "}
      </Route>
      <Route path="/hospital" component={HospitalLogin} />
      <Route
        path="/hospital/forgot-password"
        component={HospitalForgotPassword}
      />
      <Route
        path="/hospital/reset-password"
        component={HospitalResetPassword}
      />
      <Route path="/hospital/dashboard" component={HospitalDashboard} />
      <Route path="/hospital/request" component={HospitalRequestForm} />
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
