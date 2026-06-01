import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 1200;
const MAX_VISIBLE_MS = 2600;

const AppPreloader = () => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();

    const close = () => {
      const elapsed = performance.now() - startedAt;
      const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0);

      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setVisible(false), 520);
      }, delay);
    };

    const maxTimer = window.setTimeout(close, MAX_VISIBLE_MS);

    if (document.readyState === "complete") {
      close();
    } else {
      window.addEventListener("load", close, { once: true });
    }

    return () => {
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", close);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-500 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-label="Loading Luxtronics"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/v8.mp4?v=preloader-gan-v8-20260601"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/a3.jpg"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.05)_32%,rgba(0,0,0,0.76)_78%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-2xl" />
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/12 p-3 shadow-2xl backdrop-blur-xl sm:h-32 sm:w-32">
            <img src="/logo.jpeg" alt="Luxtronics" className="h-full w-full rounded-[1.25rem] object-cover" />
          </div>
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.42em] text-white/62">Luxtronics</p>
        <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Powering premium tech
        </h2>

        <div className="mt-8 h-1.5 w-44 overflow-hidden rounded-full bg-white/12">
          <div className="h-full w-1/2 animate-[preloader-slide_1.05s_ease-in-out_infinite] rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
};

export default AppPreloader;
