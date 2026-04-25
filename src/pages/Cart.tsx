import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { products } from "@/data/products";

const Cart = () => {
  const [items, setItems] = useState([
    { product: products[0], qty: 1 },
    { product: products[2], qty: 2 },
  ]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  return (
    <Layout>
      <section className="container pt-32 pb-24">
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight mb-12">
          Your <span className="text-gradient">cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-5 rounded-2xl bg-gradient-card border border-border"
                >
                  <div className="h-24 w-24 rounded-xl bg-secondary/40 flex items-center justify-center flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </p>
                    <h3 className="font-display font-semibold text-lg leading-tight mt-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-border rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-display font-bold text-lg">
                        ${(product.price * qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center self-start"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 h-fit p-6 rounded-2xl bg-gradient-card border border-border">
              <h3 className="font-display font-bold text-xl mb-6">Order summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">${total.toLocaleString()}</span>
                </div>
              </div>
              <button className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all">
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Free shipping on orders over $200
              </p>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Cart;
