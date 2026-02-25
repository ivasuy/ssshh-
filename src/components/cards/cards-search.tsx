"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CardFilters } from "@/types/types";

interface CardsSearchProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
}

const DOMAINS = [
  "general",
  "frontend",
  "backend",
  "devops",
  "database",
  "cloud",
  "security",
  "mobile",
  "ai-ml",
];

export function CardsSearch({ filters, onFiltersChange }: CardsSearchProps) {
  const [search, setSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search });
  };

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tech cards..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 placeholder-green-500/40 focus:outline-none focus:border-green-500/60"
          />
        </div>

        <select
          value={filters.domain || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              domain: e.target.value || undefined,
            })
          }
          className="px-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 focus:outline-none focus:border-green-500/60"
        >
          <option value="">All Domains</option>
          {DOMAINS.map((domain) => (
            <option key={domain} value={domain}>
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
