import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import menuData from "../data/mega-menu.json";

type MenuItem = {
  title: string;
  slug: string;
  children?: { title: string; slug: string }[];
};

const CategoryShowcase = () => {
  const [active, setActive] = useState<string | null>(null);

  const menu = menuData as MenuItem[];

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Categories</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
            Browse by Category
          </h2>
        </motion.div>

        {/* Structured category grid: parent sections with child lists */}
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menu.map((item) => (
              <div key={item.slug} className="bg-white/80 dark:bg-slate-900/60 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                  <span>{item.title}</span>
                </h3>

                <div className="flex flex-col gap-2">
                  {(item.children || []).map((child) => (
                    <Link
                      key={child.slug}
                      to={`/shop?cat=${child.slug}`}
                      className="text-sm text-slate-700 dark:text-slate-200 hover:text-primary rounded px-2 py-1"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View all categories CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all duration-300"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;