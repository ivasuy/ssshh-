"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FloatingPaths from "@/components/ui/floating-paths";
import { CardsGrid } from "@/components/cards/cards-grid";
import { CardsSearch } from "@/components/cards/cards-search";
import { CardFilters } from "@/types/types";

export default function CardsPage() {
  const [filters, setFilters] = useState<CardFilters>({});

  return (
    <div className="relative min-h-screen bg-[#0D0F1E] crt">
      <div className="fixed inset-0 z-0">
        <FloatingPaths />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-8">
            <h1 className="font-pixel text-2xl text-green-400 mb-2">
              Tech Cards
            </h1>
            <p className="font-mono text-green-500/70 text-sm">
              Quick reference cards for tech concepts, interview prep, and learning
            </p>
          </div>

          <CardsSearch filters={filters} onFiltersChange={setFilters} />
          <CardsGrid filters={filters} />
        </motion.div>
      </div>
    </div>
  );
}
