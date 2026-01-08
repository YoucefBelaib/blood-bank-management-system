import { Switch, Route } from "wouter";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import DonateBlood from "@/pages/DonateBlood";
import RequestBlood from "@/pages/RequestBlood";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/SignUp";
import HospitalLogin from "@/pages/HospitalLogin";
import HospitalDashboard from "@/pages/HospitalDashboard";
import HospitalRequestForm from "@/pages/HospitalRequestForm";
import NotFound from "@/pages/not-found";

// Components
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute.tsx";
import { DonorsView } from "@/components/donors";
import { HospitalsView } from "@/components/hospitals";

export function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/donate" component={DonateBlood} />
      <Route path="/request" component={RequestBlood} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />

      {/* Admin routes */}
      <Route path="/admin">
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/admin/donors">
        <Layout>
          <ProtectedRoute>
            <DonorsView />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/admin/hospitals">
        <Layout>
          <ProtectedRoute>
            <HospitalsView />
          </ProtectedRoute>
        </Layout>
      </Route>

      {/* Hospital routes */}
      <Route path="/hospital" component={HospitalLogin} />
      <Route path="/hospital/dashboard" component={HospitalDashboard} />
      <Route path="/hospital/request" component={HospitalRequestForm} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
