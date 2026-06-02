import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const SEO = ({
  title = "Luxtronics — Premium Electronics & Gadgets Store",
  description = "Shop premium electronics: smartphones, audio, wearables, laptops, gaming and cameras. Curated catalog with product support information.",
  keywords = "electronics, gadgets, smartphones, laptops, audio, wearables, gaming, cameras, premium tech",
  image = "https://luxtronics.in/og-image.jpg",
  url = "https://luxtronics.in",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Luxtronics",
  canonical,
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes("Luxtronics") ? title : `${title} | Luxtronics`;
  const fullUrl = canonical || url;
  const robots = `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Luxtronics",
    "url": "https://luxtronics.in",
    "description": description,
    "inLanguage": "en",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://luxtronics.in/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Luxtronics",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxtronics.in/logo.png",
        "width": 200,
        "height": 200,
      },
    },
  };

  const dataToUse = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [defaultStructuredData];

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", author);
    updateMetaTag("robots", robots);
    updateMetaTag("googlebot", robots);
    updateMetaTag("bingbot", robots);
    updateMetaTag("theme-color", "#020617");

    // Update Open Graph tags
    updatePropertyTag("og:title", fullTitle);
    updatePropertyTag("og:description", description);
    updatePropertyTag("og:image", image);
    updatePropertyTag("og:url", fullUrl);
    updatePropertyTag("og:type", type);
    updatePropertyTag("og:site_name", "Luxtronics");
    updatePropertyTag("og:locale", "en_US");
    updatePropertyTag("og:image:width", "1200");
    updatePropertyTag("og:image:height", "630");

    // Update Twitter tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:site", "@luxtronics");
    updateMetaTag("twitter:creator", "@luxtronics");

    if (publishedTime) updatePropertyTag("article:published_time", publishedTime);
    if (modifiedTime) updatePropertyTag("article:modified_time", modifiedTime);
    if (author) updatePropertyTag("article:author", author);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullUrl);

    document.querySelectorAll('script[data-lux-seo="true"]').forEach((script) => script.remove());
    dataToUse.forEach((data, index) => {
      const structuredDataScript = document.createElement("script");
      structuredDataScript.setAttribute("type", "application/ld+json");
      structuredDataScript.setAttribute("data-lux-seo", "true");
      structuredDataScript.setAttribute("data-lux-seo-index", String(index));
      structuredDataScript.textContent = JSON.stringify(data);
      document.head.appendChild(structuredDataScript);
    });

    // Cleanup function
    return () => {
      // We don't remove the meta tags on cleanup to avoid flickering
      // They will be overwritten by the next SEO component
    };
  }, [
    fullTitle,
    description,
    keywords,
    author,
    robots,
    image,
    fullUrl,
    type,
    dataToUse,
    publishedTime,
    modifiedTime,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default SEO;
