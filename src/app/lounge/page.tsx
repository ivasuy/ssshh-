"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import FloatingPaths from "@/components/ui/floating-paths";
import { LoungeGrid } from "@/components/lounge/lounge-grid";
import { NoteForm } from "@/components/lounge/note-form";
import { useAuth } from "@/context/AuthContext";

const POST_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "NOTE", label: "Notes" },
  { value: "INSIGHT", label: "Insights" },
  { value: "HOT_TAKE", label: "Hot Takes" },
];

export default function LoungePage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const { user } = useAuth();

  const handleNoteCreated = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-pixel text-2xl text-green-400 mb-2">Lounge</h1>
              <p className="font-mono text-green-500/70 text-sm">
                Share notes, insights, and hot takes with the community
              </p>
            </div>

            {user && (
              <motion.button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-mono text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-green-500/50 flex-shrink-0" />
            {POST_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPostTypeFilter(option.value)}
                className={`px-3 py-1 rounded-full font-mono text-xs whitespace-nowrap transition-colors ${
                  postTypeFilter === option.value
                    ? "bg-green-600/30 text-green-400 border border-green-500/50"
                    : "text-green-500/50 hover:text-green-400 border border-transparent hover:border-green-500/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <LoungeGrid
            key={`${refreshKey}-${postTypeFilter}`}
            postTypeFilter={postTypeFilter !== "all" ? postTypeFilter : undefined}
          />

          <AnimatePresence>
            {showForm && (
              <NoteForm
                open={showForm}
                onOpenChange={setShowForm}
                onSuccess={handleNoteCreated}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
