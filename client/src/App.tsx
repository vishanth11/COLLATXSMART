import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceLayout from "./components/WorkspaceLayout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Apply from "./pages/Apply";
import ClfLab from "./pages/ClfLab";
import NotFound from "./pages/NotFound";
import { CustomerDashboard, CustomerDocuments, CustomerLoan, CustomerPayments, CustomerProfile } from "./pages/customer/CustomerPages";
import { AdminCollateral, AdminCustomers, AdminDashboard, AdminDocuments, AdminLoans, AdminPayments, AdminRequests } from "./pages/admin/AdminPages";
import { PreviewAdmin, PreviewCustomer } from "./pages/PreviewWorkspace";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/apply" component={Apply} />
    <Route path="/clf-lab" component={ClfLab} />
    <Route path="/admin"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminDashboard /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/requests"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminRequests /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/loans"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminLoans /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/customers"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminCustomers /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/payments"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminPayments /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/collateral"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminCollateral /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/admin/documents"><ProtectedRoute role="admin"><WorkspaceLayout role="admin"><AdminDocuments /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/customer"><ProtectedRoute role="user"><WorkspaceLayout role="user"><CustomerDashboard /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/customer/loan"><ProtectedRoute role="user"><WorkspaceLayout role="user"><CustomerLoan /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/customer/payments"><ProtectedRoute role="user"><WorkspaceLayout role="user"><CustomerPayments /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/customer/documents"><ProtectedRoute role="user"><WorkspaceLayout role="user"><CustomerDocuments /></WorkspaceLayout></ProtectedRoute></Route>
    <Route path="/customer/profile"><ProtectedRoute role="user"><WorkspaceLayout role="user"><CustomerProfile /></WorkspaceLayout></ProtectedRoute></Route>
    {import.meta.env.DEV && <>
      <Route path="/__preview/admin"><WorkspaceLayout role="admin" previewUser={{ name: "Preview Admin", email: "admin@example.com", role: "admin" }}><PreviewAdmin /></WorkspaceLayout></Route>
      <Route path="/__preview/customer"><WorkspaceLayout role="user" previewUser={{ name: "Preview Customer", email: "customer@example.com", role: "user" }}><PreviewCustomer /></WorkspaceLayout></Route>
    </>}
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><LanguageProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}
