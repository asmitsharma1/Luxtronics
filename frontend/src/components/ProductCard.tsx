import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";

const badgeStyles: Record<string, string> = {
  New: "bg-foreground text-background",
  Hot: "bg-gradient-brand text-primary-foreground",
  Sale: "bg-accent text-accent-foreground",
};

const ProductCard = ({ product }: { product: Product }) => {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        className="group relative block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
        aria-label={`View ${product.name} - ${product.category}`}
        data-analytics-label={`Viewed ${product.name}`}
        data-product-id={product.id}
        data-product-name={product.name}
        data-product-slug={product.slug}
        data-product-category={product.category}
        data-product-price={product.price}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        
        <div className="relative">
          {product.badge && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "absolute left-2 top-2 z-20 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm",
                badgeStyles[product.badge]
              )}
            >
              {product.badge}
            </motion.span>
          )}

          <div className="relative aspect-square overflow-hidden bg-muted/35 p-3">
            {/* Image loading skeleton */}
            <div className="absolute inset-0 skeleton opacity-0 group-hover:opacity-0 transition-opacity" />
            
            <img
              src={product.image}
              alt={`${product.name} - ${product.category} product image`}
              loading="lazy"
              width={400}
              height={400}
              className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] will-change-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop';
              }}
            />
            
            {/* Quick view overlay */}
            <div className="absolute inset-x-2 bottom-2 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="rounded-full bg-background/95 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur">
                View details
              </span>
            </div>
          </div>

          <div className="space-y-1.5 p-2.5">
            <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>{product.category}</span>
            </p>
            <h3 className="line-clamp-2 min-h-[2.15em] text-[11px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xs">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-2.5 w-2.5",
                      star <= Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : star - 0.5 <= product.rating
                        ? "fill-amber-400/50 text-amber-400"
                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-[9px]">({product.reviews >= 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})</span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-0.5">
              <div className="min-w-0 flex flex-wrap items-baseline gap-1">
                <span className="text-sm font-bold text-foreground sm:text-[15px]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                aria-label={`Add ${product.name} to cart`}
                data-analytics-label={`Add ${product.name} to cart`}
                data-product-id={product.id}
                data-product-name={product.name}
                data-product-slug={product.slug}
                data-product-category={product.category}
                data-product-price={product.price}
              >
                <ShoppingBag className="h-3 w-3" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Micro-interaction indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </Link>
    </>
  );
};

export default ProductCard;
