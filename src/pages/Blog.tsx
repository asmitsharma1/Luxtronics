import Layout from "@/components/Layout";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import laptop from "@/assets/product-laptop.png";
import camera from "@/assets/product-camera.png";
import headphones from "@/assets/product-headphones.png";

const posts = [
  { title: "Top 10 Laptops for Creators in 2025", excerpt: "Our editors round up the best machines for design, video, and code.", date: "Apr 18, 2026", img: laptop, tag: "Guides" },
  { title: "How to Choose Your Next Mirrorless Camera", excerpt: "Sensor size, lenses, video specs — we break down what matters.", date: "Apr 12, 2026", img: camera, tag: "Photography" },
  { title: "ANC vs Passive: What Actually Works", excerpt: "We tested 14 headphones in a noisy café. Here's what won.", date: "Apr 05, 2026", img: headphones, tag: "Audio" },
];

const Blog = () => (
  <Layout>
    <section className="container pt-32 pb-16">
      <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Blog</p>
      <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight">
        Stories & <span className="text-gradient">guides</span>
      </h1>
    </section>

    <section className="container pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((p) => (
        <Link
          key={p.title}
          to="#"
          className="group rounded-3xl bg-gradient-card border border-border overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1"
        >
          <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-radial opacity-50" />
            <img src={p.img} alt={p.title} loading="lazy" width={400} height={300} className="relative h-3/4 object-contain group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span className="px-2 py-1 rounded-full bg-secondary">{p.tag}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
            </div>
            <h3 className="font-display font-bold text-xl leading-tight group-hover:text-gradient transition-colors">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-3">{p.excerpt}</p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold">
              Read article <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  </Layout>
);

export default Blog;
