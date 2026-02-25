"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fetchCards } from "@/service/api";
import { TechCardType, CardFilters } from "@/types/types";

interface CardsGridProps {
  filters: CardFilters;
}

export function CardsGrid({ filters }: CardsGridProps) {
  const [cards, setCards] = useState<TechCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadCards(1);
  }, [filters]);

  async function loadCards(pageNum: number) {
    setLoading(true);
    const result = await fetchCards(filters, { page: pageNum, limit: 20 });

    if (pageNum === 1) {
      setCards(result.items);
    } else {
      setCards((prev) => [...prev, ...result.items]);
    }

    setHasMore(result.hasMore);
    setPage(pageNum);
    setLoading(false);
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadCards(page + 1);
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="retro-border rounded-lg p-4 bg-black/40 animate-pulse"
          >
            <div className="h-6 bg-green-600/20 rounded w-1/2 mb-3" />
            <div className="h-3 bg-green-600/20 rounded w-full mb-2" />
            <div className="h-3 bg-green-600/20 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
        <p className="font-mono text-green-500/50">No cards found</p>
        <p className="font-mono text-green-500/30 text-sm mt-2">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/cards/${card.slug}`}>
                <div className="retro-border rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer h-full group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-green-600/20 text-green-500/70 rounded text-xs font-mono mb-2">
                        {card.domain}
                      </span>
                      <h3 className="font-pixel text-lg text-green-400">
                        {card.term}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-500/30 group-hover:text-green-400 transition-colors" />
                  </div>

                  <p className="font-mono text-sm text-green-300/80 line-clamp-3 mb-4">
                    {card.shortDefinition}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      {card.useCases.length > 0 && (
                        <span className="text-green-500/50">
                          {card.useCases.length} use cases
                        </span>
                      )}
                      {card.interviewQAs.length > 0 && (
                        <span className="text-blue-500/50">
                          {card.interviewQAs.length} Q&A
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        card.qualityScore >= 70
                          ? "bg-green-600/30 text-green-400"
                          : card.qualityScore >= 40
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-red-600/30 text-red-400"
                      }`}
                    >
                      {card.qualityScore}
                    </span>
                  </div>
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
