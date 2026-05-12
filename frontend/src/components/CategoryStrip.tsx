import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Headphones, Watch, Laptop, Gamepad2, Camera, Package } from "lucide-react";
import { motion } from "framer-motion";
import { fetchStoreCategories } from "@/services/store-api";
import { categories as staticCategories } from "@/data/products";
import shopBgDesktop from "@/assets/shop.jpg";
import shopBgMobile from "@/assets/mob2.jpg";

const icons = {
  smartphones: Smartphone,
  audio: Headphones,
  wearables: Watch,
  laptops: Laptop,
  gaming: Gamepad2,
  cameras: Camera,
};

const CategoryStrip = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    const resizeHandler = () => {
      requestAnimationFrame(checkMobile);
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  const { data: categoryResult, isLoading } = useQuery({
    queryKey: ['categories', 'strip'],
    queryFn: () => fetchStoreCategories(1, 6),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const displayCategories = useMemo(() => {
    if (categoryResult?.data && categoryResult.data.length > 0) return categoryResult.data;
    return staticCategories;
  }, [categoryResult]);

  return (
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative bg-cover bg-center section-bg-overlay overflow-hidden"
        style={{
          backgroundImage: `url(${isMobile ? shopBgMobile : shopBgDesktop})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-40" />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40 pointer-events-none" />
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(255,107,53,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="flex items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-3 sm:gap-4 flex-wrap relative z-10 max-w-[1920px] mx-auto">
          <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl dark:bg-black/50 light:bg-white/95 backdrop-blur-2xl border dark:border-white/15 light:border-black/15 shadow-2xl">
            <p className="text-xs sm:text-sm text-primary font-bold uppercase tracking-widest mb-3 sm:mb-4">
              Shop by Category
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight max-w-xl leading-tight dark:text-white light:text-black">
              Find what <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">moves you</span>
            </h2>
          </div>
          <Link to="/categories" className="group inline-flex items-center gap-2 text-xs sm:text-sm dark:text-white light:text-black hover:text-primary transition-colors font-semibold rounded-full px-5 py-3 hover:bg-primary/10 transition-all backdrop-blur-xl border dark:border-white/10 light:border-black/10">
            View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 relative z-10 max-w-[1920px] mx-auto">
        {isLoading && displayCategories.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-card border border-border animate-pulse" />
          ))
        ) : (
          displayCategories.slice(0, 6).map((cat, index) => {
            const Icon = icons[cat.slug as keyof typeof icons] || Package;
            const count = (cat as any).productCount ?? cat.count ?? 0;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/shop?cat=${cat.slug}`}
                  className="group relative rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-card border border-border dark:border-border light:border-black/8 p-4 sm:p-5 md:p-6 text-center hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-1 hover:shadow-elegant-hover overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto rounded-xl sm:rounded-2xl md:rounded-3xl bg-secondary group-hover:bg-gradient-brand flex items-center justify-center mb-3 sm:mb-4 md:mb-5 transition-all duration-500 group-hover:shadow-glow group-hover:scale-110">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{count} items</p>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};


export default CategoryStrip;
