import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";
import { fetchStoreProducts, mapStoreProductToLocalProduct } from "@/services/store-api";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data: storeProducts = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchStoreProducts(1, 8),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const products = useMemo(() => {
    if (storeProducts.length > 0) return storeProducts.map(mapStoreProductToLocalProduct);
    return staticProducts;
  }, [storeProducts]);

  return (
    <section className="container py-16 sm:py-24 px-4 sm:px-6 lg:px-0">
      <div className="flex items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4 flex-wrap">
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium uppercase tracking-widest mb-2 sm:mb-3">
            Featured
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-xl">
            Best sellers <span className="text-gradient">this week</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
        >
          Shop all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {isLoading && products.length === 0 ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </section>
  );
};


export default FeaturedProducts;
