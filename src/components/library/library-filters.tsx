"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { ResourceFilters } from "@/types/types";

interface LibraryFiltersProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
}

const LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Ruby",
];

const TOPICS = [
  "react",
  "nextjs",
  "vue",
  "svelte",
  "tailwindcss",
  "authentication",
  "api",
  "cli",
  "database",
  "devops",
];

export function LibraryFilters({ filters, onFiltersChange }: LibraryFiltersProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search });
  };

  const handleFilterChange = (key: keyof ResourceFilters, value: unknown) => {
    if (value === "" || value === undefined) {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    setSearch("");
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.language ||
    filters.topic ||
    filters.license ||
    filters.isTemplate ||
    filters.search;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates and repos..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 placeholder-green-500/40 focus:outline-none focus:border-green-500/60"
            />
          </div>
        </form>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-black/40 rounded-lg border border-green-500/20">
          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Language
            </label>
            <select
              value={filters.language || ""}
              onChange={(e) => handleFilterChange("language", e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 focus:outline-none focus:border-green-500/60"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Topic
            </label>
            <select
              value={filters.topic || ""}
              onChange={(e) => handleFilterChange("topic", e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 focus:outline-none focus:border-green-500/60"
            >
              <option value="">All Topics</option>
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Min Stars
            </label>
            <select
              value={filters.minStars?.toString() || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minStars",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 bg-black/60 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 focus:outline-none focus:border-green-500/60"
            >
              <option value="">Any</option>
              <option value="10">10+</option>
              <option value="100">100+</option>
              <option value="1000">1,000+</option>
              <option value="10000">10,000+</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Type
            </label>
            <select
              value={
                filters.isTemplate === true
                  ? "template"
                  : filters.isTemplate === false
                  ? "repo"
                  : ""
              }
              onChange={(e) =>
                handleFilterChange(
                  "isTemplate",
                  e.target.value === "template"
                    ? true
                    : e.target.value === "repo"
                    ? false
                    : undefined
                )
              }
              className="w-full px-3 py-2 bg-black/60 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 focus:outline-none focus:border-green-500/60"
            >
              <option value="">All Types</option>
              <option value="template">Templates Only</option>
              <option value="repo">Repos Only</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
