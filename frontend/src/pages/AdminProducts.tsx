import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit3, Loader2, PackageSearch, RefreshCw, Save, Search, X } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  status: "publish" | "draft" | "pending" | "private";
  stock_status?: "instock" | "outofstock" | "onbackorder";
  sku?: string;
  categories?: WooCategory[];
  images?: { src: string; alt?: string }[];
  permalink?: string;
};

type EditForm = {
  name: string;
  regular_price: string;
  sale_price: string;
  short_description: string;
  description: string;
  status: WooProduct["status"];
  stock_status: WooProduct["stock_status"];
};

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getProductImage = (product: WooProduct) =>
  product.images?.[0]?.src || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Latest" },
  { value: "date-asc", label: "Oldest" },
  { value: "title-asc", label: "Name A-Z" },
  { value: "title-desc", label: "Name Z-A" },
  { value: "price-asc", label: "Price Low" },
  { value: "price-desc", label: "Price High" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [categories, setCategories] = useState<WooCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("publish");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [editingProduct, setEditingProduct] = useState<WooProduct | null>(null);
  const [formData, setFormData] = useState<EditForm>({
    name: "",
    regular_price: "",
    sale_price: "",
    short_description: "",
    description: "",
    status: "publish",
    stock_status: "instock",
  });
  const { toast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const sortParams = useMemo(() => {
    const [field, direction] = sort.split("-");
    if (field === "title") return { orderby: "title", order: direction };
    if (field === "price") return { orderby: "price", order: direction };
    return { orderby: "date", order: direction };
  }, [sort]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/woo/categories?per_page=100&orderby=count&order=desc");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data.filter((item) => item.name?.toLowerCase() !== "uncategorized") : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        per_page: "24",
        page: String(page),
        status,
        orderby: sortParams.orderby,
        order: sortParams.order,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category !== "all") params.set("category", category);

      const response = await fetch(`/api/woo/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to fetch WooCommerce products");
      }

      setProducts(Array.isArray(data) ? data : []);
      setTotalProducts(Number(response.headers.get("X-WP-Total") || 0));
      setTotalPages(Math.max(1, Number(response.headers.get("X-WP-TotalPages") || 1)));
    } catch (error) {
      setProducts([]);
      toast({
        title: "Could not load products",
        description: error instanceof Error ? error.message : "WooCommerce product fetch failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, status, category, sortParams.orderby, sortParams.order, debouncedSearch]);

  const handleEdit = (product: WooProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      regular_price: product.regular_price || product.price || "",
      sale_price: product.sale_price || "",
      short_description: product.short_description || "",
      description: product.description || "",
      status: product.status || "publish",
      stock_status: product.stock_status || "instock",
    });
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        regular_price: formData.regular_price ? String(formData.regular_price) : "",
        sale_price: formData.sale_price ? String(formData.sale_price) : "",
        short_description: formData.short_description,
        description: formData.description,
        status: formData.status,
        stock_status: formData.stock_status,
      };

      const response = await fetch(`/api/woo/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || "WooCommerce update failed");
      }

      toast({
        title: "WooCommerce updated",
        description: `${payload.name} was saved to the live store.`,
      });
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update WooCommerce product.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCategory("all");
    setStatus("publish");
    setSort("date-desc");
    setPage(1);
  };

  return (
    <Layout>
      <SEO title="Admin Products" description="Admin-only WooCommerce product management." url="/admin/products" noindex nofollow />

      <section className="container py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-end">
          <div>
            <Link to="/admin" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">WooCommerce live catalog</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">Product Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Search, filter, and edit products directly on the connected WooCommerce store.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="mb-5 border-border/80 bg-card/90">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_180px_150px_160px_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products, SKU, keywords..."
                  className="pl-9"
                />
              </div>
              <select
                value={category}
                onChange={(event) => { setCategory(event.target.value); setPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={String(item.id)}>{item.name}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => { setStatus(event.target.value); setPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="private">Private</option>
                <option value="any">Any status</option>
              </select>
              <select
                value={sort}
                onChange={(event) => { setSort(event.target.value); setPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <Button variant="secondary" onClick={resetFilters}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        {editingProduct && (
          <Card className="mb-5 border-primary/25 bg-primary/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="line-clamp-2 text-lg">Edit: {editingProduct.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Saving here updates WooCommerce product #{editingProduct.id}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
              <img src={getProductImage(editingProduct)} alt={editingProduct.name} className="aspect-square w-full rounded-xl border border-border bg-background object-cover" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product title</Label>
                  <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                </div>
                <div>
                  <Label htmlFor="regular_price">Regular price</Label>
                  <Input id="regular_price" inputMode="decimal" value={formData.regular_price} onChange={(event) => setFormData({ ...formData, regular_price: event.target.value })} />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale price</Label>
                  <Input id="sale_price" inputMode="decimal" value={formData.sale_price} onChange={(event) => setFormData({ ...formData, sale_price: event.target.value })} />
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <select
                    id="edit_status"
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value as WooProduct["status"] })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="stock_status">Stock status</Label>
                  <select
                    id="stock_status"
                    value={formData.stock_status}
                    onChange={(event) => setFormData({ ...formData, stock_status: event.target.value as WooProduct["stock_status"] })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="instock">In stock</option>
                    <option value="outofstock">Out of stock</option>
                    <option value="onbackorder">On backorder</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="short_description">Short description</Label>
                  <Textarea id="short_description" rows={3} value={formData.short_description} onChange={(event) => setFormData({ ...formData, short_description: event.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Full description</Label>
                  <Textarea id="description" rows={6} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <Button className="gap-2" onClick={handleSave} disabled={saving || !formData.name.trim()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save to WooCommerce
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProduct(null)} disabled={saving}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{loading ? "Loading..." : `${products.length} shown of ${totalProducts.toLocaleString()} products`}</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <PackageSearch className="mb-3 h-10 w-10 text-muted-foreground" />
              <h2 className="font-display text-xl font-bold">No products found</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try another search, category, or status filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-border/80 bg-card/90 transition hover:border-primary/30 hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-bold capitalize shadow">
                    {product.status}
                  </span>
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold shadow ${
                    product.stock_status === "instock" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {product.stock_status || "stock"}
                  </span>
                </div>
                <CardContent className="p-3">
                  <p className="mb-1 line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {product.categories?.[0]?.name || "Product"}
                  </p>
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                    {stripHtml(product.short_description || product.description) || "No description available."}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-base font-black">{product.price ? `$${product.price}` : "No price"}</p>
                      {product.regular_price && product.sale_price && product.regular_price !== product.sale_price && (
                        <p className="text-xs text-muted-foreground line-through">${product.regular_price}</p>
                      )}
                    </div>
                    <Button size="sm" className="h-8 gap-1.5 px-3" onClick={() => handleEdit(product)}>
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <span className="rounded-md border border-border px-3 py-2 text-sm font-semibold">
            {page} / {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            Next
          </Button>
        </div>
      </section>
    </Layout>
  );
}
