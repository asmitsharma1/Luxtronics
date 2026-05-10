import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";

// Admin emails — set VITE_ADMIN_EMAILS=email1@x.com,email2@x.com in .env.local
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isLoaded, isSignedIn, user } = useAuth();

  if (!isLoaded) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <p className="text-muted-foreground">Checking permissions...</p>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/account/login" replace />;
  }

  const email = user?.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email);

  if (!isAdmin) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 text-center">
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
