import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";
import { fetchStoreProducts, fetchStoreProduct, mapStoreProductToLocalProduct } from "@/services/store-api";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
  const queryClient = useQueryClient();

  const { data: storeProducts = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchStoreProducts(1, 8),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const prefetchProduct = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => fetchStoreProduct(slug),
      staleTime: 1000 * 60 * 15,
    });
  };

  const products = useMemo(() => {
    if (storeProducts.length > 0) {
      return storeProducts
        .map(mapStoreProductToLocalProduct)
        .filter((p): p is Product => p !== null);
    }
    return staticProducts;
  }, [storeProducts]);

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="flex items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-3 sm:gap-4 flex-wrap max-w-[1920px] mx-auto relative z-10">
        <div>
          <p className="text-xs sm:text-sm text-primary font-bold uppercase tracking-widest mb-3 sm:mb-4">
            Featured
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight max-w-xl leading-tight">
            Best sellers <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">this week</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-semibold rounded-full px-4 py-2 hover:bg-primary/10 transition-all"
        >
          Shop all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-[1920px] mx-auto">
        {isLoading && products.length === 0 ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          products.slice(0, 8).map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => prefetchProduct(p.slug)}
              className="animate-fade-in"
            >
              <ProductCard product={p} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};


export default FeaturedProducts;
