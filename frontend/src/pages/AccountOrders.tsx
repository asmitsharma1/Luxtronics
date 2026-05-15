import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchCustomerOrders, type WooCommerceOrder } from "@/services/store-api";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

const statusConfig = {
  'pending': { label: 'Pending Payment', icon: Clock, color: 'text-yellow-500' },
  'processing': { label: 'Processing', icon: Package, color: 'text-blue-500' },
  'on-hold': { label: 'On Hold', icon: Clock, color: 'text-orange-500' },
  'completed': { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  'cancelled': { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
  'refunded': { label: 'Refunded', icon: XCircle, color: 'text-red-500' },
  'failed': { label: 'Failed', icon: XCircle, color: 'text-red-500' },
  'shipped': { label: 'Shipped', icon: Truck, color: 'text-blue-500' },
};

const AccountOrders = () => {
  const { isLoaded, isSignedIn, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<WooCommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customerOrders = await fetchCustomerOrders(user.email);
        setOrders(customerOrders);
        setError(null);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      loadOrders();
    }
  }, [isSignedIn, user]);

  if (!isLoaded || loading) {
    return (
      <Layout>
        <section className="container pt-32 pb-24">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <section className="container pt-32 pb-24 max-w-xl">
          <h1 className="font-display font-bold text-4xl tracking-tight">Please sign in</h1>
          <p className="mt-3 text-muted-foreground">Sign in to view your orders.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              to="/account/login"
              className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Sign in
            </Link>
            <Link
              to="/account/register"
              className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40"
            >
              Create account
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">My account</p>
            <h1 className="font-display font-bold text-5xl tracking-tight">
              Order <span className="text-gradient">history</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Link to="/account" className="text-sm text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="container pb-24">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-gradient-card p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No orders yet.</p>
            <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Link
              to="/shop"
              className="inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-border bg-gradient-card p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-semibold text-lg">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {formatDate(order.date_created)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-xl text-gradient">
                        {formatPrice(parseFloat(order.total))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.line_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.image?.src && (
                          <div className="h-16 w-16 rounded-lg bg-secondary/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={item.image.src}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-medium text-sm">
                          {formatPrice(parseFloat(item.total))}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Shipping Address</p>
                      <p className="font-medium">
                        {order.shipping.first_name} {order.shipping.last_name}
                      </p>
                      <p className="text-muted-foreground">
                        {order.shipping.address_1}
                      </p>
                      <p className="text-muted-foreground">
                        {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                      </p>
                      <p className="text-muted-foreground">{order.shipping.country}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-medium">{order.payment_method_title}</p>
                      <p className="text-muted-foreground mt-3">Order Key</p>
                      <p className="text-xs font-mono text-muted-foreground">{order.order_key}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(parseFloat(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(parseFloat(order.shipping_total))}</span>
                    </div>
                    {parseFloat(order.total_tax) > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(parseFloat(order.total_tax))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-gradient">{formatPrice(parseFloat(order.total))}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default AccountOrders;
