import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { DesignSystemLayout } from "./components/design-system-layout";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "sonner";
import Properties from "./pages/properties";
import PropertyDetail from "./pages/property-details"
import Tenants from "./pages/tenants";
import TenantDetail from "./pages/tenant-detail";

function App() {
  return (
    <div className="App overflow-x-hidden">
      <Toaster richColors position="top-right" />

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public: redirect root to /auth */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />

            {/* Protected: requires auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DesignSystemLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/tenants" element={<Tenants/>} />
                <Route path = "/tenants/:id" element={<TenantDetail/>}/>
                <Route path="/payments" element={<div>Payments</div>} />
                <Route path="/reports" element={<div>Reports</div>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
