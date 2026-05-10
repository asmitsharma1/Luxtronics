import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import Layout from "@/components/Layout";

// Admin emails — add your admin email(s) here or use an env var
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isLoaded, isSignedIn, user } = useUser();

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

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
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
