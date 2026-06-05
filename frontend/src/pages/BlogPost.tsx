import Layout from "@/components/Layout";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getBlogPost } from "@/data/blog-posts";
import SEO from "@/components/SEO";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split("T")[0];
};

const GanChargerHeroVisual = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] items-center justify-center lg:flex">
    <div className="absolute h-80 w-80 rounded-full bg-orange-400/25 blur-3xl" />
    <div className="absolute h-72 w-72 translate-x-24 translate-y-24 rounded-full bg-pink-500/20 blur-3xl" />
    <div className="relative h-72 w-48 rounded-[2rem] border border-white/25 bg-white/15 p-3 shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-3 rounded-[1.45rem] bg-gradient-to-br from-orange-400 to-pink-500" />
      <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,255,255,0.08)_45%,rgba(0,0,0,0.22))]" />
      <div className="relative flex h-full flex-col justify-between rounded-[1.25rem] border border-white/25 bg-black/10 p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.22em]">GaN</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold">Retractable</span>
        </div>
        <div>
          <div className="font-display text-6xl font-black">80W</div>
          <p className="text-sm font-semibold text-white/78">Wall Charger</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["C1", "C2", "A"].map((port) => (
            <span key={port} className="rounded-full bg-black/30 px-2 py-1.5 text-center text-[10px] font-black">
              {port}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute -right-12 top-20 h-20 w-24 rounded-full border-[9px] border-white/65 border-b-transparent border-l-transparent" />
      <div className="absolute -right-14 top-36 h-4 w-10 rounded-full bg-white/75" />
    </div>
  </div>
);

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <Layout>
        <section className="container pt-10 pb-24 max-w-2xl text-center">
          <h1 className="font-display font-bold text-4xl tracking-tight">Article not found</h1>
          <p className="mt-4 text-muted-foreground">The blog you are looking for is unavailable.</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </section>
      </Layout>
    );
  }

  const isoDate = toIsoDate(post.date);

  return (
    <Layout>
      <SEO
        title={`${post.title} | Luxtronics Blog`}
        description={post.excerpt}
        keywords={`${post.tag}, electronics, tech guide, luxtronics`}
        url={`/blog/${post.slug}`}
        type="article"
        publishedTime={isoDate}
        image={typeof post.img === 'string' ? post.img : undefined}
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": isoDate,
            "dateModified": isoDate,
            "author": { "@type": "Organization", "name": "Luxtronics" },
            "publisher": { "@type": "Organization", "name": "Luxtronics", "url": absoluteUrl("/") },
            "image": typeof post.img === "string" ? absoluteUrl(post.img) : undefined,
            "mainEntityOfPage": absoluteUrl(`/blog/${post.slug}`),
            "url": absoluteUrl(`/blog/${post.slug}`)
          },
        ]}
      />
      <section className="container pt-10 pb-10">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </section>

      <section className="container pb-12">
        <article className="relative overflow-hidden rounded-3xl border border-border/70 min-h-[480px]">
          {post.heroVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={post.heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={post.img}
              aria-hidden="true"
            />
          ) : (
            <img
              src={post.img}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              width={1200}
              height={700}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/54 to-black/18" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.48)_52%,rgba(0,0,0,0.1)_100%)]" />
          {post.visual === "gan-charger" && <GanChargerHeroVisual />}

          <div className="relative z-10 flex min-h-[480px] items-end p-6 sm:p-10">
            <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/85">
                <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1">{post.tag}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight text-white">
                {post.title}
              </h1>
              <p className="mt-4 text-white/80 leading-relaxed">{post.excerpt}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="container pb-24 max-w-4xl">
        <div className="rounded-3xl border border-border bg-gradient-card p-7 sm:p-10 space-y-6">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}

          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-pink transition-all"
            >
              Shop related gear <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/40"
            >
              More articles
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
