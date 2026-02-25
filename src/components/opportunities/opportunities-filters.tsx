"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import { OpportunityFilters, DifficultyLevelEnum } from "@/types/types";

interface OpportunitiesFiltersProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevelEnum | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LABEL_OPTIONS = [
  "good first issue",
  "help wanted",
  "bug",
  "enhancement",
  "documentation",
  "security",
];

export function OpportunitiesFilters({
  filters,
  onFiltersChange,
}: OpportunitiesFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof OpportunityFilters, value: unknown) => {
    if (value === "" || value === undefined || value === false) {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const toggleLabel = (label: string) => {
    const currentLabels = filters.labels || [];
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter((l) => l !== label)
      : [...currentLabels, label];

    handleFilterChange("labels", newLabels.length > 0 ? newLabels : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.difficulty || filters.labels?.length || filters.hasBounty;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-green-600/30 text-green-400 border border-green-500/50"
              : "bg-black/40 text-green-500/70 border border-green-500/30 hover:text-green-400"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-green-400" />
          )}
        </button>

        <button
          onClick={() => handleFilterChange("hasBounty", !filters.hasBounty)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
            filters.hasBounty
              ? "bg-yellow-600/30 text-yellow-400 border border-yellow-500/50"
              : "bg-black/40 text-green-500/70 border border-green-500/30 hover:text-yellow-400"
          }`}
        >
          <span>💰</span>
          <span>With Bounty</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg font-mono text-sm border border-red-500/30 hover:bg-red-600/30 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 bg-black/40 rounded-lg border border-green-500/20 space-y-4">
          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange("difficulty", option.value)}
                  className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                    filters.difficulty === option.value ||
                    (!filters.difficulty && option.value === "")
                      ? "bg-green-600/30 text-green-400 border border-green-500/50"
                      : "bg-black/40 text-green-500/50 border border-green-500/20 hover:text-green-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                    filters.labels?.includes(label)
                      ? "bg-blue-600/30 text-blue-400 border border-blue-500/50"
                      : "bg-black/40 text-green-500/50 border border-green-500/20 hover:text-blue-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
