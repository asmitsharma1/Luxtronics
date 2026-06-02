import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Clock, Eye, Gauge, MousePointerClick, Package, Radio, Search, Trash2, Users } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAnalyticsEvents,
  fetchRemoteAnalyticsEvents,
  fetchRemoteLiveVisitors,
  readAnalyticsEvents,
  readLiveVisitors,
  type AnalyticsEvent,
  type LiveVisitor,
} from "@/lib/analytics";

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(timestamp);

const countBy = (events: AnalyticsEvent[], getKey: (event: AnalyticsEvent) => string | undefined) => {
  const counts = new Map<string, number>();
  events.forEach((event) => {
    const key = getKey(event);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const StatCard = ({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <Card className="border-border/70 bg-card/80">
    <CardContent className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="mt-1 font-display text-2xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => readAnalyticsEvents());
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>(() => readLiveVisitors());

  useEffect(() => {
    const refresh = async () => {
      const remoteEvents = await fetchRemoteAnalyticsEvents();
      setEvents(remoteEvents.length > 0 ? remoteEvents : readAnalyticsEvents());
      const remoteVisitors = await fetchRemoteLiveVisitors();
      setLiveVisitors(remoteVisitors.length > 0 ? remoteVisitors : readLiveVisitors());
    };
    const interval = window.setInterval(refresh, 2500);
    window.addEventListener("lux-analytics-event", refresh);
    window.addEventListener("lux-live-visitor", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("lux-analytics-event", refresh);
      window.removeEventListener("lux-live-visitor", refresh);
    };
  }, []);

  const stats = useMemo(() => {
    const pageViews = events.filter((event) => event.type === "page_view");
    const clicks = events.filter((event) => event.type === "click" || event.type === "product_intent");
    const searches = events.filter((event) => event.type === "search");
    const sections = events.filter((event) => event.type === "section_view");
    const sessions = new Set(events.map((event) => event.sessionId)).size;
    const lastHour = events.filter((event) => Date.now() - event.timestamp < 60 * 60 * 1000).length;
    const activeVisitors = liveVisitors.filter((visitor) => Date.now() - visitor.lastSeenAt < 30 * 1000);

    return { pageViews, clicks, searches, sections, sessions, lastHour, activeVisitors };
  }, [events, liveVisitors]);

  const topPages = useMemo(() => countBy(stats.pageViews, (event) => event.path).slice(0, 8), [stats.pageViews]);
  const topSections = useMemo(() => countBy(stats.sections, (event) => event.section).slice(0, 8), [stats.sections]);
  const topClicks = useMemo(() => countBy(stats.clicks, (event) => event.label).slice(0, 8), [stats.clicks]);
  const trafficSources = useMemo(() => countBy(events, (event) => `${event.source} / ${event.medium}`).slice(0, 6), [events]);
  const deviceSplit = useMemo(() => countBy(events, (event) => event.device).slice(0, 4), [events]);
  const recentEvents = events.slice(0, 18);

  const handleClear = () => {
    clearAnalyticsEvents();
    setEvents([]);
    setLiveVisitors([]);
  };

  return (
    <Layout>
      <SEO
        title="Admin Monitoring Dashboard"
        description="Admin-only Luxtronics monitoring dashboard."
        canonical="https://luxtronics.in/admin"
        noindex
        nofollow
      />

      <section className="container py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Admin only</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Site Monitoring
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track traffic sources, page views, live visitor movement, section visibility, searches, clicks, and product intent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Products
              </Button>
            </Link>
            <Button variant="destructive" className="gap-2" onClick={handleClear} disabled={events.length === 0}>
              <Trash2 className="h-4 w-4" />
              Clear local data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Live now" value={stats.activeVisitors.length} detail="Active in last 30 seconds" icon={Radio} />
          <StatCard title="Page views" value={stats.pageViews.length} detail={`${stats.lastHour} events in last hour`} icon={Eye} />
          <StatCard title="Sessions" value={stats.sessions} detail="Unique browser sessions" icon={Users} />
          <StatCard title="Clicks" value={stats.clicks.length} detail="Buttons and links" icon={MousePointerClick} />
          <StatCard title="Sections" value={stats.sections.length} detail="Viewed page sections" icon={Activity} />
          <StatCard title="Searches" value={stats.searches.length} detail="Submitted search queries" icon={Search} />
        </div>

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3 text-base">
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Live Visitor Movement
              </span>
              <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-primary">
                Refreshes every 2.5s
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Current page</th>
                    <th className="py-3 pr-4">Current section</th>
                    <th className="py-3 pr-4">Last action</th>
                    <th className="py-3 pr-4">Scroll</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {liveVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        No live sessions yet. Open the site in another tab/device and movement will appear here.
                      </td>
                    </tr>
                  ) : (
                    liveVisitors.map((visitor) => {
                      const isActive = Date.now() - visitor.lastSeenAt < 30 * 1000;
                      return (
                        <tr key={visitor.sessionId} className="border-b border-border/70">
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {isActive ? "Active" : "Idle"}
                            </span>
                          </td>
                          <td className="max-w-[220px] truncate py-3 pr-4 font-medium">{visitor.path}</td>
                          <td className="max-w-[180px] truncate py-3 pr-4">{visitor.section || "Page top"}</td>
                          <td className="max-w-[220px] truncate py-3 pr-4 text-muted-foreground">{visitor.lastAction || "Browsing"}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-3.5 w-3.5 text-primary" />
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-background">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${visitor.scrollDepth}%` }} />
                              </div>
                              <span className="text-xs font-semibold">{visitor.scrollDepth}%</span>
                            </div>
                          </td>
                          <td className="max-w-[160px] truncate py-3 pr-4 text-muted-foreground">
                            {visitor.source} / {visitor.medium}
                          </td>
                          <td className="whitespace-nowrap py-3 capitalize">{visitor.device} · {visitor.browser}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page views yet.</p>
              ) : (
                topPages.map(([path, count]) => (
                  <div key={path} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{path}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trafficSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No traffic source data yet.</p>
              ) : (
                trafficSources.map(([source, count]) => (
                  <div key={source} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{source}</span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{count}</span>
                  </div>
                ))
              )}
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Device split</p>
                <div className="flex flex-wrap gap-2">
                  {deviceSplit.map(([device, count]) => (
                    <span key={device} className="rounded-full border border-border px-3 py-1 text-xs font-semibold capitalize">
                      {device}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Most Viewed Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSections.length === 0 ? (
                <p className="text-sm text-muted-foreground">Section visibility appears after scrolling pages.</p>
              ) : (
                topSections.map(([section, count]) => (
                  <div key={section} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{section}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Clicks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topClicks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Click data appears when visitors interact.</p>
              ) : (
                topClicks.map(([label, count]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Live Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Time</th>
                    <th className="py-3 pr-4">Event</th>
                    <th className="py-3 pr-4">Page</th>
                    <th className="py-3 pr-4">Label / Section</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        No events yet. Browse the website once and this dashboard will start filling.
                      </td>
                    </tr>
                  ) : (
                    recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-border/70">
                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatTime(event.timestamp)}</td>
                        <td className="whitespace-nowrap py-3 pr-4 font-semibold">{event.type.replace("_", " ")}</td>
                        <td className="max-w-[220px] truncate py-3 pr-4">{event.path}</td>
                        <td className="max-w-[260px] truncate py-3 pr-4">{event.label || event.section || "-"}</td>
                        <td className="max-w-[180px] truncate py-3 pr-4 text-muted-foreground">
                          {event.source} / {event.medium}
                        </td>
                        <td className="whitespace-nowrap py-3 capitalize">{event.device}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
