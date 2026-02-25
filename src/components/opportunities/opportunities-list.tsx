"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Tag, Zap, Gift } from "lucide-react";
import { fetchOpportunities } from "@/service/api";
import { ContributionOpportunityType, OpportunityFilters } from "@/types/types";

interface OpportunitiesListProps {
  filters: OpportunityFilters;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-600/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-600/20 text-red-400 border-red-500/30",
};

export function OpportunitiesList({ filters }: OpportunitiesListProps) {
  const [opportunities, setOpportunities] = useState<ContributionOpportunityType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadOpportunities(1);
  }, [filters]);

  async function loadOpportunities(pageNum: number) {
    setLoading(true);
    const result = await fetchOpportunities(filters, { page: pageNum, limit: 20 });

    if (pageNum === 1) {
      setOpportunities(result.items);
    } else {
      setOpportunities((prev) => [...prev, ...result.items]);
    }

    setHasMore(result.hasMore);
    setPage(pageNum);
    setLoading(false);
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadOpportunities(page + 1);
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="retro-border rounded-lg p-4 bg-black/40 animate-pulse"
          >
            <div className="h-5 bg-green-600/20 rounded w-3/4 mb-3" />
            <div className="h-3 bg-green-600/20 rounded w-1/2 mb-2" />
            <div className="flex gap-2">
              <div className="h-6 bg-green-600/20 rounded w-20" />
              <div className="h-6 bg-green-600/20 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
        <p className="font-mono text-green-500/50">No opportunities found</p>
        <p className="font-mono text-green-500/30 text-sm mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="retro-border rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono border ${
                        DIFFICULTY_COLORS[opp.difficulty]
                      }`}
                    >
                      {opp.difficulty}
                    </span>
                    {opp.bountyAmount > 0 && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs font-mono border border-yellow-500/30">
                        <Gift className="w-3 h-3" />
                        <span>
                          {opp.bountyAmount} {opp.currency}
                        </span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono ${
                        opp.score >= 70
                          ? "bg-green-600/30 text-green-400"
                          : opp.score >= 40
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-gray-600/30 text-gray-400"
                      }`}
                    >
                      Score: {opp.score}
                    </span>
                  </div>

                  <h3 className="font-mono text-sm text-green-300 mb-2">
                    {opp.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-green-500/50 font-mono mb-3">
                    <span>{opp.repo}</span>
                    <span>•</span>
                    <span>#{opp.issueNumber}</span>
                  </div>

                  {opp.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {opp.labels.map((label) => (
                        <span
                          key={label}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-blue-600/10 text-blue-400/70 rounded text-xs font-mono"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-mono text-sm transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Issue</span>
                </a>
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
  );
}
