"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FloatingPaths from "@/components/ui/floating-paths";
import { LibraryGrid } from "@/components/library/library-grid";
import { LibraryFilters } from "@/components/library/library-filters";
import { ResourceFilters } from "@/types/types";

export default function LibraryPage() {
  const [filters, setFilters] = useState<ResourceFilters>({});

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
            <h1 className="font-pixel text-2xl text-green-400 mb-2">Library</h1>
            <p className="font-mono text-green-500/70 text-sm">
              Curated templates, repos, and building blocks for your projects
            </p>
          </div>

          <LibraryFilters filters={filters} onFiltersChange={setFilters} />
          <LibraryGrid filters={filters} />
        </motion.div>
      </div>
    </div>
  );
}
