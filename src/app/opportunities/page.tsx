"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FloatingPaths from "@/components/ui/floating-paths";
import { OpportunitiesList } from "@/components/opportunities/opportunities-list";
import { OpportunitiesFilters } from "@/components/opportunities/opportunities-filters";
import { OpportunityFilters } from "@/types/types";

export default function OpportunitiesPage() {
  const [filters, setFilters] = useState<OpportunityFilters>({});

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
              Contribution Opportunities
            </h1>
            <p className="font-mono text-green-500/70 text-sm">
              Good first issues, help wanted, and bounties from open source projects
            </p>
          </div>

          <OpportunitiesFilters filters={filters} onFiltersChange={setFilters} />
          <OpportunitiesList filters={filters} />
        </motion.div>
      </div>
    </div>
  );
}
