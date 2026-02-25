"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  AlertTriangle,
  GitBranch,
  FileText,
  Gift,
  Box,
  ExternalLink,
  Filter,
} from "lucide-react";
import { fetchSignals } from "@/service/api";
import { SignalType, SignalTypeEnum } from "@/types/types";

const SIGNAL_ICONS: Record<SignalTypeEnum, React.ReactNode> = {
  release: <GitBranch className="w-5 h-5" />,
  vulnerability: <AlertTriangle className="w-5 h-5" />,
  changelog: <FileText className="w-5 h-5" />,
  issue: <Zap className="w-5 h-5" />,
  bounty: <Gift className="w-5 h-5" />,
  new_repo: <Box className="w-5 h-5" />,
};

const SIGNAL_COLORS: Record<SignalTypeEnum, string> = {
  release: "text-blue-400 bg-blue-600/20 border-blue-500/30",
  vulnerability: "text-red-400 bg-red-600/20 border-red-500/30",
  changelog: "text-purple-400 bg-purple-600/20 border-purple-500/30",
  issue: "text-yellow-400 bg-yellow-600/20 border-yellow-500/30",
  bounty: "text-green-400 bg-green-600/20 border-green-500/30",
  new_repo: "text-cyan-400 bg-cyan-600/20 border-cyan-500/30",
};

const SIGNAL_TYPE_OPTIONS: { value: SignalTypeEnum | "all"; label: string }[] = [
  { value: "all", label: "All Signals" },
  { value: "release", label: "Releases" },
  { value: "vulnerability", label: "Vulnerabilities" },
  { value: "changelog", label: "Changelogs" },
  { value: "issue", label: "Issues" },
  { value: "bounty", label: "Bounties" },
  { value: "new_repo", label: "New Repos" },
];

export function RadarFeed() {
  const [signals, setSignals] = useState<SignalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<SignalTypeEnum | "all">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadSignals(1);
  }, [filterType]);

  async function loadSignals(pageNum: number) {
    setLoading(true);
    const filters = filterType !== "all" ? { signalType: filterType } : {};
    const result = await fetchSignals(filters, { page: pageNum, limit: 20 });
    
    if (pageNum === 1) {
      setSignals(result.items);
    } else {
      setSignals((prev) => [...prev, ...result.items]);
    }
    
    setHasMore(result.hasMore);
    setPage(pageNum);
    setLoading(false);
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadSignals(page + 1);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-green-500/50 flex-shrink-0" />
        {SIGNAL_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={`px-3 py-1 rounded-full font-mono text-xs whitespace-nowrap transition-colors ${
              filterType === option.value
                ? "bg-green-600/30 text-green-400 border border-green-500/50"
                : "text-green-500/50 hover:text-green-400 border border-transparent hover:border-green-500/30"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading && signals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="retro-border rounded-lg p-4 bg-black/40 animate-pulse"
            >
              <div className="h-4 bg-green-600/20 rounded w-3/4 mb-3" />
              <div className="h-3 bg-green-600/20 rounded w-full mb-2" />
              <div className="h-3 bg-green-600/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
          <p className="font-mono text-green-500/50">No signals yet</p>
          <p className="font-mono text-green-500/30 text-sm mt-2">
            Check back later for tech updates
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {signals.map((signal, index) => (
                <motion.div
                  key={signal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`retro-border rounded-lg p-4 bg-black/40 backdrop-blur-sm border ${
                    SIGNAL_COLORS[signal.signalType]
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        SIGNAL_COLORS[signal.signalType].split(" ")[1]
                      }`}
                    >
                      {SIGNAL_ICONS[signal.signalType]}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-green-500/50">
                        {formatDate(signal.publishedAt)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono ${
                          signal.score >= 80
                            ? "bg-red-600/30 text-red-400"
                            : signal.score >= 60
                            ? "bg-yellow-600/30 text-yellow-400"
                            : "bg-green-600/30 text-green-400"
                        }`}
                      >
                        {signal.score}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-mono text-sm text-green-300 mb-2 line-clamp-2">
                    {signal.title}
                  </h3>

                  <p className="font-mono text-xs text-green-500/60 mb-3 line-clamp-2">
                    {signal.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-green-500/40">
                      {signal.source}
                    </span>
                    {typeof signal.rawPayload?.htmlUrl === "string" && (
                      <a
                        href={signal.rawPayload.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-mono text-sm border border-green-500/30 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? "Loading..." : "Load More"}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
