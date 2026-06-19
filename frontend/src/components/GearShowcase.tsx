import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import watchAirpodsIpad from "@/assets/flatlay-watch-airpods-ipad.jpeg";
import airpodsDramatic from "@/assets/flatlay-airpods-dramatic-light.jpeg";
import cameraGear from "@/assets/flatlay-camera-gear-dark.jpeg";
import iphoneMacbookMono from "@/assets/flatlay-iphone-macbook-mono.jpeg";
import smartwatchPhoneGrey from "@/assets/flatlay-smartwatch-phone-grey.jpeg";

type GearImage = { src: string; alt: string; caption: string };

const COLUMNS: { images: GearImage[]; range: [number, number] }[] = [
  {
    images: [
      { src: watchAirpodsIpad, alt: "Apple Watch, AirPods case and iPad on a desk", caption: "Everyday carry" },
      { src: cameraGear, alt: "Mirrorless camera, lenses and phone for content creation", caption: "Creator kit" },
    ],
    range: [70, -70],
  },
  {
    images: [{ src: airpodsDramatic, alt: "AirPods and charging case in dramatic lighting", caption: "Audio" }],
    range: [-60, 60],
  },
  {
    images: [
      { src: smartwatchPhoneGrey, alt: "Smartwatch, phone and smart ring", caption: "Wearables" },
      { src: iphoneMacbookMono, alt: "iPhone, MacBook and watch in monochrome", caption: "Workstation" },
    ],
    range: [50, -50],
  },
];

const ParallaxColumn = ({
  images,
  range,
  className,
}: {
  images: GearImage[];
  range: [number, number];
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], range.map((value) => `${value}px`));

  return (
    <motion.div ref={ref} style={{ y }} className={cn("flex flex-col gap-5", className)}>
      {images.map((image) => (
        <div
          key={image.src}
          className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <p className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
            {image.caption}
          </p>
        </div>
      ))}
    </motion.div>
  );
};

const GearShowcase = (): ReactNode => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <section className={cn("relative overflow-hidden py-20 sm:py-24", isDark ? "bg-[#070809]" : "bg-[#f4f5f7]")}>
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(circle_at_15%_10%,rgba(96,165,250,0.10),transparent_36%),radial-gradient(circle_at_85%_90%,rgba(255,255,255,0.05),transparent_32%)]"
            : "bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.07),transparent_36%),radial-gradient(circle_at_85%_90%,rgba(0,0,0,0.03),transparent_32%)]",
        )}
      />

      <div className="container relative z-10 mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-[0.25em]", isDark ? "text-sky-300" : "text-blue-600")}>
            Real setups
          </p>
          <h2 className={cn("mt-3 max-w-xl font-display text-3xl font-black sm:text-4xl lg:text-5xl", isDark ? "text-white" : "text-slate-900")}>
            Gear worth building a desk around.
          </h2>
        </div>
        <Link
          to="/shop"
          className={cn(
            "inline-flex items-center gap-2 border px-5 py-3 text-sm font-semibold backdrop-blur-md transition duration-300 hover:-translate-y-0.5",
            isDark
              ? "border-white/15 bg-white/5 text-white hover:border-sky-300/40 hover:bg-white/10"
              : "border-black/10 bg-white text-slate-800 shadow-sm hover:border-blue-400/40 hover:bg-slate-50",
          )}
        >
          Shop the edit
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="container relative z-10 grid gap-5 sm:grid-cols-3">
        {COLUMNS.map((column, index) => (
          <ParallaxColumn key={index} images={column.images} range={column.range} className={index === 1 ? "sm:mt-12" : ""} />
        ))}
      </div>
    </section>
  );
};

export default GearShowcase;
