"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, GitFork, ExternalLink, Box } from "lucide-react";
import Link from "next/link";
import { fetchResources } from "@/service/api";
import { ResourceType, ResourceFilters } from "@/types/types";

interface LibraryGridProps {
  filters: ResourceFilters;
}

export function LibraryGrid({ filters }: LibraryGridProps) {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadResources(1);
  }, [filters]);

  async function loadResources(pageNum: number) {
    setLoading(true);
    const result = await fetchResources(filters, { page: pageNum, limit: 20 });

    if (pageNum === 1) {
      setResources(result.items);
    } else {
      setResources((prev) => [...prev, ...result.items]);
    }

    setHasMore(result.hasMore);
    setPage(pageNum);
    setLoading(false);
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadResources(page + 1);
    }
  };

  if (loading && resources.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="retro-border rounded-lg p-4 bg-black/40 animate-pulse"
          >
            <div className="h-5 bg-green-600/20 rounded w-3/4 mb-3" />
            <div className="h-3 bg-green-600/20 rounded w-full mb-2" />
            <div className="h-3 bg-green-600/20 rounded w-2/3 mb-4" />
            <div className="flex gap-2">
              <div className="h-6 bg-green-600/20 rounded w-16" />
              <div className="h-6 bg-green-600/20 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <Box className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
        <p className="font-mono text-green-500/50">No resources found</p>
        <p className="font-mono text-green-500/30 text-sm mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {resources.map((resource, index) => (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/library/${resource._id}`}>
                <div className="retro-border rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono text-sm text-green-400 truncate">
                        {resource.owner}/{resource.repo}
                      </h3>
                      {resource.isTemplate && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs font-mono">
                          Template
                        </span>
                      )}
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-green-500/50 hover:text-green-400 transition-colors ml-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="font-mono text-xs text-green-500/60 mb-4 line-clamp-2">
                    {resource.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-green-500/70">
                        <Star className="w-3 h-3" />
                        <span>{resource.stars.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-green-500/70">
                        <GitFork className="w-3 h-3" />
                        <span>{resource.forks.toLocaleString()}</span>
                      </span>
                    </div>
                    {resource.language && (
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded">
                        {resource.language}
                      </span>
                    )}
                  </div>

                  {resource.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {resource.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 bg-green-600/10 text-green-500/60 rounded text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                      {resource.topics.length > 3 && (
                        <span className="px-2 py-0.5 text-green-500/40 text-xs">
                          +{resource.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
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
