import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const activeCat = params.get("cat") || "all";
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    let p = products;
    if (activeCat !== "all") {
      const catName = categories.find((c) => c.slug === activeCat)?.name;
      p = p.filter((x) => x.category === catName);
    }
    if (sort === "low") p = [...p].sort((a, b) => a.price - b.price);
    if (sort === "high") p = [...p].sort((a, b) => b.price - a.price);
    if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);
    return p;
  }, [activeCat, sort]);

  return (
    <Layout>
      <section className="container pt-32 pb-16">
        <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">
          Shop
        </p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
          All <span className="text-gradient">products</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Browse our curated collection of premium electronics. Filter by category and sort to find your perfect match.
        </p>
      </section>

      <section className="container pb-24">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setParams({})}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                activeCat === "all"
                  ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                  : "border-border hover:border-foreground"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setParams({ cat: c.slug })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  activeCat === c.slug
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                    : "border-border hover:border-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:border-primary"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {list.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Shop;
