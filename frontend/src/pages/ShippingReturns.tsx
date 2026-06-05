import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Truck, RotateCcw, ShieldCheck, Clock, Package, Phone } from "lucide-react";

const ShippingReturns = () => {
  return (
    <Layout>
      <SEO
        title="Shipping & Returns Policy | Luxtronics"
        description="Learn about Luxtronics shipping options, return eligibility, support process, and product coverage information."
        keywords="luxtronics shipping policy, return policy, product coverage, support policy"
        url="/shipping-returns"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Shipping & Returns Policy",
          "url": "https://luxtronics.in/shipping-returns",
          "description": "Luxtronics shipping, returns, and product support policy.",
          "publisher": { "@type": "Organization", "name": "Luxtronics", "url": "https://luxtronics.in" }
        }}
      />

      <section className="container pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Policy</p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          Shipping & <span className="text-gradient">Returns</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          We want you to shop with confidence. Here's everything you need to know about our shipping and return policies.
        </p>
      </section>

      <section className="container pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Shipping */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Shipping Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Standard Shipping:</strong> 3–7 business days across India</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Express Options:</strong> Available for eligible pin codes at checkout</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Shipping Charges:</strong> Calculated and shown before payment</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Tracking link sent via email and SMS once dispatched</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Delivery timelines may vary during peak seasons and holidays</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>International shipping available to Australia and New Zealand</span></li>
          </ul>
        </article>

        {/* Returns */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <RotateCcw className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Return Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Return Eligibility:</strong> Depends on product type, condition, and applicable policy</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Products must be unused, in original packaging with all accessories</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Original invoice/receipt required for all returns</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Refund timelines depend on quality check and payment provider processing</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Refund credited to original payment method (UPI, card, bank account)</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Hygiene products and opened software are non-returnable</span></li>
          </ul>
        </article>

        {/* Refund */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Refund Policy</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Refund Review:</strong> Defective, damaged, or wrong-item cases are reviewed by support</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Return Condition:</strong> Missing accessories or damage may affect eligibility</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>COD refund method and timeline are confirmed by support</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Prepaid orders refunded to original payment source</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Shipping charges are non-refundable unless item is defective</span></li>
          </ul>
        </article>

        {/* Product coverage */}
        <article className="rounded-3xl border border-border bg-gradient-card p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl">Product Coverage</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">Coverage Varies</strong> by product, supplier, and brand policy</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Eligible manufacturing-defect cases are reviewed by support</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Physical damage, water damage, and misuse are not covered</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Claim timelines depend on product inspection and supplier response</span></li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>Brand coverage, where applicable, follows the brand's own terms</span></li>
          </ul>
        </article>
      </section>

      {/* Contact for returns */}
      <section className="container pb-24">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl mb-1">Need to initiate a return?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our support team with your order details. We'll guide you through the applicable process.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@luxtronics.in"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
            >
              Email Support
            </a>
            <a
              href="https://wa.me/919266433722?text=I%20want%20to%20initiate%20a%20return"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ShippingReturns;
