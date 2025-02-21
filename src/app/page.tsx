"use client";

import { useState } from "react";
import { Navbar } from "@/components/nav/navbar";
import { useUser } from "@/context/UserContext";
import { GossipForm } from "@/components/gossip/gossip-form";
import { GossipGrid } from "@/components/gossip/gossip-grid";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPaths from "@/components/ui/floating-paths";

export default function Home() {
  const [location, setLocation] = useState("worldwide");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="relative min-h-screen bg-[#0D0F1E] crt">
      <div className="fixed inset-0 z-0">
        <FloatingPaths />
      </div>
      <Navbar
        user={user}
        location={location}
        setLocation={setLocation}
        onShareClick={() => setIsShareDialogOpen(true)}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {user && <GossipGrid location={location} user={user} />}
      </motion.div>
      <AnimatePresence>
        {isShareDialogOpen && (
          <GossipForm
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
